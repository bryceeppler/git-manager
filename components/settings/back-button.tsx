"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackButton() {
  return (
    <Link href="/">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
    </Link>
  );
} 