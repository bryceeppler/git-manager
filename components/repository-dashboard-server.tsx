import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRepositoriesWithoutHealth } from "@/lib/actions/repository-actions";
import { getUserSettings } from "@/lib/actions/user-settings";
import { RepositoryDashboardClient } from "./repository-dashboard-client";
import { UserSettingsProvider } from "./user-settings-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react";

export async function RepositoryDashboardServer() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const [{ repositories, error }, userSettings] = await Promise.all([
    getRepositoriesWithoutHealth(),
    session.userId ? getUserSettings(session.userId) : Promise.resolve(null),
  ]);

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <Github className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-destructive">Error loading repositories</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert to GitHubRepositoryWithHealth format (without health data initially)
  const repositoriesWithHealth = (repositories || []).map(repo => ({ ...repo, health: undefined }));

  return (
    <UserSettingsProvider initialSettings={userSettings}>
      <div className="space-y-6">
        {/* Repository List */}
        <RepositoryDashboardClient initialRepositories={repositoriesWithHealth} />
      </div>
    </UserSettingsProvider>
  );
} 