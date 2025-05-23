"use client";

import { createContext, useContext } from "react";
import type { UserSettings } from "@/lib/db/schema";

interface UserSettingsContextValue {
  settings: UserSettings | null;
  requireRepoDeleteConfirmation: boolean;
  disableBulkOperations: boolean;
}

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

interface UserSettingsProviderProps {
  children: React.ReactNode;
  initialSettings: UserSettings | null;
}

export function UserSettingsProvider({ children, initialSettings }: UserSettingsProviderProps) {
  const value: UserSettingsContextValue = {
    settings: initialSettings,
    requireRepoDeleteConfirmation: initialSettings?.requireRepoDeleteConfirmation ?? true,
    disableBulkOperations: initialSettings?.disableBulkOperations ?? false,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettingsContext() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    // Return default values if no context (for unauthenticated users)
    return {
      settings: null,
      requireRepoDeleteConfirmation: true,
      disableBulkOperations: false,
    };
  }
  return context;
} 