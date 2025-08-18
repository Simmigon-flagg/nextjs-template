import { NextResponse } from 'next/server';
import { signupUser } from '../../../services/api/signup';
import { logEvent } from '../../../utils/logger'; // adjust path

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      await logEvent({
        level: 'warn',
        message: 'Signup failed - missing fields',
        meta: { name, email },
      });

      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { user, error, status } = await signupUser({ name, email, password });

    if (error) {
      await logEvent({
        level: 'warn',
        message: 'Signup failed - service returned error',
        meta: { email, error },
      });

      return NextResponse.json({ message: error }, { status });
    }

    // ✅ Log successful creation
    await logEvent({
      level: 'info',
      message: 'User registered successfully',
      userId: user._id?.toString(),
      meta: { email, name },
    });

    return NextResponse.json({ message: 'User Registered', user }, { status });
  } catch (err) {
    console.error(err);

    await logEvent({
      level: 'error',
      message: 'Signup route exception',
      meta: { error: err instanceof Error ? err.message : err },
    });

    return NextResponse.json(
      { message: 'An error occurred', error: err },
      { status: 500 }
    );
  }
}
