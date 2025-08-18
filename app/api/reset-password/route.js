import { NextResponse } from 'next/server';
import { resetPassword } from '../../../services/api/user';
import { logEvent } from '../../../utils/logger';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      await logEvent({
        level: 'warn',
        message: 'Password reset failed - missing token or newPassword',
        meta: { token, newPassword },
      });
      return NextResponse.json(
        { message: 'Missing token or newPassword' },
        { status: 400 }
      );
    }

    await resetPassword(token, newPassword);

    await logEvent({
      level: 'info',
      message: 'Password reset successful',
      meta: { token },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    await logEvent({
      level: 'error',
      message: 'Password reset error',
      meta: { error: error.message || error },
    });

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
