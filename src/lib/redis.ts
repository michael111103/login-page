import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const useTLS = url.includes('redislabs') || url.includes('upstash') || url.startsWith('rediss://');

  return new Redis(url, {
    tls: useTLS ? { rejectUnauthorized: false } : undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
  });
}

export const redis: Redis = globalThis.__redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') globalThis.__redis = redis;

export default redis;
