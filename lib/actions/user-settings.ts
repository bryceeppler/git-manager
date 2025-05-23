'use server';

import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, userSettings, type NewUser, type NewUserSettings, type UserSettings } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function createUser(userData: NewUser) {
  const [user] = await db.insert(users).values(userData).returning();
  
  await db.insert(userSettings).values({
    userId: user.id,
    requireRepoDeleteConfirmation: true,
    disableBulkOperations: false,
  });
  
  return user;
}

export async function findOrCreateUser(githubId: string, email: string, name?: string) {
  const existingUser = await db.select().from(users).where(eq(users.githubId, githubId)).limit(1);
  
  if (existingUser.length > 0) {
    return existingUser[0];
  }
  
  return createUser({
    githubId,
    email,
    name: name || null,
  });
}

export async function getUserSettings(userId: number): Promise<UserSettings | null> {
  const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return settings.length > 0 ? settings[0] : null;
}

export async function updateUserSettings(userId: number, settingsData: Partial<NewUserSettings>) {
  await db
    .update(userSettings)
    .set({
      ...settingsData,
      updatedAt: new Date(),
    })
    .where(eq(userSettings.userId, userId));
  
  revalidatePath('/settings');
} 