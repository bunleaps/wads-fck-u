"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { logout, getUser } from "@/utils/auth";
import { IoMdArrowDropdown } from "react-icons/io"; // Import an icon

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    // Fetch user info using the utility function
    const user = getUser();
    setCurrentUser(user);
  }, [pathname]); // Re-run on initial mount and when pathname changes.

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);
  let variant;

  if (
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/signup"
  ) {
    variant = "home";
  } else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile")
  ) {
    variant = "dashboard";
  } else {
    variant = "public";
  }

  if (!mounted) {
    // On the server, and on the initial client render before useEffect runs,
    // this will return null, ensuring consistency.
    return null;
  }

  const handleLogout = () => {
    logout(); // Clear authentication state
    setCurrentUser(null); // Clear local state for immediate UI update
    router.push("/auth/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <>
      {variant === "home" && (
        <div className="w-full p-4 flex justify-between items-center bg-orange-400">
          <h1 className="font-bold">
            <Link href="/dashboard">LC Sign</Link>
          </h1>
          {currentUser ? (
            <nav className="flex items-center gap-4" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-white focus:outline-none p-1 rounded-md hover:bg-orange-500 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                    {currentUser?.firstName?.charAt(0)?.toUpperCase()}
                    {currentUser?.lastName?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                  <IoMdArrowDropdown
                    className={`w-5 h-5 transition-transform ${
                      isDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1 ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profiles
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false); // Close dropdown after logout
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </nav>
          ) : (
            <nav className="flex gap-4">
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Register</Link>
            </nav>
          )}
        </div>
      )}

      {/* {variant === "public" && (
        <nav className="flex gap-4">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      )} */}

      {variant === "dashboard" && (
        <div className="w-full p-4 flex justify-between items-center bg-orange-400">
          <h1 className="font-bold">
            <Link href="/dashboard">LC Sign</Link>
          </h1>
          <nav className="flex items-center gap-4" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 text-white focus:outline-none p-1 rounded-md hover:bg-orange-500 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                  {currentUser?.firstName?.charAt(0)?.toUpperCase()}
                  {currentUser?.lastName?.charAt(0)?.toUpperCase()}
                </div>
                <span className="hidden sm:inline">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <IoMdArrowDropdown
                  className={`w-5 h-5 transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1 ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profiles
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false); // Close dropdown after logout
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
