"use client";

import React from "react";
import Link from "next/link";
import UserLoginStatus from "./UserLoginStatus";

export default function Header() {
  return (
    <header className="bg-white border-b py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#8c52ff]">Tecxmate</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
            FAQ
          </Link>
          <UserLoginStatus />
        </div>
      </div>
    </header>
  );
} 