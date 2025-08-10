// /api/set-refresh-cookie/route.js
import { NextResponse } from "next/server";
import { generateAndStoreRefreshToken } from "../../../../services/api/auth";

export async function POST(req) {
  const { email } = await req.json();

  const refreshToken = await generateAndStoreRefreshToken(email);
  if (!refreshToken) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

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
