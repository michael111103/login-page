import redis from './redis';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  name: string;
  createdAt: string;
}

const USER_PREFIX = 'user:';
const EMAIL_INDEX = 'index:email:';
const USERNAME_INDEX = 'index:username:';

export async function findUserByEmail(email: string): Promise<User | null> {
  const userId = await redis.get(`${EMAIL_INDEX}${email.toLowerCase()}`);
  if (!userId) return null;
  return getUserById(userId);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const userId = await redis.get(`${USERNAME_INDEX}${username.toLowerCase()}`);
  if (!userId) return null;
  return getUserById(userId);
}

export async function getUserById(id: string): Promise<User | null> {
  const data = await redis.hgetall(`${USER_PREFIX}${id}`);
  if (!data || !data.id) return null;
  return data as unknown as User;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const id = `usr_${Date.now()}`;
  const user: User = { ...data, id, createdAt: new Date().toISOString() };

  await redis.hset(`${USER_PREFIX}${id}`, user as unknown as Record<string, string>);
  await redis.set(`${EMAIL_INDEX}${data.email.toLowerCase()}`, id);
  await redis.set(`${USERNAME_INDEX}${data.username.toLowerCase()}`, id);

  return user;
}

export async function seedDemoUser(): Promise<void> {
  const existing = await findUserByEmail('demo@javis.com');
  if (existing) return;

  const hashedPassword = await bcrypt.hash('Password123!', 12);
  await createUser({
    email: 'demo@javis.com',
    username: 'demo',
    password: hashedPassword,
    name: 'Demo User',
  });

  console.log('✅ Demo user seeded: demo@javis.com / Password123!');
}
