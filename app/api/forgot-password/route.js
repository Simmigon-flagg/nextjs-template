import { NextResponse } from 'next/server';
import { requestPasswordReset } from '../../../services/api/user';

import { logEvent } from '@/utils/logger';
export async function POST(req) {
  const { email } = await req.json();
  try {
    await requestPasswordReset(email);
    // Always send generic response
    await logEvent({
      level: 'info',
      message: 'Password reset requested',
      meta: { email },
    });
    return NextResponse.json(
      { message: 'If an account exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    await logEvent({
      level: 'error',
      message: 'Error requesting password reset',
      meta: { error: error.message || error , email},
    });
    return NextResponse.json(
      { message:  'Server error' },
      { status: error.status || 500 }
    );
  }
}
