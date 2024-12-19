"use client";

import Link from "next/link";
import { useState } from "react";
import NavLinks from "@/app/ui/dashboard/nav-links";
import Logo from "@/app/ui/logo";
import { PowerIcon } from "@heroicons/react/24/outline";
import { logout } from "@/app/lib/actions"; // Create this action file
import { useFormStatus } from "react-dom";
import { logoutClientSide } from "@/app/lib/utils"; // Import the logout utility

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={`
        flex h-[48px] w-full grow items-center justify-center gap-2 
        rounded-md bg-gray-100 p-3 text-sm font-medium 
        hover:bg-sky-100 hover:text-blue-600 
        md:flex-none md:justify-start md:p-2 md:px-3
        ${pending ? "opacity-70 cursor-not-allowed" : ""}
      `}
      disabled={pending}
    >
      <PowerIcon className={`w-6 ${pending ? "animate-pulse" : ""}`} />
      <div className="hidden md:block">
        {pending ? "Signing out..." : "Sign Out"}
      </div>
    </button>
  );
}

export default function SideNav() {
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLogout() {
    logoutClientSide(); // Call the logout utility function
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-900 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <Logo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-100 md:block"></div>
        {showConfirm ? (
          <div className="p-4 border rounded-md bg-white shadow-sm">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-2">
              {/* <form action={logout}>
                <LogoutButton />
              </form> */}
              <button onClick={handleLogout}>
                <LogoutButton />
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex h-[48px] px-4 items-center justify-center rounded-md border border-gray-200 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        )}
      </div>
    </div>
  );
}
