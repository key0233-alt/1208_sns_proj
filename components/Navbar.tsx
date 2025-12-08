"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const pathname = usePathname();
  
  // (main) 그룹 경로에서는 Navbar 숨김
  // (main) 그룹: /, /profile, /search, /create, /activity 등
  const isMainGroup = pathname === "/" || 
    pathname.startsWith("/profile") || 
    pathname.startsWith("/search") || 
    pathname.startsWith("/create") || 
    pathname.startsWith("/activity") ||
    pathname.startsWith("/post");

  if (isMainGroup) {
    return null;
  }

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
