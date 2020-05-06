import { ILocalCache } from "@paperbits/common/caching";
import { Bag } from "@paperbits/common";

export class MockCache implements ILocalCache {
    private cache: Bag<any>;

    constructor() {
        this.cache = {};
    }

    /**
     * Returns keys of all cached items.
     */
    public getKeys(): string[] {
        return Object.keys(this.cache);
    }

    /**
     * Creates/updates cached item.
     * @param key 
     * @param value 
     */
    public setItem(key: string, value: any): void {
        this.cache[key] = value;
    }

    /**
     * Retuns cached item by key.
     * @param key 
     */
    public getItem<T>(key: string): T {
        return this.cache[key];
    }

    /**
     * Returns space occupied by cache (if supported);
     */
    public getOccupiedSpace?(): number {
        return Object.keys(this.cache).length;
    }

    /**
     * Returns remaining space (if supported)
     */
    public getRemainingSpace?(): number {
        return 99999999;
    }

    /**
     * Registers a listener for cache changes.
     * @param callback
     */
    public addChangeListener(callback: () => void): void {
        // 
    }

    /**
     * Removes element by key.
     * @param key 
     */
    public removeItem(key: string): void {
        delete this.cache[key];
    }

    /**
     * Clears cache.
     */
    public clear(): void {
        this.cache = {};
    }
}