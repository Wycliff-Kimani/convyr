"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  MessageSquare,
  Zap,
  Users,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-100 h-16 flex items-center">
          <Link href="/overview">
            <Image
              src="/images/logo-light.png"
              alt="Convyr"
              width={120}
              height={40}
              style={{ width: "auto", height: "28px" }}
              className="object-contain"
            />
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-green-50 text-[#075E54] font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#0F172A]"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-[#25D366]" : "text-gray-400"}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => auth.logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors w-full"
          >
            <LogOut size={18} className="text-gray-400" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? "text-[#25D366]" : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
