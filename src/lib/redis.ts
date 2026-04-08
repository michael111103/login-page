import Redis from 'ioredis';

declare global {
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  const useTLS =
    url.startsWith('rediss://') ||
    url.includes('redislabs') ||
    url.includes('upstash');

  const client = new Redis(url, {
    tls: useTLS ? { rejectUnauthorized: false } : undefined,
    lazyConnect: false,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 15000,
    commandTimeout: 10000,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 300, 1000);
    },
  });

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  return client;
}

export const redis: Redis = globalThis.__redis ?? createRedisClient();

globalThis.__redis = redis;

export default redis;
