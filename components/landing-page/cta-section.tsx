import { SignInButton } from "@/components/ui/sign-in-button";

export function CTASection() {
  return (
    <div className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Take Control of Your Repositories?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Keep your GitHub repositories organized. Get started in seconds with your GitHub account.
        </p>
        <SignInButton 
          size="lg" 
          className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
          text="Start Managing Repositories"
        />
        <div className="text-sm text-muted-foreground pt-4">
          <p>✓ No setup required &nbsp;&nbsp; ✓ Secure OAuth authentication &nbsp;&nbsp; ✓ Free to use</p>
        </div>
      </div>
    </div>
  );
} 