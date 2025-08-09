import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs"; // Ensure you have this installed
import User from "../../../models/user"; // fixed casing
import {connectToDatabase} from "../../../utils/database";

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Missing token or password" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token invalid or expired" },
        { status: 400 }
      );
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
