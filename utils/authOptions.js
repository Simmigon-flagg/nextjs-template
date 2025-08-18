import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import NextAuth from 'next-auth';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './database';
import crypto from 'crypto';
import { logEvent } from './logger';

export async function authorizeFn(credentials) {
  if (!credentials) throw new Error('Missing email or password');

  const { email, password } = credentials;

  await connectToDatabase();

  const user = await User.findOne({ email });

  if (!user) {
    await logEvent({
      level: 'warn',
      message: 'User not found during credentials login',
      meta: { email: credentials.email },
    });
    throw new Error('User not found');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    await logEvent({
      level: 'warn',
      message: 'Invalid password attempt',
      meta: { email: credentials.email },
    });
    throw new Error('Invalid password');
  }

  const refreshToken = crypto.randomBytes(40).toString('hex');
  user.refreshToken = refreshToken;
  await user.save();
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image
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
      
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user?.image;
      }

      if (account?.provider === 'google' && profile) {
        await connectToDatabase();

        let dbUser = await User.findOne({ email: profile.email });
        if (!dbUser) {
          dbUser = await User.create({
            email: profile.email,
            name: profile.name,
            googleId: profile.sub,
            password: crypto.randomBytes(20).toString('hex'),
            image: profile.picture,
          });

          await logEvent({
            level: 'info',
            message: 'New user created',
            userId: dbUser._id.toString(),
            meta: { email: dbUser.email, provider: 'google' },
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
  events: {
    async signIn({ user, account }) {
      await connectToDatabase();

      let dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        dbUser = await User.create({
          email: user.email,
          name: user.name,
          googleId: user.id,
          password: crypto.randomBytes(20).toString('hex'),
          image: user.image,
        });
      }

      await logEvent({
        level: 'info',
        message: 'User signed in',
        userId: dbUser._id.toString(),
        meta: { provider: account?.provider },
      });
    },
    async signOut({ token }) {
    
      await logEvent({
        level: 'info',
        message: 'User signed out',
        userId: token.userId, // ✅ consistent with signIn/createUser
      });
    },
    async createUser({ user }) {
      
      await logEvent({
        level: 'info',
        message: 'New user created',
        userId: user.id,
        meta: { email: user.email },
      });
    },
    async error(error) {
      await logEvent({
        level: 'error',
        message: 'NextAuth error',
        meta: { error: error?.message || error },
      });
    },
  },
};

export default NextAuth(authOptions);
