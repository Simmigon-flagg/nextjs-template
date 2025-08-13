import CredentialsProvider from "next-auth/providers/credentials";
import User from "../models/user";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./database";
import crypto from "crypto";

export async function authorizeFn(credentials) {
  if (!credentials) throw new Error("Missing email or password");

  const { email, password } = credentials;

  await connectToDatabase();

  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid password");

  const refreshToken = crypto.randomBytes(40).toString("hex");
  user.refreshToken = refreshToken;
  await user.save();

  return {
    id: user._id.toString(),
    email: user.email,
  };
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeFn,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user._id = token.userId;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
    updateAge: 5 * 60, // 5 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
