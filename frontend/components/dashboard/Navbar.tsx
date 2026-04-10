"use client";

import { Menu } from "lucide-react";
import { auth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const user = auth.getUser();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Menu size={20} />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[#0F172A]">
            {user?.full_name}
          </p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {user?.full_name ? getInitials(user.full_name) : "?"}
        </div>
      </div>
    </header>
  );
}
