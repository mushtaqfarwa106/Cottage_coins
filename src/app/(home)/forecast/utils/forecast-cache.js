const STORAGE_NS = "cottage_coins_ai_forecast";
const STORAGE_VERSION = 1;

/** Max age for cached forecast payload (per tab). */
export const FORECAST_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function storageKey(userId) {
  return `${STORAGE_NS}_v${STORAGE_VERSION}_${String(userId)}`;
}

function normalizePayload(data) {
  return {
    summary: data?.summary ?? "",
    forecast: Array.isArray(data?.forecast) ? data.forecast : [],
    budgetRecommendations: Array.isArray(data?.budgetRecommendations)
      ? data.budgetRecommendations
      : [],
    insights: Array.isArray(data?.insights) ? data.insights : [],
  };
}

/**
 * @param {string} userId
 * @param {number} [ttlMs]
 * @returns {ReturnType<typeof normalizePayload> | null}
 */
export function loadCachedForecast(userId, ttlMs = FORECAST_CACHE_TTL_MS) {
  if (typeof window === "undefined" || !userId) return null;
  const key = storageKey(userId);
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record || typeof record.savedAt !== "number" || record.payload == null) {
      sessionStorage.removeItem(key);
      return null;
    }
    if (Date.now() - record.savedAt > ttlMs) {
      sessionStorage.removeItem(key);
      return null;
    }
    return normalizePayload(record.payload);
  } catch {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return null;
  }
}

/**
 * @param {string} userId
 * @param {object} payload
 */
export function saveCachedForecast(userId, payload) {
  if (typeof window === "undefined" || !userId) return;
  const key = storageKey(userId);
  try {
    const record = {
      savedAt: Date.now(),
      payload: normalizePayload(payload),
    };
    sessionStorage.setItem(key, JSON.stringify(record));
  } catch {
    /* quota or private mode */
  }
}
