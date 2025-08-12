import { NextResponse } from "next/server";
import { requestPasswordReset } from "../../../services/api/user";

export async function POST(req) {
  try {
    const { email } = await req.json();
    await requestPasswordReset(email);
    // Always send generic response
    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: error.status || 500 }
    );
  }
}
