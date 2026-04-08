import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserByUsername, seedDemoUser } from '@/lib/userStore';
import { signToken, createCookieOptions } from '@/lib/jwt';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimiter';
import { validateLoginForm, isEmailFormat } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Seed demo user if not exists
    await seedDemoUser();

    // Get IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Check rate limit
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.msBeforeNext || 60000) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfter} detik.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await request.json();
    const { identifier, password } = body;

    // Validate form
    const validation = validateLoginForm({ identifier, password });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid', errors: validation.errors },
        { status: 400 }
      );
    }

    // Find user by email or username
    const isEmail = isEmailFormat(identifier.trim());
    const user = isEmail
      ? await findUserByEmail(identifier.trim())
      : await findUserByUsername(identifier.trim());

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email/username atau password salah.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email/username atau password salah.' },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    await resetRateLimit(ip);

    // Create JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    });

    const cookieOptions = createCookieOptions();
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login berhasil!',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, cookieOptions);

    return response;
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
