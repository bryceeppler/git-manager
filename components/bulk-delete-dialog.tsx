"use client";

import { useState } from "react";
import { GitHubRepository } from "@/lib/github-api";
import { deleteRepository } from "@/lib/actions/repository-actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserSettingsContext } from "./user-settings-provider";

interface BulkDeleteDialogProps {
  selectedRepositories: Set<number>;
  repositories: GitHubRepository[];
  onBulkDelete: (deletedIds: number[]) => void;
}

export function BulkDeleteDialog({ selectedRepositories, repositories, onBulkDelete }: BulkDeleteDialogProps) {
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { disableBulkOperations } = useUserSettingsContext();

  const handleBulkDelete = async () => {
    if (disableBulkOperations) {
      toast.error("Bulk operations are disabled in your settings");
      return;
    }

    setIsBulkDeleting(true);
    const selectedRepos = repositories.filter(repo => selectedRepositories.has(repo.id));
    
    try {
      const deletePromises = selectedRepos.map(repo =>
        deleteRepository(repo.owner.login, repo.name)
      );

      const results = await Promise.allSettled(deletePromises);
      
      let successCount = 0;
      let errorCount = 0;
      const deletedIds: number[] = [];
      
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
          deletedIds.push(selectedRepos[index].id);
        } else {
          errorCount++;
          console.error(`Failed to delete ${selectedRepos[index].name}`);
        }
      });

      if (successCount > 0) {
        onBulkDelete(deletedIds);
        
        if (errorCount === 0) {
          toast.success(`Successfully deleted ${successCount} repositories`);
        } else {
          toast.success(`Deleted ${successCount} repositories. ${errorCount} failed.`);
        }
      }
      
      if (errorCount > 0 && successCount === 0) {
        toast.error("Failed to delete repositories");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete repositories");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const selectedRepos = repositories.filter(repo => selectedRepositories.has(repo.id));
  const isDisabled = selectedRepositories.size === 0 || disableBulkOperations;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isDisabled}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Selected ({selectedRepositories.size})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Repositories</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Are you sure you want to delete these {selectedRepositories.size} repositories? 
              This action cannot be undone.
            </span>
            <div className="max-h-32 overflow-y-auto bg-muted/50 rounded p-2 text-sm">
              {selectedRepos.map(repo => (
                <div key={repo.id} className="text-destructive font-mono">
                  {repo.full_name}
                </div>
              ))}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBulkDeleting ? "Deleting..." : "Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 