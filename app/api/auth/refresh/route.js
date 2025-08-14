import { cookies } from 'next/headers';
import { verifyRefreshTokenAndGenerateAccessToken } from '../../../../services/api/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const refreshToken = cookies().get('refreshToken')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const accessToken =
    await verifyRefreshTokenAndGenerateAccessToken(refreshToken);
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 403 }
    );
  }

  return NextResponse.json({ accessToken });
}
