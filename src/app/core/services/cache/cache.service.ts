/**
 * CacheService — Memory + persistent cache with expiry.
 * ─────────────────────────────────────────────────────────
 * Provides a unified cache API backed by:
 *   - MemoryCacheAdapter: in-process Map, cleared on reload
 *   - PersistentCacheAdapter: localStorage with expiry timestamps
 *
 * Usage:
 *   cache.set('cases-list', data, 5 * 60 * 1000); // 5-min TTL
 *   cache.get<Case[]>('cases-list');
 *   cache.invalidate('cases-');                    // prefix clear
 */
import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  value:     T;
  expiresAt: number | null; // null = never expires
  key:       string;
}

// ── Memory cache adapter ──────────────────────────────────

export class MemoryCacheAdapter {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      key,
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  has(key: string): boolean { return this.get(key) !== null; }

  delete(key: string): void { this.store.delete(key); }

  invalidatePrefix(prefix: string): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }

  clear(): void { this.store.clear(); }

  keys(): string[] { return [...this.store.keys()]; }
}

// ── Persistent cache adapter ──────────────────────────────

export class PersistentCacheAdapter {
  private readonly prefix = 'aegislex_cache_';

  set<T>(key: string, value: T, ttlMs?: number): void {
    try {
      const entry: CacheEntry<T> = {
        key, value,
        expiresAt: ttlMs ? Date.now() + ttlMs : null,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch {}
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return entry.value;
    } catch { return null; }
  }

  has(key: string): boolean { return this.get(key) !== null; }

  delete(key: string): void { localStorage.removeItem(this.prefix + key); }

  invalidatePrefix(prefix: string): void {
    const fullPrefix = this.prefix + prefix;
    Object.keys(localStorage)
      .filter(k => k.startsWith(fullPrefix))
      .forEach(k => localStorage.removeItem(k));
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => localStorage.removeItem(k));
  }

  /** Remove all expired entries (call periodically or on app init) */
  cleanup(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => {
        try {
          const entry: CacheEntry<unknown> = JSON.parse(localStorage.getItem(k)!);
          if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            localStorage.removeItem(k);
          }
        } catch { localStorage.removeItem(k); }
      });
  }
}

// ── Unified CacheService ──────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CacheService {
  readonly memory     = new MemoryCacheAdapter();
  readonly persistent = new PersistentCacheAdapter();

  /**
   * Get from memory first, fall back to persistent cache.
   * Hydrates memory from persistent on first access.
   */
  get<T>(key: string): T | null {
    return this.memory.get<T>(key) ?? this.persistent.get<T>(key);
  }

  /**
   * Set in both memory and persistent cache.
   * @param ttlMs  time-to-live in milliseconds (omit = no expiry)
   * @param persist  also write to localStorage (default true)
   */
  set<T>(key: string, value: T, ttlMs?: number, persist = true): void {
    this.memory.set(key, value, ttlMs);
    if (persist) this.persistent.set(key, value, ttlMs);
  }

  /** Set in memory only (fast, no I/O) */
  setMemory<T>(key: string, value: T, ttlMs?: number): void {
    this.memory.set(key, value, ttlMs);
  }

  has(key: string): boolean {
    return this.memory.has(key) || this.persistent.has(key);
  }

  delete(key: string): void {
    this.memory.delete(key);
    this.persistent.delete(key);
  }

  /** Remove all cache entries whose keys start with `prefix` */
  invalidate(prefix: string): void {
    this.memory.invalidatePrefix(prefix);
    this.persistent.invalidatePrefix(prefix);
  }

  /** Clear all caches (e.g. on logout) */
  clearAll(): void {
    this.memory.clear();
    this.persistent.clear();
  }
}
