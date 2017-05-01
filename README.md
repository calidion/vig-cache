[![Build Status](https://travis-ci.org/calidion/vig-cache.svg?branch=master)](https://travis-ci.org/calidion/vig-cache)
[![Coverage Status](https://coveralls.io/repos/github/calidion/vig-cache/badge.svg?branch=master)](https://coveralls.io/github/calidion/vig-cache?branch=master)

# KVCache

 Key-value based Cache taking url, params, query and session info into account.
 
 Very simple to use. JSON is recommanded, but String can be saved too.

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

const KVCache = new KVCache(redis);
KVCache.setJSON(req, user, {value: 100});
KVCache.getJSON(req, user);
KVCache.set(req, user, 'string');
let saved = KVCache.get(req, user');
KVCache.clear(req);   // For Both JSON and String
```

## Setting travis and coveralls badges
1. Sign in to [travis](https://travis-ci.org/) and activate the build for your project.
2. Sign in to [coveralls](https://coveralls.io/) and activate the build for your project.
3. Replace calidion/vig-cache with your repo details like: "ospatil/generator-node-typescript".
