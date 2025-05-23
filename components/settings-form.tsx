"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { updateUserSettings } from "@/lib/actions/user-settings";
import type { UserSettings } from "@/lib/db/schema";

const settingsSchema = z.object({
  requireRepoDeleteConfirmation: z.boolean(),
  disableBulkOperations: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  userId: number;
  initialSettings: UserSettings | null;
}

export function SettingsForm({ userId, initialSettings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      requireRepoDeleteConfirmation:
        initialSettings?.requireRepoDeleteConfirmation ?? true,
      disableBulkOperations: initialSettings?.disableBulkOperations ?? false,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      await updateUserSettings(userId, data);
      form.reset(data);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Safety & Preferences</CardTitle>
            <CardDescription className="text-base">
              Configure how Git Manager behaves when performing operations on
              your repositories.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="requireRepoDeleteConfirmation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-background/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium">
                      Require confirmation before deleting repositories
                    </FormLabel>
                    <FormDescription className="text-sm">
                      When enabled, you&apos;ll need to type the repository name
                      to confirm deletion. This helps prevent accidental
                      deletions and provides an extra layer of safety.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disableBulkOperations"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-background/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium">
                      Disable bulk operations
                    </FormLabel>
                    <FormDescription className="text-sm">
                      When enabled, bulk operations (like deleting multiple
                      repositories at once) will be disabled for extra safety.
                      You&apos;ll need to delete repositories one at a time.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading || !form.formState.isDirty} size="lg">
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
