
import { KVCache } from "../src/cache";
import * as config from "./config/redis";
import * as Redis from "redis";
import * as assert from "assert";
import * as express from "express";
import * as request from "supertest";

let redis = Redis.createClient(config);
let cache;
let app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
let cookies;

app.use(session({
  secret: 'sfddsfs',
  store: new RedisStore(config),
  cookie: {
    secure: false
  },
  resave: false,
  saveUninitialized: false
}));


describe("Cache", () => {
  it("should create kvCache", () => {
    cache = new KVCache(redis, 1);
    cache = new KVCache(redis);
    cache.sign();
    cache.attach(app);
    cache.check({});
    cache.check({}, {});
    cache.clear('/', null);
    cache.clear({
      originalUrl: '/cache'
    }, null);
  });

  it("should marshall an buffer", () => {
    let a = cache.marshall(new Buffer('xsdfisfidf'));
    assert(a === '');
  });

  it("should marshall an object", () => {
    let a = cache.marshall({});
    assert(a === '');
    let b = cache.marshall({ a: 100 });
    assert(b === 'a=100');
  });

  it("should marshall an object", () => {
    let a = cache.marshall({});
    assert(a === '');
    let b = cache.marshall({ a: 100 });
    assert(b === 'a=100');
  });

  it("should generate", () => {
    let a = cache.generate({}, { id: 1 });
    let a1 = cache.generate({}, { id: 1 });
    let b = cache.generate({});
    let c = cache.generate({ body: { b: 1 }, params: { a: 1 } });
    let d = cache.generate({ body: { b: 1 }, params: { a: 1 } }, { id: 1 });
    assert(a === a1);
    assert(a !== b);
    assert(a !== c);
    assert(c !== b);
    assert(c !== d);
  });

  it("should set a k", async () => {
    await cache._set('a', 100);
    let data = await cache._get('a');
    assert(data === 100);
    await cache._clear('a');
    data = await cache._get('a');
    assert(typeof data === 'undefined');
  });

  it("should _promise", (done) => {
    let func = cache._promise(null, function (error) {
      assert(error);
      done();
    });
    func(true);
  });


  it("should set req", async () => {
    await cache.set({}, null, 100);
    let data = await cache.get({});
    assert(data.data === 100);
    assert(data.time);
    await cache.clear({});
    data = await cache.get({});
    assert(typeof data === 'undefined');
  });

  it("should set req with user", async () => {
    await cache.set({}, { id: 1 }, 100);
    let data = await cache.get({}, { id: 1 });
    assert(data.data === 100);
    assert(data.time);
    await cache.clear({}, { id: 1 });
    data = await cache.get({}, { id: 1 });
    assert(typeof data === 'undefined');
  });

  it("should request with cache", (done) => {
    app.get('/', function (req, res) {
      res.send('ok');
    });
    request(app).get('/').end(function (err, res) {
      assert(!err);
      assert(res.text === 'ok');
      done();
    });
  });
  it("should request with cache", (done) => {
    cache._clear('/');
    request(app).get('/').end(function (err, res) {
      assert(!err);
      assert(res.text === 'ok');
      done();
    });
  });

  it("should request with cookies", (done) => {
    app.get('/cache', function (req, res) {
      if (req.cache.data) {
        return res.send(req.cache.data);
      }
      let user = {
        id: 100
      };
      req.session.user = user;
      req.cache.cache.set(req, user, 'hello').then(async function () {
        let data = await req.cache.cache.get(req, user);

        res.send('cache');
      });
    });
    request(app).get('/cache').end(function (err, res) {
      let re = new RegExp('; path=/; httponly', 'gi');
      cookies = res.headers['set-cookie']
        .map(function (r) {
          return r.replace(re, '');
        }).join("; ");
      assert(!err);
      assert(res.text === 'cache');
      done();
    });
  });

  it("should get cache", (done) => {
    var req = request(app).get('/cache');
    req.cookies = cookies;
    req.end(function (err, res) {
      assert(!err);
      assert(res.text === 'hello');
      done();
    });
  });
  it("should get cache", (done) => {
    var req = request(app).get('/cache');
    req.end(function (err, res) {
      assert(!err);
      assert(res.text === 'cache');
      done();
    });
  });
});
