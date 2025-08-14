import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import {
  updateUserByEmail,
  getUserProfile,
} from '../../../../services/api/user';
import { updateUserImageIdByEmail } from '../../../../services/api/image';

export async function PUT(request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const updatedUser = await updateUserByEmail(session.user.email, data);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Updated User', user: updatedUser },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const userProfile = await getUserProfile(session.user.email);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(userProfile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
