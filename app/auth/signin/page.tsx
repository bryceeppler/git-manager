"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, AlertCircle } from "lucide-react";

interface Provider {
  id: string;
  name: string;
}

function SignInContent() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  useEffect(() => {
    const getProvidersData = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    getProvidersData();
  }, []);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
        return "There was a problem with the GitHub OAuth configuration. Please check your environment variables.";
      case "Callback":
        return "There was a problem with the callback URL.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, sign in with the same account you used originally.";
      case "EmailSignin":
        return "The e-mail could not be sent.";
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An unknown error occurred during authentication.";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Git<span className="font-swanky text-primary font-normal">Rekt</span></CardTitle>
          <CardDescription>
            Sign in with your GitHub account to manage your repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}
          
          {providers && Object.values(providers).map((provider: Provider) => (
            <div key={provider.name}>
              <Button
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                className="w-full"
                size="lg"
              >
                <Github className="h-5 w-5 mr-2" />
                Sign in with {provider.name}
              </Button>
            </div>
          ))}
          
          {!providers && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </CardContent>
        </Card>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 