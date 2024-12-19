"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./button";

export default function LoginForm() {
  const [state, setState] = useState({ error: null, pending: false });

  async function handleSubmit(event) {
    event.preventDefault(); // Prevent form's default submission

    setState({ error: null, pending: true });

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    // Use signIn for authentication
    const result = await signIn("credentials", {
      redirect: false, // Prevent automatic redirection by NextAuth
      email,
      password,
    });

    if (result?.error) {
      setState({ error: "Invalid credentials", pending: false });
      return;
    }

    // Redirect manually upon successful login
    window.location.href = "/dashboard/home";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-100 px-6 pb-4 pt-8">
        <h1
          className={`${lusitana.className} mb-3 text-2xl flex items-center justify-center`}
        >
          Please log in to continue
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                minLength={5}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <LoginButton pending={state.pending} />
        <div
          className="flex h-8 items-end space-x-1 mt-4"
          aria-live="polite"
          aria-atomic="true"
        >
          {state?.error && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{state.error}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton({ pending }) {
  return (
    <Button
      className={`mt-4 w-full -mb-2 flex items-center justify-center transition-all duration-200 ${
        pending ? "bg-gray-400" : "bg-blue-800 hover:bg-blue-600"
      } ${pending ? "cursor-not-allowed" : "cursor-pointer"}`}
      aria-disabled={pending}
      type="submit"
    >
      <span className="flex items-center justify-center gap-2">
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="animate-pulse"></span>
            <span>Logging in...</span>
            <span className="animate-pulse"></span>
          </span>
        ) : (
          <span>Log in</span>
        )}
      </span>
    </Button>
  );
}
