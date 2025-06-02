"use client";

import { useState, useEffect } from "react";
import { HiOutlineTicket, HiOutlineShoppingCart } from "react-icons/hi2";
import { MdOutlineDashboard, MdSettings } from "react-icons/md"; // Example admin icons
import { FiUsers } from "react-icons/fi"; // Example admin icon
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/utils/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getUser();
    setCurrentUser(user);
  }, []);

  const userMenu = [
    {
      title: "Tickets",
      link: "/dashboard/tickets",
      icon: <HiOutlineTicket />,
    },
    {
      title: "Purchases",
      link: "/dashboard/purchases",
      icon: <HiOutlineShoppingCart />,
    },
  ];

  const adminMenu = [
    {
      title: "All Tickets",
      link: "/dashboard/tickets",
      icon: <MdOutlineDashboard />,
    },
    {
      title: "Assigned Tickets",
      link: "/dashboard/tickets/assigned",
      icon: <HiOutlineTicket />,
    },
    {
      title: "Purchases",
      link: "/dashboard/purchases",
      icon: <HiOutlineShoppingCart />,
    },
    {
      title: "Users",
      link: "/dashboard/users",
      icon: <FiUsers />,
    },
  ];

  if (!mounted) {
    return null; // Or a loading skeleton for the sidebar
  }

  let activeMenu = [];
  if (currentUser?.role === "admin") {
    activeMenu = adminMenu;
  } else if (currentUser?.role === "user") {
    activeMenu = userMenu;
  }

  return (
    <div className="p-2">
      {activeMenu.map((item) => (
        <Link
          href={item.link}
          key={item.title}
          className={`flex rounded m-2 p-4 ${
            pathname === item.link
              ? "bg-slate-200"
              : "bg-white hover:bg-slate-300"
          }`}
        >
          <h1 className="text-2xl">{item.icon}</h1>
          <span className="ml-3">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
