"use server";

import { redirect } from "next/navigation";

export async function authenticate(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate credentials on the server (optional: make an API call to verify credentials)
  const isValid = email === "test@example.com" && password === "password123"; // Replace with real validation logic

  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  // Redirect the user to the dashboard upon successful login
  redirect("/dashboard/home");
}
