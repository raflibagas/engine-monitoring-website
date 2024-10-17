import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
// import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * @param {string} email
 * @returns {Promise<User|undefined>}
 */
async function getUser(email) {
  // Your getUser function implementation
}

export const authOptions = {
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // Your authentication logic here
          return {
            id: '1',
            name: 'Test User',
            email: email
          };
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
};

export default NextAuth(authOptions);
export const { auth, signIn, signOut } = NextAuth(authOptions);