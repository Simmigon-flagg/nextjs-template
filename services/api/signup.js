import Users from "./../../models/user";
import { connectToDatabase } from "../../utils/database";
import bcrypt from "bcryptjs";

export async function signupUser({ name, email, password }) {
    await connectToDatabase();

    // Check if user exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
        return { error: "User already exists", status: 409 };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await Users.create({
        name,
        email,
        password: hashedPassword,
        imageId: null,
    });

    return { user, status: 201 };
}
