
import * as crypto from "crypto";
import * as redis from "redis";

export class KVCache {
  protected store;
  protected timeout;
  constructor(redis, timeout = 5 * 60) {
    this.store = redis;
    this.timeout = timeout;
  }
  public attach(app) {
    app.use(async (req, res, next) => {
      let expireTime = await this._get(req.originalUrl);
      if (!expireTime) {
        expireTime = new Date().getTime();
        await this._set(req.originalUrl, expireTime);
      }
      const user = req.session ? req.session.user : undefined;
      const data: any = await this.check(req, user);
      req.cache = {
        cache: this
      };
      if (data && data.data && (data.time > expireTime)) {
        req.cache.data = data.data;
      } else {
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
    const body = req.body;
    const params = req.params;
    const query = req.query;
    const hashes: any = {
      url: this.marshall(url),
      body: this.marshall(body),
      params: this.marshall(params),
      query: this.marshall(query)
    };
    if (user) {
      hashes.user = this.marshall({ id: String(user.id) });
    }
    return this.sign(hashes);
  }
  public async check(req, user = null) {
    const key = this.generate(req, user);
    return await this._get(key);
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
    params = params || {};
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
}
