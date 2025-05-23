"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

interface SignInButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  text?: string;
}

export function SignInButton({ size = "lg", className, text }: SignInButtonProps) {
  const defaultText = text || (size === "lg" ? "Sign in with GitHub" : "Sign in with GitHub");

  return (
    <Button 
      size={size} 
      onClick={() => signIn("github")} 
      className={className || "text-lg px-8 py-6 bg-primary hover:bg-primary/90"}
    >
      <Github className="w-5 h-5 mr-2" />
      {defaultText}
    </Button>
  );
} 