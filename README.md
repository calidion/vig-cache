[![Build Status](https://travis-ci.org/calidion/vig-cache.svg?branch=master)](https://travis-ci.org/calidion/vig-cache.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/calidion/vig-cache/badge.svg?branch=master)](https://coveralls.io/github/calidion/vig-cache?branch=master)

# KVCache

 Key-value based Cache taking params, queries, session info into account

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
KVCache.set('key', 'vaule');
KVCache.get('key');
KVCache.clear('key');
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
KVCache.set('key', 'vaule');
KVCache.get('key');
KVCache.clear('key');
```

## Setting travis and coveralls badges
1. Sign in to [travis](https://travis-ci.org/) and activate the build for your project.
2. Sign in to [coveralls](https://coveralls.io/) and activate the build for your project.
3. Replace calidion/vig-cache with your repo details like: "ospatil/generator-node-typescript".
