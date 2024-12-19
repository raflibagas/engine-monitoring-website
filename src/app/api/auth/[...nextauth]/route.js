import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import clientPromise from "@/app/lib/mongodb";

async function getUserByEmail(email) {
  const client = await clientPromise;
  const db = client.db("ICE");

  // Find user by email
  return await db.collection("users").findOne({ email });
}

const authOptions = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;

        // Fetch the user from the database
        const user = await getUserByEmail(email);

        if (!user) {
          throw new Error("No user found with the provided email.");
        }

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password.");
        }

        // Return the user object on successful validation
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
