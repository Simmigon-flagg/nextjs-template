import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import NextAuth from 'next-auth';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './database';
import crypto from 'crypto';

export async function authorizeFn(credentials) {
  if (!credentials) throw new Error('Missing email or password');

  const { email, password } = credentials;

  await connectToDatabase();

  const user = await User.findOne({ email });

  if (!user) throw new Error('User not found');

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error('Invalid password');

  const refreshToken = crypto.randomBytes(40).toString('hex');
  user.refreshToken = refreshToken;
  await user.save();

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeFn,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Credentials login
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Google login
      if (account?.provider === 'google' && profile) {
        await connectToDatabase();

        let dbUser = await User.findOne({ email: profile.email });
        if (!dbUser) {
          dbUser = await User.create({
            email: profile.email,
            name: profile.name,
            googleId: profile.sub,
            password: crypto.randomBytes(20).toString('hex'), // satisfies required
            image: profile.picture, // save Google profile picture
          });
        } else if (!dbUser.image) {
          dbUser.image = profile.picture;
          await dbUser.save();
        }

        token.userId = dbUser._id.toString();
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.image = dbUser.image;
      }

      return token;
    },
    async session({ session, token }) {
      session.user._id = token.userId;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 12 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);
