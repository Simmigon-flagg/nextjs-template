import { NextResponse } from "next/server";
import { signupUser } from "../../../services/api/signup"; // adjust path

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { user, error, status } = await signupUser({ name, email, password });

    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    return NextResponse.json({ message: "User Registered", user }, { status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error }, { status: 500 });
  }
}
