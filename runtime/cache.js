const STORE = new Map();

export function getCacheEntry(key) {
  const entry = STORE.get(key);
  if (!entry) return null;

  if (entry.expires_at <= Date.now()) {
    STORE.delete(key);
    return null;
  }

  return entry.value;
}

export function setCacheEntry(key, value, ttlMs = 5000) {
  const ttl = Number(ttlMs ?? 0);
  const expiresAt = Date.now() + (Number.isFinite(ttl) && ttl > 0 ? ttl : 0);
  STORE.set(key, {
    value,
    expires_at: expiresAt,
  });
  return value;
}

export async function getOrSetCacheEntry(key, producer, ttlMs = 5000) {
  const cached = getCacheEntry(key);
  if (cached !== null) {
    return cached;
  }

  const value = await producer();
  return setCacheEntry(key, value, ttlMs);
}

export function clearCacheEntry(key) {
  STORE.delete(key);
}

export function clearAllCache() {
  STORE.clear();
}

export function getCacheStats() {
  return {
    keys: Array.from(STORE.keys()),
    size: STORE.size,
    ts: Date.now(),
  };
}
