import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import clientPromise from "@/app/lib/mongodb";

async function getUserByEmail(email) {
  try {
    console.log("===== Auth Debug Logs =====");
    console.log("1. Starting MongoDB connection...");
    console.log("Database:", process.env.MONGODB_URI); // Log full URI (careful with credentials)

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 100000)
    );

    const connectionPromise = clientPromise;
    const client = await Promise.race([connectionPromise, timeoutPromise]);
    console.log("2. MongoDB connected successfully");

    console.log("3. Accessing ICE database...");
    const db = client.db("ICE");

    console.log("4. Attempting to find user:", email);
    const user = await db.collection("users").findOne({ email });
    console.log("Raw user data:", user); // Add this to see full user object
    console.log("User found:", {
      hasPassword: !!user?.password,
      passwordField: user?.password?.substring(0, 20) + "...", // Safe way to log password hash
    });

    if (!user) {
      return null; // Return null instead of throwing error
    }

    return {
      id: user._id?.toString() || String(user._id), // Safe conversion
      email: user.email,
      name: user.name || email,
      password: user.password,
    };
  } catch (error) {
    console.error("Auth Error:", error.message);
    return null; // Return null instead of throwing error
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

          console.log("User object from getUserByEmail:", user);

          if (!user) {
            console.log("No user found:", email);
            return null;
          }

          console.log("Found user, checking password...");
          console.log("Password hash exists:", !!user.password);

          // // Add validation
          // if (!credentials.password) {
          //   console.log("No password provided");
          //   return null;
          // }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          console.log("Password validation:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password for:", email);
            return null;
          }

          return {
            id: user.id || "default-id", // Fallback id if missing
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
