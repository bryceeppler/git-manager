import { SignInButton } from "@/components/ui/sign-in-button";
import { LearnMoreButton } from "@/components/ui/learn-more-button";

export function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <SignInButton />
      <LearnMoreButton />
    </div>
  );
} 