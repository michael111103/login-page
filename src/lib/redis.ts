import Redis from 'ioredis';

declare global {
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const client = new Redis({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    lazyConnect: false,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 15000,
  });

  client.on('error', (err) => console.error('[Redis] Error:', err.message));
  client.on('connect', () => console.log('[Redis] Connected!'));

  return client;
}

export const redis: Redis = globalThis.__redis ?? createRedisClient();
globalThis.__redis = redis;
export default redis;
