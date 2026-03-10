# simple-lru-cache

Node.js in-memory LRU cache with a limited feature-set to replace https://github.com/isaacs/node-lru-cache

Supported options:

```js
new LRUCache({
    maxElements: 3,
    ttl: 100000 // in milliseconds
});
```

```js
new LRUCache({
    maxSize: 3000, // Works for string values, based on length of string
    ttl: 100000 // in milliseconds
});
```