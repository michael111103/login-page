import Redis from 'ioredis';

declare global {
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL!, {
    tls: { rejectUnauthorized: false },
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 15000,
    lazyConnect: false,
  });

  client.on('error', (err) => console.error('[Redis] Error:', err.message));
  client.on('connect', () => console.log('[Redis] Connected!'));

  return client;
}

export const redis: Redis = globalThis.__redis ?? createRedisClient();
globalThis.__redis = redis;
export default redis;
