"use client";

import React from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/account/login");
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
          <AvatarFallback>{(user.displayName || user.email || "User").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.displayName || "Welcome!"}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Account ID:</span>
            <span className="ml-2 text-gray-500">{user.uid}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Email verified:</span>
            <span className="ml-2 text-gray-500">{user.emailVerified ? "Yes" : "No"}</span>
          </div>
          {user.providerData && user.providerData.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Sign-in method:</span>
              <span className="ml-2 text-gray-500">
                {user.providerData[0].providerId === "google.com" ? "Google" : "Email/Password"}
              </span>
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Created:</span>
            <span className="ml-2 text-gray-500">
              {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSignOut} variant="outline" className="w-full">
          Sign out
        </Button>
      </CardFooter>
    </Card>
  );
} 