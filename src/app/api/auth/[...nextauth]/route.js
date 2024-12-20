import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import clientPromise from "@/app/lib/mongodb";

async function getUserByEmail(email) {
  try {
    console.log('===== Auth Debug Logs =====');
    console.log('1. Starting MongoDB connection...');
    const client = await clientPromise.catch(err => {
      console.error('Connection Error Details:', {
        message: err.message,
        code: err.code,
        name: err.name
      });
      throw err;
    });
    console.log('2. MongoDB connected successfully');
    
    console.log('3. Accessing ICE database...');
    const db = client.db("ICE");
    
    console.log('4. Attempting to find user:', email);
    const user = await db.collection("users").findOne({ email });
    console.log('5. User search result:', user ? 'User found' : 'User not found');
    
    return user;
  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    throw error;
  }
}

const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          // Add timeout for MongoDB connection
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Database timeout")), 20000)
          );

          const userPromise = getUserByEmail(email);
          const user = await Promise.race([userPromise, timeoutPromise]);

          if (!user) {
            console.log("No user found:", email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            console.log("Invalid password for:", email);
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Add callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page path
    error: "/auth/error", // Error page
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
};

// export const GET = NextAuth(authOptions);
// export const POST = NextAuth(authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
