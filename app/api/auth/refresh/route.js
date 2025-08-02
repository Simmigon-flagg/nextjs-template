import { cookies } from "next/headers";
import { connectToDatabase } from "../../../../utils/database";
import User from "../../../../models/user";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findOne({ refreshToken });

  if (!user) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 });
  }

  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "15m" }
  );

  return NextResponse.json({ accessToken });
}
