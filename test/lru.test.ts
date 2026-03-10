import { test } from "node:test";
import assert from "node:assert/strict";
import { LRUCache } from "../src/index.ts";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("Add and remove items from lru cache with max elements", () => {
    const lru = new LRUCache({
        maxElements: 3,
        ttl: 100000
    });

    lru.set("test1", 1);
    lru.set("test2", 2);
    lru.set("test3", 3);

    assert.strictEqual(lru.get("test1"), 1);
    assert.strictEqual(lru.get("test2"), 2);
    assert.strictEqual(lru.get("test3"), 3);

    lru.set("test4", 4);

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test2"), 2);
    assert.strictEqual(lru.get("test3"), 3);
    assert.strictEqual(lru.get("test4"), 4);

    lru.get("test2");
    lru.set("test5", 5);

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test3"), null);
    assert.strictEqual(lru.get("test4"), 4);
    assert.strictEqual(lru.get("test2"), 2);
    assert.strictEqual(lru.get("test5"), 5);
});

test("Add and remove items from lru cache with max size", () => {
    const lru = new LRUCache({
        maxSize: 31,
        ttl: 100000
    });

    lru.set("test1", "1234567891");
    lru.set("test2", "1234567892");
    lru.set("test3", "1234567893");

    assert.strictEqual(lru.get("test1"), "1234567891");
    assert.strictEqual(lru.get("test2"), "1234567892");
    assert.strictEqual(lru.get("test3"), "1234567893");

    lru.set("test4", "1234567894");

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test2"), "1234567892");
    assert.strictEqual(lru.get("test3"), "1234567893");
    assert.strictEqual(lru.get("test4"), "1234567894");

    lru.get("test2");
    lru.set("test5", "1234567895");

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test3"), null);
    assert.strictEqual(lru.get("test4"), "1234567894");
    assert.strictEqual(lru.get("test2"), "1234567892");
    assert.strictEqual(lru.get("test5"), "1234567895");
});

test("Items removed by ttl from lru cache with max size", async () => {
    const lru = new LRUCache({
        maxSize: 31,
        ttl: 20
    });

    lru.set("test1", "1234567891");
    lru.set("test2", "1234567892");
    lru.set("test3", "1234567893");

    assert.strictEqual(lru.get("test1"), "1234567891");
    assert.strictEqual(lru.get("test2"), "1234567892");
    assert.strictEqual(lru.get("test3"), "1234567893");

    lru.set("test4", "1234567894");

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test2"), "1234567892");
    assert.strictEqual(lru.get("test3"), "1234567893");
    assert.strictEqual(lru.get("test4"), "1234567894");

    await sleep(20);

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test2"), null);
    assert.strictEqual(lru.get("test3"), null);
    assert.strictEqual(lru.get("test4"), null);

    lru.set("test5", "1234567895");
    lru.set("test3", "1234567893");

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test2"), null);
    assert.strictEqual(lru.get("test3"), "1234567893");
    assert.strictEqual(lru.get("test4"), null);
    assert.strictEqual(lru.get("test5"), "1234567895");
});

test("Add and remove items from lru cache with max elements with lots of fetches", () => {
    const lru = new LRUCache({
        maxElements: 3,
        ttl: 100000
    });

    lru.set("test1", 1);

    assert.strictEqual(lru.get("test1"), 1);

    lru.get("test1");
    lru.get("test1");
    lru.get("test1");
    lru.get("test1");
    lru.get("test1");
    lru.get("test1");

    assert.strictEqual(lru.get("test1"), 1);

    lru.set("test2", 2);
    lru.set("test3", 3);

    assert.strictEqual(lru.get("test1"), 1);
    assert.strictEqual(lru.get("test2"), 2);
    assert.strictEqual(lru.get("test3"), 3);

    lru.set("test4", 4);

    lru.get("test1");
    lru.get("test1");
    lru.get("test2");
    lru.get("test2");
    lru.get("test2");
    lru.get("test2");
    lru.get("test3");
    lru.get("test3");
    lru.get("test3");
    lru.get("test4");

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test2"), 2);
    assert.strictEqual(lru.get("test3"), 3);
    assert.strictEqual(lru.get("test4"), 4);

    lru.get("test2");
    lru.get("test3");
    lru.get("test4");
    lru.get("test2");
    lru.set("test5", 5);

    assert.strictEqual(lru.get("test1"), null);
    assert.strictEqual(lru.get("test3"), null);
    assert.strictEqual(lru.get("test4"), 4);
    assert.strictEqual(lru.get("test2"), 2);
    assert.strictEqual(lru.get("test5"), 5);
});