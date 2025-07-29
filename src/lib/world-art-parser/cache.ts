interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class ParseCache {
  private static cache = new Map<string, CacheEntry<any>>();

  static set<T>(key: string, value: T, ttl: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }

  static keys(): string[] {
    return Array.from(this.cache.keys());
  }

  static cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Мемоизация функций
  static memoize<T extends (...args: any[]) => any>(
    fn: T, 
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cached = this.get<ReturnType<T>>(key);
      
      if (cached !== null) {
        return cached;
      }
      
      const result = fn(...args);
      this.set(key, result, ttl || 60000); // 1 минута по умолчанию
      return result;
    }) as T;
  }
}
