"use client";

import { auth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

export default function Navbar() {
  const user = auth.getUser();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
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
