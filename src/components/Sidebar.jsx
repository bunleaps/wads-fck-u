"use client";

import { HiOutlineTicket } from "react-icons/hi2";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    {
      title: "Tickets",
      link: "/dashboard/tickets",
      icon: <HiOutlineTicket />,
    },
    {
      title: "Purchases",
      link: "/dashboard/purchases",
      icon: <HiOutlineTicket />,
    },
  ];

  return (
    <div className="p-2">
      {menu.map((item) => (
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
