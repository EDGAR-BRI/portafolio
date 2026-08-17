import { ref } from 'vue';

interface CacheEntry<T> {
  ts: number;
  data: T;
}

const TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map<string, CacheEntry<unknown>>();

function safeGet(key: string): CacheEntry<unknown> | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return memoryCache.get(key) ?? null;
    const parsed = JSON.parse(raw) as CacheEntry<unknown>;
    return parsed;
  } catch {
    return memoryCache.get(key) ?? null;
  }
}

function safeSet(key: string, entry: CacheEntry<unknown>) {
  memoryCache.set(key, entry);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(entry));
    }
  } catch {
    // ignore quota / privacy errors
  }
}

export function getCached<T>(key: string): T | null {
  const entry = safeGet(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) return null;
  return entry.data as T;
}

export function setCached<T>(key: string, data: T) {
  safeSet(key, { ts: Date.now(), data });
}

export function clearCached(key?: string) {
  if (key) {
    memoryCache.delete(key);
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); } catch {}
  } else {
    memoryCache.clear();
    try {
      if (typeof window !== 'undefined') {
        const toRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith('gh-cache:')) toRemove.push(k);
        }
        toRemove.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch {}
  }
}

export function useCachedFetch<T>(key: string) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<T | null>(null);

  async function load(force = false): Promise<void> {
    if (!force) {
      const cached = getCached<T>(key);
      if (cached !== null) {
        data.value = cached;
        return;
      }
    }
    loading.value = true;
    error.value = null;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(key, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as T;
      setCached(key, json);
      data.value = json;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'unknown';
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, load };
}