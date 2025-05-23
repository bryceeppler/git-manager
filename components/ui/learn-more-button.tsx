"use client";

import { Button } from "@/components/ui/button";

export function LearnMoreButton() {
  const handleClick = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Button 
      size="lg" 
      variant="outline" 
      className="text-lg px-8 py-6"
      onClick={handleClick}
    >
      Learn More
    </Button>
  );
} 