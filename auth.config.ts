import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const loggedIn = !!auth?.user;
      const onDashboard = nextUrl.pathname.includes('/dashboard');
      if (loggedIn) {
        if (onDashboard) {
          return true;
        }

        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return false;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
