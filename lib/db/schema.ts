import { pgTable, serial, varchar, boolean, timestamp, text, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name'),
  githubId: varchar('github_id', { length: 50 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  githubIdIdx: index('users_github_id_idx').on(table.githubId),
}));

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  requireRepoDeleteConfirmation: boolean('require_repo_delete_confirmation').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_settings_user_id_idx').on(table.userId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert; 