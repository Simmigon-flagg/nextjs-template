import { NextResponse } from "next/server";
import { resetPassword } from "../../../services/api/user";

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    await resetPassword(token, newPassword);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
