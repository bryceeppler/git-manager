"use client";

import { createContext, useContext } from "react";
import type { UserSettings } from "@/lib/db/schema";

interface UserSettingsContextValue {
  settings: UserSettings | null;
  requireRepoDeleteConfirmation: boolean;
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
    return {
      settings: null,
      requireRepoDeleteConfirmation: true,
    };
  }
  return context;
} 