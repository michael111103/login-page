import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada sesi aktif.' },
        { status: 401 }
      );
    }

    // Hapus cookie auth_token
    const response = NextResponse.json(
      { success: true, message: 'Logout berhasil.' },
      { status: 200 }
    );

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
