import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../../utils/database';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../utils/authOptions';
import {
  uploadImageToGridFS,
  getImageFileUrl,
  updateUserImageIdByEmail,
} from '../../../../../services/api/image';
import { logEvent } from '../../../../../utils/logger';

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  
  if (!email) {
    await logEvent({
      level: 'warn',
      message: 'Update profile image failed - unauthenticated user',
      userId: session.user._id,
    });

    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { bucket } = await connectToDatabase();
    const data = await request.formData();
    const image = data.get('image');

    let imageId = null;
    if (image) {
      imageId = await uploadImageToGridFS(bucket, image);
      await logEvent({
        level: 'info',
        message: 'Uploaded image to GridFS',
        userId: session.user._id,
        meta: { imageId },
      });
    } else {
      await logEvent({
        level: 'warn',
        message: 'No image provided in update request',
        userId: session.user._id,
      });
    }

    const updatedUser = await updateUserImageIdByEmail(email, imageId);
    if (!updatedUser) {
      await logEvent({
        level: 'warn',
        message: 'Update profile image failed - user not found',
        userId: session.user._id,
      });

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const imagefileUrl = imageId
      ? await getImageFileUrl(bucket, imageId)
      : null;

    await logEvent({
      level: 'info',
      message: 'User profile image updated successfully',
      userId: session.user._id,
      meta: { imagefileUrl },
    });

    return NextResponse.json({
      message: 'Updated User',
      user: updatedUser,
      imagefileUrl,
      status: 201,
    });
  } catch (error) {
    console.error('Error updating user:', error);

    await logEvent({
      level: 'error',
      message: 'Exception while updating user profile image',
      userId: session.user?._id,
      meta: { error: error instanceof Error ? error.message : error },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
