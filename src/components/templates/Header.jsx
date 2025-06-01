"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/utils/auth";

export default function Header({ userInfo }) {
  const pathname = usePathname();
  const router = useRouter();

  let variant;

  if (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/signup") {
    variant = "home";
  } else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile")
  ) {
    variant = "dashboard";
  } else {
    variant = "public";
  }

  const handleLogout = () => {
    logout(); // Clear authentication state
    router.push("/auth/login");
  };

  return (
    <header className="w-full p-4 flex justify-between items-center bg-orange-400">
      <h1 className="font-bold"><Link href="/">LC Sign</Link></h1>

      {variant === "home" && (
        <nav className="flex gap-4">
          <a href="/auth/login">Login</a>
          <a href="/auth/signup">Register</a>
        </nav>
      )}

      {/* {variant === "public" && (
        <nav className="flex gap-4">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      )} */}

      {variant === "dashboard" && (
        <nav className="flex items-center gap-4">
          <span>
            {userInfo?.firstName} {userInfo?.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="hover:underline cursor-pointer"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}
