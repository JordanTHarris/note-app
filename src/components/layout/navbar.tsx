import Link from "next/link";
import React from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserDropdown } from "@/components/shared/user-dropdown";
import { getServerAuthSession } from "@/server/auth";
import { LoginButton } from "@/components/shared/login-button";

export async function Navbar() {
  const session = await getServerAuthSession();
  const user = session?.user;

  return (
    <div className="flex items-center justify-between border-b bg-card px-2 py-1">
      <Link href="/" className="text-xl font-semibold">
        Note App
      </Link>
      <div className="flex items-center gap-2">
        {user ? (
          <UserDropdown session={session} />
        ) : (
          <LoginButton size="sm" className="h-8" />
        )}
        <ThemeToggle className="h-8 w-8" />
      </div>
    </div>
  );
}
