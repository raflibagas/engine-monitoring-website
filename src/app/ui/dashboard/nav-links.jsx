"use client";

import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ClockIcon,
  BellAlertIcon,
  ArrowUpOnSquareStackIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard/home", icon: HomeIcon },
  { name: "Status", href: "/dashboard/status", icon: BellAlertIcon },
  {
    name: "Insight",
    href: "/dashboard/insight",
    icon: ChartBarIcon,
  },
  { name: "History", href: "/dashboard/history", icon: ClockIcon },
  {
    name: "Activity",
    href: "/dashboard/activity",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    name: "Data Export",
    href: "/dashboard/export",
    icon: ArrowUpOnSquareStackIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.name === "Insight" &&
            pathname.startsWith("/dashboard/insight"));
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": isActive,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
