/**
 * Offline cache for InspectIQ — uses IndexedDB to store inspection data locally.
 * Inspectors in basements/crawl spaces with no signal can still access their work.
 */

const DB_NAME = 'inspectiq-offline'
const DB_VERSION = 1
const INSPECTIONS_STORE = 'inspections'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface CachedRecord<T> {
  data: T
  cachedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(INSPECTIONS_STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function cacheInspections(inspections: object[]): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(INSPECTIONS_STORE, 'readwrite')
    const store = tx.objectStore(INSPECTIONS_STORE)
    for (const inspection of inspections) {
      store.put({ ...(inspection as Record<string, unknown>), _cachedAt: Date.now() })
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Silently fail — offline cache is best-effort
  }
}

export async function getCachedInspections<T>(): Promise<T[]> {
  try {
    const db = await openDB()
    const tx = db.transaction(INSPECTIONS_STORE, 'readonly')
    const store = tx.objectStore(INSPECTIONS_STORE)
    const all = await new Promise<T[]>((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    })
    // Filter out stale entries
    return all.filter((item) => {
      const record = item as unknown as { _cachedAt?: number }
      return !record._cachedAt || Date.now() - record._cachedAt < CACHE_TTL_MS
    })
  } catch {
    return []
  }
}

export async function cacheInspectionDetail(id: string, data: object): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(INSPECTIONS_STORE, 'readwrite')
    tx.objectStore(INSPECTIONS_STORE).put({ id, ...data, _cachedAt: Date.now() })
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Silently fail
  }
}

export async function getCachedInspectionDetail<T>(id: string): Promise<T | null> {
  try {
    const db = await openDB()
    const tx = db.transaction(INSPECTIONS_STORE, 'readonly')
    const result = await new Promise<T | null>((resolve, reject) => {
      const req = tx.objectStore(INSPECTIONS_STORE).get(id)
      req.onsuccess = () => resolve((req.result as T) ?? null)
      req.onerror = () => reject(req.error)
    })
    if (!result) return null
    const record = result as unknown as { _cachedAt?: number }
    if (record._cachedAt && Date.now() - record._cachedAt > CACHE_TTL_MS) return null
    return result
  } catch {
    return null
  }
}
