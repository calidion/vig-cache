
import * as crypto from "crypto";
import * as redis from "redis";

export class KVCache {
  protected store;
  protected timeout;
  protected name;
  /**
   * Constructor for KVCache
   *
   * @param redis Redis instance
   * @param timeout timeout for cache, defaults to 5 minutes.
   * @param name which session name do you choose to use? MUST have the id property.
   */
  constructor(redis, timeout = 5 * 60, name = "user") {
    this.store = redis;
    this.timeout = timeout;
    this.name = name;
  }
  /**
   *
   * @param app expressjs compatible server instance
   */
  public attach(app) {
    app.use(async (req, res, next) => {
      let expireTime = await this._get(req.originalUrl);
      if (!expireTime) {
        expireTime = new Date().getTime();
        await this._set(req.originalUrl, expireTime);
      }
      let user;
      if (req.session && req.session[this.name]) {
        user = req.session[this.name];
      }
      const data: any = await this.getJSON(req, user);
      req.cache = {
        cache: this
      };
      if (data && data.time && (data.time - 0 > expireTime)) {
        req.cache.data = data;
      } else {
        this.clear(req);
        this.clear(req, user);
      }
      next();
    });
  }

  public sign(params) {
    const temp = this.marshall(params || {});
    const tempBuff = new Buffer(temp);
    const crypt = crypto.createHash("MD5");
    crypt.update(tempBuff);
    return crypt.digest("hex").toUpperCase();
  }
  public generate(req, user = null) {
    const url = req.originalUrl;
    const params = req.params;
    const query = req.query;
    const hashes: any = {
      params: this.marshall(params),
      query: this.marshall(query),
      url: this.marshall(url)
    };
    if (user) {
      hashes.user = this.marshall({ id: String(user.id) });
    }
    return this.sign(hashes);
  }

  public async get(req, user = null) {
    const k = this.generate(req, user);
    return await this._get(k);
  }
  public async set(req, user = null, data) {
    const k = this.generate(req, user);
    await this._set(k, {
      data,
      time: new Date().getTime()
    });
  }
  public clear(req, user = null) {
    const k = this.generate(req, user);
    this._clear(k);
  }

  public async getJSON(req, user = null) {
    const k = this.generate(req, user);
    return await this._getJSON(k);
  }

  public async setJSON(req, user = null, data) {
    if (typeof data !== 'object') {
      return Promise.resolve();
    }
    const k = this.generate(req, user);
    data.time = String(new Date().getTime());
    await this._setJSON(k, data);
  }

  protected marshall(params) {
    if (params instanceof Buffer) {
      try {
        params = JSON.parse(String(params));
      } catch (e) {
        return "";
      }
    }
    if (typeof params !== "object") {
      return "";
    }
    const keys = Object.keys(params).sort();
    const obj = {};
    const kvs = [];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (params[k]) {
        obj[k] = params[k];
        kvs.push(keys[i] + "=" + params[k]);
      }
    }
    return kvs.join("&");
  }

  protected _promise(resolve, reject, cb = null) {
    return (error, data) => {
      if (error) {
        return reject(error);
      }
      if (cb instanceof Function && data) {
        cb(data);
      } else {
        resolve();
      }
    };
  }
  protected _get(k) {
    return new Promise((resolve, reject) => {
      this.store.get(k, this._promise(resolve, reject, (data) => {
        resolve(JSON.parse(data));
      }));
    });
  }
  protected _set(k, v) {
    v = JSON.stringify(v);
    return new Promise((resolve, reject) => {
      this.store.set(k, v, "EX", this.timeout, this._promise(resolve, reject));
    });
  }
  protected _clear(k) {
    this.store.del(k);
  }

  protected _promiseJSON(resolve, reject) {
    return (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      resolve(data);
    }
  }

  protected _getJSON(k) {
    return new Promise((resolve, reject) => {
      this.store.hgetall(k, this._promiseJSON(resolve, reject));
    });
  }
  protected _setJSON(k, v) {
    return new Promise((resolve, reject) => {
      this.store.hmset(k, v, this._promiseJSON(resolve, reject));
    });
  }
}
