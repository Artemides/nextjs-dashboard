import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import credentials from 'next-auth/providers/credentials';
import { getUser } from './data';
import bcrypt from 'bcrypt';
import { SigninSchema } from './validation';
export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    credentials({
      authorize: async (credentials) => {
        const result = SigninSchema.safeParse(credentials);
        if (!result.success) {
          console.log('Invalid Form, missing or unexpected fields');
          return null;
        }
        const { email, password } = result.data;

        const user = await getUser(email);
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
});
