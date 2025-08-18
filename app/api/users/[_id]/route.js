import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { logEvent } from '../../../../utils/logger';
import {
  updateUserByEmail,
  getUserProfile,
} from '../../../../services/api/user';
import { updateUserImageIdByEmail } from '../../../../services/api/image';

export async function PUT(request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    await logEvent({
      level: 'warn',
      message: 'Unauthorized PUT request - user not authenticated',
    });
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const updatedUser = await updateUserByEmail(session.user.email, data);

    if (!updatedUser) {
      await logEvent({
        level: 'warn',
        message: 'PUT request failed - user not found',
        meta: { email: session.user.email },
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logEvent({
      level: 'info',
      message: 'User updated successfully',
      userId: updatedUser._id.toString(),
      meta: { data },
    });

    return NextResponse.json(
      { message: 'Updated User', user: updatedUser },
      { status: 201 }
    );
  } catch (error) {
    await logEvent({
      level: 'error',
      message: 'Error during PUT request',
      meta: { error: error.message, email: session.user.email },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    await logEvent({
      level: 'warn',
      message: 'Unauthorized GET request - user not authenticated',
    });
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const userProfile = await getUserProfile(session.user.email);

    if (!userProfile) {
      await logEvent({
        level: 'warn',
        message: 'GET request failed - user not found',
        meta: { email: session.user.email },
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await logEvent({
      level: 'info',
      message: 'User profile fetched successfully',
      userId: userProfile._id.toString(),
      meta: { email: userProfile.email },
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    await logEvent({
      level: 'error',
      message: 'Error during GET request',
      meta: { error: error.message, email: session.user.email },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
