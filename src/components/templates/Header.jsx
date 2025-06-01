"use client";

import { usePathname } from "next/navigation";

export default function Header({ userInfo }) {
  const pathname = usePathname();

  let variant;

  if (pathname === "/") {
    variant = "home";
  } else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile")
  ) {
    variant = "dashboard";
  } else {
    variant = "public";
  }

  return (
    <header className="w-full p-4 flex justify-between items-center bg-orange-400">
      <h1 className="font-bold">LC Sign</h1>

      {variant === "home" && (
        <nav className="flex gap-4">
          <a href="/auth/login">Login</a>
          <a href="/auth/register">Register</a>
        </nav>
      )}

      {variant === "public" && (
        <nav className="flex gap-4">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      )}

      {variant === "dashboard" && (
        <nav className="flex items-center gap-4">
          <span>
            {userInfo?.firstName} {userInfo?.lastName}
          </span>
          <a href="/auth/logout">Logout</a>
        </nav>
      )}
    </header>
  );
}
