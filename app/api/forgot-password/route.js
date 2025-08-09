import { NextResponse } from "next/server";
import {connectToDatabase} from "../../../utils/database";
import User from "../../../models/user";
import { sendEmail } from "../../../utils/sendEmail";

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      // Always send a generic message to prevent user enumeration
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Use model method to create token & set expiry
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `You requested a password reset.\n\nPlease click this link to reset your password: ${resetURL}\n\nIf you did not request this, ignore this email.`
    );

    return NextResponse.json(
      { message: "Password reset link sent to email" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
