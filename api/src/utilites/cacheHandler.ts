const NodeCache = require('node-cache');

class CacheHandler {
    private cache;
    private static cacheHandler;

    private constructor() {
        this.cache = new NodeCache();
    }

    public static getInstance(): CacheHandler {
        if (!this.cacheHandler) {
            this.cacheHandler = new CacheHandler();
        }

        return this.cacheHandler;
    }

    public set(key: string, value: any, duration: number): void {
        this.cache.set(key, value, duration);
    }

    public get(key: string) {
        return this.cache.get(key);
    }

    public clear() {
        this.cache.clear();
    }
}

export default CacheHandler
