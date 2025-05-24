'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import type { UserSettings } from '@/lib/db/schema';

interface UseUserSettingsOptions {
  initialSettings?: UserSettings | null;
}

export function useUserSettings(options: UseUserSettingsOptions = {}) {
  const { data: session } = useSession();
  const [settings] = useState<UserSettings | null>(options.initialSettings || null);

  // Only return settings if user is authenticated
  const validSettings = session?.userId ? settings : null;

  return {
    settings: validSettings,
    loading: false,
    requireRepoDeleteConfirmation: validSettings?.requireRepoDeleteConfirmation ?? true,
  };
} 