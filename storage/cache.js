// Redis & In-Memory Cache layer for DevLocker.
// Minimizes load on the database (Supabase / disk) by caching folder listings,
// file metadata, existence checks, usage totals, and small files with a configurable
// TTL (default: 12 hours). When files or folders are modified, affected cache keys
// are immediately invalidated to maintain consistency.
const { Readable } = require('node:stream');
const Redis = require('ioredis');

const DEFAULT_TTL_HOURS = 12;
const DEFAULT_PREFIX = 'pocketcode:';

function sanitizeRedisUrl(raw) {
  if (!raw) return '';
  let url = raw.trim();
  const hasTls = /--tls\b/i.test(url) || url.startsWith('rediss://');
  // Strip command-line wrappers like "redis-cli --tls -u"
  url = url.replace(/^redis-cli\s+/i, '');
  url = url.replace(/--tls\s+/i, '');
  url = url.replace(/-u\s+/i, '');
  url = url.trim();

  // Upstash and secure Redis endpoints require TLS via rediss:// protocol
  if (hasTls || (url.includes('upstash.io') && url.startsWith('redis://'))) {
    url = url.replace(/^redis:\/\//i, 'rediss://');
  }
  return url;
}

function createCache(env) {
  const ttlHours = Number(env.CACHE_TTL_HOURS) || (Number(env.REDIS_TTL_SEC) ? Number(env.REDIS_TTL_SEC) / 3600 : DEFAULT_TTL_HOURS);
  const ttlSec = Math.max(60, Math.round(ttlHours * 3600)); // default: 43200 seconds (12h)
  const prefix = env.REDIS_PREFIX || DEFAULT_PREFIX;
  const maxFileBytes = (Number(env.CACHE_FILE_MAX_MB) || 5) * 1024 * 1024; // 5 MB

  let redisUrl = sanitizeRedisUrl(env.REDIS_URL || '');
  if (!redisUrl && env.REDIS_HOST) {
    const auth = env.REDIS_PASSWORD ? `:${encodeURIComponent(env.REDIS_PASSWORD)}@` : '';
    redisUrl = `redis://${auth}${env.REDIS_HOST}:${env.REDIS_PORT || 6379}`;
  }

  const stats = { hits: 0, misses: 0, writes: 0, invalidations: 0 };

  // In-memory fallback cache (used when REDIS_URL is not provided or Redis is temporarily down)
  const memStore = new Map();
  const memCache = {
    get(key) {
      const item = memStore.get(key);
      if (!item) return null;
      if (item.exp && item.exp < Date.now()) {
        memStore.delete(key);
        return null;
      }
      return item.val;
    },
    set(key, val, expireSec = ttlSec) {
      memStore.set(key, {
        val,
        exp: expireSec ? Date.now() + expireSec * 1000 : null,
      });
      // Periodically clean up expired items if store grows
      if (memStore.size > 2000) {
        const now = Date.now();
        for (const [k, v] of memStore.entries()) {
          if (v.exp && v.exp < now) memStore.delete(k);
        }
      }
    },
    del(...keys) {
      for (const k of keys) memStore.delete(k);
    },
    delPattern(pattern) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const k of memStore.keys()) {
        if (regex.test(k)) memStore.delete(k);
      }
    },
    flush() {
      memStore.clear();
    },
  };

  let redisClient = null;
  let isRedisReady = false;

  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        keyPrefix: prefix,
        connectTimeout: 5000,
        retryStrategy(times) {
          if (times > 10) return 30000;
          return Math.min(times * 1000, 5000);
        },
      });

      const maskedUrl = redisUrl.replace(/:\/\/[^@]*@/, '://***@');
      redisClient.on('connect', () => {
        isRedisReady = true;
        console.log(`[Cache] Connected to Redis (${maskedUrl}) with ${ttlHours}h TTL`);
      });
      redisClient.on('ready', () => { isRedisReady = true; });
      redisClient.on('close', () => { isRedisReady = false; });
      redisClient.on('error', (err) => {
        isRedisReady = false;
        if (!redisClient._loggedOnce) {
          console.warn(`[Cache] Redis connection issue: ${err.message}. Using in-memory fallback.`);
          redisClient._loggedOnce = true;
        }
      });

      redisClient.connect().catch(() => {});
    } catch (e) {
      console.warn(`[Cache] Could not init Redis (${e.message}). Using in-memory fallback.`);
    }
  } else {
    console.log(`[Cache] REDIS_URL not configured — active in-memory cache (${ttlHours}h TTL)`);
  }

  const cache = {
    ttlHours,
    ttlSec,
    maxFileBytes,
    prefix,
    isRedis: () => isRedisReady,
    status: () => ({
      provider: isRedisReady ? 'redis' : 'in-memory',
      ttlHours,
      ttlSec,
      stats: { ...stats },
      inMemoryEntries: memStore.size,
    }),

    async getJson(key) {
      if (isRedisReady && redisClient) {
        try {
          const raw = await redisClient.get(key);
          if (raw != null) {
            stats.hits++;
            return JSON.parse(raw);
          }
        } catch (e) {
          // Redis read error, fall back to memory
        }
      }
      const val = memCache.get(key);
      if (val !== null) stats.hits++;
      else stats.misses++;
      return val;
    },

    async setJson(key, val, expireSec = ttlSec) {
      stats.writes++;
      if (isRedisReady && redisClient) {
        try {
          await redisClient.set(key, JSON.stringify(val), 'EX', expireSec);
        } catch (e) {}
      }
      memCache.set(key, val, expireSec);
    },

    async getBuffer(key) {
      if (isRedisReady && redisClient) {
        try {
          const buf = await redisClient.getBuffer(key);
          if (buf) {
            stats.hits++;
            return buf;
          }
        } catch (e) {}
      }
      const val = memCache.get(key);
      if (val) stats.hits++;
      else stats.misses++;
      return val;
    },

    async setBuffer(key, buffer, expireSec = ttlSec) {
      stats.writes++;
      if (isRedisReady && redisClient) {
        try {
          await redisClient.set(key, buffer, 'EX', expireSec);
        } catch (e) {}
      }
      memCache.set(key, buffer, expireSec);
    },

    async del(...keys) {
      stats.invalidations++;
      if (isRedisReady && redisClient) {
        try {
          await redisClient.del(...keys);
        } catch (e) {}
      }
      memCache.del(...keys);
    },

    async delPattern(pattern) {
      stats.invalidations++;
      if (isRedisReady && redisClient) {
        try {
          let cursor = '0';
          do {
            const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', `${prefix}${pattern}`, 'COUNT', 100);
            cursor = nextCursor;
            if (keys && keys.length > 0) {
              const rawKeys = keys.map(k => k.startsWith(prefix) ? k.slice(prefix.length) : k);
              await redisClient.del(...rawKeys);
            }
          } while (cursor !== '0');
        } catch (e) {}
      }
      memCache.delPattern(pattern);
    },

    async close() {
      if (redisClient) {
        try { redisClient.disconnect(); } catch {}
      }
      memCache.flush();
    },
  };

  return cache;
}

module.exports = { createCache };

