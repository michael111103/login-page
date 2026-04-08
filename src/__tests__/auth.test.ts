/**
 * Unit Test - Validasi Form & Fungsi Login
 * PT. Javis Teknologi Albarokah
 */

import {
  validateEmail,
  validateLoginForm,
  isEmailFormat,
} from '../lib/validation';

// ─── Validasi Email ────────────────────────────────────────────────
describe('validateEmail()', () => {
  it('menerima format email yang valid', () => {
    expect(validateEmail('demo@javis.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.id')).toBe(true);
    expect(validateEmail('test123@mail.org')).toBe(true);
  });

  it('menolak format email yang tidak valid', () => {
    expect(validateEmail('bukan-email')).toBe(false);
    expect(validateEmail('missing@')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

// ─── Deteksi Format Email ──────────────────────────────────────────
describe('isEmailFormat()', () => {
  it('mendeteksi input sebagai email jika mengandung @', () => {
    expect(isEmailFormat('user@example.com')).toBe(true);
    expect(isEmailFormat('a@b')).toBe(true);
  });

  it('mendeteksi input sebagai username jika tidak mengandung @', () => {
    expect(isEmailFormat('myusername')).toBe(false);
    expect(isEmailFormat('demo')).toBe(false);
  });
});

// ─── Validasi Form Login ───────────────────────────────────────────
describe('validateLoginForm()', () => {
  it('valid jika semua field terisi dengan benar', () => {
    const result = validateLoginForm({
      identifier: 'demo@javis.com',
      password: 'Password123!',
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('invalid jika identifier kosong', () => {
    const result = validateLoginForm({ identifier: '', password: 'pass123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.identifier).toBeDefined();
  });

  it('invalid jika identifier kurang dari 3 karakter', () => {
    const result = validateLoginForm({ identifier: 'ab', password: 'pass123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.identifier).toMatch(/3/);
  });

  it('invalid jika password kosong', () => {
    const result = validateLoginForm({ identifier: 'demo@javis.com', password: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  it('invalid jika password kurang dari 6 karakter', () => {
    const result = validateLoginForm({ identifier: 'demo', password: '123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.password).toMatch(/6/);
  });

  it('invalid jika semua field kosong', () => {
    const result = validateLoginForm({ identifier: '', password: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.identifier).toBeDefined();
    expect(result.errors.password).toBeDefined();
  });
});

// ─── Fungsi JWT ────────────────────────────────────────────────────
describe('JWT utilities', () => {
  // Set env variable untuk test
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-unit-testing-minimum-32-chars';
  });

  it('signToken menghasilkan string token yang valid', async () => {
    const { signToken } = await import('../lib/jwt');
    const token = signToken({ userId: 1, email: 'test@test.com', username: 'test', name: 'Test' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT punya 3 bagian
  });

  it('verifyToken mengembalikan payload yang benar', async () => {
    const { signToken, verifyToken } = await import('../lib/jwt');
    const payload = { userId: 42, email: 'user@example.com', username: 'user42', name: 'User 42' };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded?.userId).toBe(42);
    expect(decoded?.email).toBe('user@example.com');
    expect(decoded?.username).toBe('user42');
  });

  it('verifyToken mengembalikan null untuk token palsu', async () => {
    const { verifyToken } = await import('../lib/jwt');
    expect(verifyToken('token.palsu.ini')).toBeNull();
    expect(verifyToken('')).toBeNull();
    expect(verifyToken('invalid')).toBeNull();
  });
});
