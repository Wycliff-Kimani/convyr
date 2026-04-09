"use client";

import { auth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const user = auth.getUser();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[#0F172A]">
            {user?.full_name}
          </p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-sm font-semibold">
          {user?.full_name ? getInitials(user.full_name) : "?"}
        </div>
      </div>
    </header>
  );
}
