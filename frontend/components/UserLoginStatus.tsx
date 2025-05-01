"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, UserPlus } from "lucide-react";

export default function UserLoginStatus() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.photoURL || ""} 
                  alt={user.displayName || "User avatar"} 
                />
                <AvatarFallback className="bg-[#8c52ff] text-white">
                  {user.displayName 
                    ? user.displayName.slice(0, 2).toUpperCase() 
                    : user.email 
                      ? user.email.slice(0, 2).toUpperCase() 
                      : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">
                {user.displayName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              {/* <Link href="/account/dashboard" className="cursor-pointer flex w-full">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link> */}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/build-download" className="cursor-pointer flex w-full">
                <Settings className="mr-2 h-4 w-4" />
                My Builds
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/account/login">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/account/signup">
            <Button
              variant="default"
              size="sm"
              className="bg-[#8c52ff] hover:bg-[#7a45e0]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Sign up
            </Button>
          </Link>
        </div>
      )}
    </>
  );
} 