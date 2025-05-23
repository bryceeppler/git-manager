import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSettings } from "@/lib/actions/user-settings";
import { SettingsForm } from "@/components/settings-form";
import { BackButton } from "@/components/settings/back-button";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.userId) {
    redirect("/auth/signin");
  }
  
  const userSettings = await getUserSettings(session.userId);
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        <div className="gap relative gap-4">
          <div className="flex items-center gap-4 mb-8 md:mb-0 md:absolute md:top-0 md:left-0">
            <BackButton />
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold">Settings</h1>
            </div>
          </div>
        </div>
        
        {/* Settings form in container matching dashboard */}
          <SettingsForm 
            userId={session.userId}
            initialSettings={userSettings}
          />
      </div>
  );
} 