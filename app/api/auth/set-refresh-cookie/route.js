import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "../../../../utils/database";
import User from "../../../../models/user";

export async function POST(req) {
  const { email } = await req.json();

  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate refresh token, save to DB
  const refreshToken = crypto.randomBytes(40).toString("hex");
  user.refreshToken = refreshToken;
  await user.save();

  const response = NextResponse.json({ success: true });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return response;
}
