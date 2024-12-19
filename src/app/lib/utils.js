"use client";

export function logoutClientSide() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
