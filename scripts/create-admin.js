// scripts/create-admin.js
require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

// MongoDB connection details
const uri = process.env.MONGODB_URI;
const dbName = "ICE";

async function createAdminUser() {
  let client;

  try {
    console.log("Connecting to database...");
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    console.log("Checking for existing admin...");
    const existingAdmin = await db.collection("users").findOne({
      email: "admin2@example.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    console.log("Creating new admin user...");
    const hashedPassword = await bcrypt.hash("admin2", 10);

    const result = await db.collection("users").insertOne({
      email: "admin2@example.com",
      password: hashedPassword,
      name: "Admin 1",
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Admin user created successfully!");
    console.log("Admin ID:", result.insertedId);
  } catch (error) {
    console.error("Error creating admin user:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("Database connection closed");
    }
    process.exit(0);
  }
}

// Check if MongoDB URI is defined
if (!uri) {
  console.error("MONGODB_URI is not defined in your environment variables");
  process.exit(1);
}

console.log("Starting admin user creation...");
createAdminUser();
