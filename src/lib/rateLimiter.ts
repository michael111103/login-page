import redis from './redis';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 60;
const BLOCK_SECONDS = 60;

export interface RateLimitResult {
  success: boolean;
  remainingPoints?: number;
  msBeforeNext?: number;
  totalHits?: number;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const key = `rate_limit:${ip}`;
  const blockKey = `rate_block:${ip}`;

  // Check if blocked
  const blocked = await redis.get(blockKey);
  if (blocked) {
    const ttl = await redis.ttl(blockKey);
    return {
      success: false,
      msBeforeNext: ttl * 1000,
      totalHits: MAX_ATTEMPTS,
    };
  }

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (current > MAX_ATTEMPTS) {
    await redis.set(blockKey, '1', 'EX', BLOCK_SECONDS);
    await redis.del(key);
    const ttl = await redis.ttl(blockKey);
    return {
      success: false,
      msBeforeNext: ttl * 1000,
      totalHits: current,
    };
  }

  return {
    success: true,
    remainingPoints: MAX_ATTEMPTS - current,
    msBeforeNext: 0,
  };
}

export async function resetRateLimit(ip: string): Promise<void> {
  await redis.del(`rate_limit:${ip}`);
  await redis.del(`rate_block:${ip}`);
}
