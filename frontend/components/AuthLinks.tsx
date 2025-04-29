"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

type AuthLinksProps = {
  children: React.ReactNode;
  loginPath?: string;
};

export default function AuthLinks({ children, loginPath = "/account/login" }: AuthLinksProps) {
  const { user, isConfigured } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // If the user is not authenticated, prevent the default action and redirect to login
    if (!user) {
      e.preventDefault();
      router.push(loginPath);
    }
  };

  // Add the onClick handler to all children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: (e: React.MouseEvent) => {
          handleClick(e);
          // Preserve the original onClick if it exists
          if (child.props.onClick) {
            child.props.onClick(e);
          }
        },
      });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
} 