[![Build Status](https://travis-ci.org/calidion/vig-cache.svg?branch=master)](https://travis-ci.org/calidion/vig-cache)
[![Coverage Status](https://coveralls.io/repos/github/calidion/vig-cache/badge.svg?branch=master)](https://coveralls.io/github/calidion/vig-cache?branch=master)

# KVCache

 Key-value based Cache taking url, params, query and session info into account.
 
 Very simple to use. JSON is recommanded, but String can be saved too.

```ts
import { KVCache } from "vig-cache";
import * as redis from "redis";

let config = {
  host: '127.0.0.1',
  port: 6379,
  db: 0
};
let redis = Redis.createClient(config);

const KVCache = new KVCache(redis);
KVCache.setJSON('key', user, {value: 100});
KVCache.getJSON('key', user);
KVCache.set('key', user, 'string');
let saved = KVCache.get('key', user');
KVCache.clear('key');   // For Both JSON and String
```

- To use the `KVCache` class in a JavaScript file -

```js
const KVCache = require('vig-cache').KVCache;
const Redis = require("redis");

let config = {
  host: '127.0.0.1',
  port: 6379,
  db: 0
};

let redis = Redis.createClient(config);

const KVCache = new KVCache('World!');
const user = req.session.user;

KVCache.setJSON('key', user, {value: 100});
let saved = KVCache.getJSON('key', user);
KVCache.set('key', user, 'string');
let saved = KVCache.get('key', user');
KVCache.clear('key');   // For Both JSON and String
```

## Setting travis and coveralls badges
1. Sign in to [travis](https://travis-ci.org/) and activate the build for your project.
2. Sign in to [coveralls](https://coveralls.io/) and activate the build for your project.
3. Replace calidion/vig-cache with your repo details like: "ospatil/generator-node-typescript".
