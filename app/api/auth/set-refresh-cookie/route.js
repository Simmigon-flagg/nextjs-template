// /api/set-refresh-cookie/route.js
import { NextResponse } from 'next/server';
import { generateAndStoreRefreshToken } from '../../../../services/api/auth';
import { logEvent } from '../../../../utils/logger';

export async function POST(req) {
  try {
    const { email } = await req.json();

    await logEvent({
      level: 'info',
      message: 'Refresh token request received',
      meta: { email },
    });

    const refreshToken = await generateAndStoreRefreshToken(email);

    if (!refreshToken) {
      await logEvent({
        level: 'warn',
        message: 'Refresh token request failed: user not found',
        meta: { email },
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logEvent({
      level: 'info',
      message: 'Refresh token generated successfully',
      meta: { email },
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    await logEvent({
      level: 'error',
      message: 'Error in set-refresh-cookie API',
      meta: { error: error.message },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
