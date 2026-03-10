export type LRUCacheOptions = ({
    maxSize: number;
} | {
    maxElements: number;
}) & {
    ttl: number;
};

interface CacheItemData<K, V> {
    value: V;
    next: K | null;
    prev: K | null;
}

interface CacheItem<K, V> extends CacheItemData<K, V> {
    size: number;
    created: number;
}

export class LRUCache<K, V> {
    options: LRUCacheOptions;

    data: Map<K, CacheItem<K, V>>;
    tail: K | null;
    first: K | null;
    currentSize: number;
    currentElementCount: number;

    constructor(options: LRUCacheOptions) {
        this.options = options;

        this.data = new Map();
        this.currentSize = 0;
        this.currentElementCount = 0;
        this.tail = null;
        this.first = null;
    }

    set(key: K, value: V) {
        if (("maxSize" in this.options && this.currentSize >= this.options.maxSize)
            || ("maxElements" in this.options && this.currentElementCount >= this.options.maxElements)) {
            if (this.first) {
                this.delete(this.first);
            }
        }

        const existingData = this.data.get(key);
        const prevTail = this.tail;
        this.tail = key;
        if (this.first === null) {
            this.first = key;
        }

        if (existingData) {
            // Remove old size
            this.currentSize -= existingData.size;
        } else {
            this.currentElementCount++;
        }
        
        const data: CacheItemData<K, V> = {
            value,
            next: null,
            prev: prevTail
        };

        if (prevTail) {
            const existingTail = this.data.get(prevTail);
            if (existingTail) {
                existingTail.next = key;
            }
        }

        this.data.set(key, {
            created: performance.now(),
            size: "maxSize" in this.options ? this.#calcSize(data) : 0,
            ...data
        });

        if ("maxSize" in this.options) {
            this.currentSize += this.#calcSize(data);
        }
    }

    get(key: K): V | null {
        const existingData = this.data.get(key);
        if (existingData) {
            if (performance.now() - existingData.created < this.options.ttl) {
                this.moveToTop(key, existingData);

                return existingData.value;
            } else {
                this.delete(key);
            }
        }

        return null;
    }

    delete(key: K): boolean {
        const existingData = this.data.get(key);
        if (existingData) {
            this.currentSize -= existingData.size;
            this.currentElementCount--;
            this.data.delete(key);

            if (this.tail === key) {
                this.tail = existingData.prev;
                if (this.tail) {
                    const tailData = this.data.get(this.tail);
                    if (tailData) {
                        tailData.next = null;
                    }
                }
            } else if (this.first === key) {
                this.first = existingData.next;
                if (this.first) {
                    const firstData = this.data.get(this.first);
                    if (firstData) {
                        firstData.prev = null;
                    }
                }
            } else {
                const nextItem = existingData.next ? this.data.get(existingData.next) : null;
                const previousItem = existingData.prev ? this.data.get(existingData.prev) : null;

                if (previousItem) {
                    previousItem.next = existingData.next;
                }
                if (nextItem) {
                    nextItem.prev = existingData.prev
                }
            }

            return true;
        }

        return false;
    }

    moveToTop(key: K, existingData: CacheItem<K, V>) {
        if (key === this.tail) {
            // No need to do anything
            return;
        }

        if (key === this.first) {
            this.first = existingData.next;
            const nextItem = existingData.next ? this.data.get(existingData.next) : null;

            if (nextItem) {
                nextItem.prev = null;
            }
        } else {
            // Normal case: remove this item from the middle
            const nextItem = existingData.next ? this.data.get(existingData.next) : null;
            const previousItem = existingData.prev ? this.data.get(existingData.prev) : null;

            if (previousItem) {
                previousItem.next = existingData.next;
            }
            if (nextItem) {
                nextItem.prev = existingData.prev
            }
        }

        // Then add on us as a tail
        // Tail points to us and set us to tail
        const existingTail = this.tail;
        const existingTailData = this.data.get(existingTail!);
        if (existingTailData) {
            existingTailData.next = key;
        }

        this.tail = key;
        existingData.prev = existingTail;
    }

    clear() {
        this.data.clear();
        this.currentSize = 0;
        this.currentElementCount = 0;
        this.tail = null;
        this.first = null;
    }

    #calcSize(item: CacheItemData<K, V>) {
        if (typeof item.value === "string") {
            return this.#keyLength(item.next) + this.#keyLength(item.prev) + item.value.length;
        } else {
            return 1;
        }
    }

    #keyLength(key: K | null): number {
        return key && typeof key === "string" ? key.length : 0;
    }
}