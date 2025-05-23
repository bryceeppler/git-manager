import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RepositoryDashboardServer } from "@/components/repository-dashboard-server";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <LandingPage />;
  }

  return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Static header content renders immediately */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">

            <h1 className="text-4xl font-bold">
              Git<span className="font-swanky text-primary font-normal">Rekt</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The dangerous repository manager
          </p>
        </div>

        {/* Repository data is streamed with Suspense */}
        <Suspense fallback={<RepositoryDashboardSkeleton />}>
          <RepositoryDashboardServer />
        </Suspense>
      </div>
  );
}

function RepositoryDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controls skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="h-10 bg-muted rounded-md flex-1 max-w-md animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-[180px] bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-8 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Repository cards skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-xl p-6 space-y-4 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 bg-muted rounded" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-muted rounded w-48" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
              <div className="w-8 h-8 bg-muted rounded" />
            </div>
            <div className="flex gap-5">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
