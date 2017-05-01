[![Build Status](https://travis-ci.org/calidion/vig-cache.svg?branch=master)](https://travis-ci.org/calidion/vig-cache)
[![Coverage Status](https://coveralls.io/repos/github/calidion/vig-cache/badge.svg?branch=master)](https://coveralls.io/github/calidion/vig-cache?branch=master)

# KVCache

 Key-value based Cache taking url, params, query and session info into account.
 
 Very simple to use. JSON is recommanded, but String can be saved too.
 
# Improvement

Before:
```
Requests per second:    12.98 [#/sec] (mean)
```

After:
```
Requests per second:    307.32 [#/sec] (mean)
```

## Usage

```ts
// for ts
import { KVCache } from "vig-cache";
import * as redis from "redis";
```
or
```js
// for js
const KVCache = require('vig-cache').KVCache;
const Redis = require("redis");
```
then

```
let config = {
  host: '127.0.0.1',
  port: 6379,
  db: 0
};
let redis = Redis.createClient(config);

const cache = new KVCache(redis);

// JSON storage
await cache.setJSON(req, user, {value: 100});
await cache.getJSON(req, user);

// String storage

await cache.set(req, user, 'string');
let saved = await KVCache.get(req, user');
await cache.clear(req);   // For Both JSON and String

// with Expressjs

cache.attach(app)

app.get('/', async function(req, res) {
  if (req.cache.data) {
     return res.send(req.cache.data.text)
  }
 await req.cache.setJSON(req, user, {text: 'toBeCached'});
 res.send('toBeCached');
});
```

## Setting travis and coveralls badges
1. Sign in to [travis](https://travis-ci.org/) and activate the build for your project.
2. Sign in to [coveralls](https://coveralls.io/) and activate the build for your project.
3. Replace calidion/vig-cache with your repo details like: "ospatil/generator-node-typescript".
