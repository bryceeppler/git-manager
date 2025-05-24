"use client";

import { useState } from "react";
import { GitHubRepository } from "@/lib/github-api";
import { deleteRepository } from "@/lib/actions/repository-actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useUserSettingsContext } from "./user-settings-provider";

interface BulkDeleteDialogProps {
  selectedRepositories: Set<number>;
  repositories: GitHubRepository[];
  onBulkDelete: (deletedIds: number[]) => void;
  onSelectionChange: (selectedIds: Set<number>) => void;
}

export function BulkDeleteDialog({ selectedRepositories, repositories, onBulkDelete, onSelectionChange }: BulkDeleteDialogProps) {
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [repositoriesToDelete, setRepositoriesToDelete] = useState<Set<number>>(new Set());
  const [confirmationInputs, setConfirmationInputs] = useState<Record<number, string>>({});
  const { requireRepoDeleteConfirmation } = useUserSettingsContext();

  // Initialize repositories to delete when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setRepositoriesToDelete(new Set(selectedRepositories));
      setConfirmationInputs({});
    } else {
      setRepositoriesToDelete(new Set());
      setConfirmationInputs({});
    }
  };

  const removeRepository = (repoId: number) => {
    const newRepos = new Set(repositoriesToDelete);
    newRepos.delete(repoId);
    setRepositoriesToDelete(newRepos);
    
    const newInputs = { ...confirmationInputs };
    delete newInputs[repoId];
    setConfirmationInputs(newInputs);

    // Also remove from parent's selected repositories
    const updatedSelection = new Set(selectedRepositories);
    updatedSelection.delete(repoId);
    onSelectionChange(updatedSelection);
  };

  const updateConfirmationInput = (repoId: number, value: string) => {
    setConfirmationInputs(prev => ({
      ...prev,
      [repoId]: value
    }));
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const reposToDelete = repositories.filter(repo => repositoriesToDelete.has(repo.id));
    
    try {
      const deletePromises = reposToDelete.map(repo =>
        deleteRepository(repo.owner.login, repo.name)
      );

      const results = await Promise.allSettled(deletePromises);
      
      let successCount = 0;
      let errorCount = 0;
      const deletedIds: number[] = [];
      
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
          deletedIds.push(reposToDelete[index].id);
        } else {
          errorCount++;
          console.error(`Failed to delete ${reposToDelete[index].name}`);
        }
      });

      if (successCount > 0) {
        onBulkDelete(deletedIds);
        setIsOpen(false);
        
        if (errorCount === 0) {
          toast.success(`Successfully deleted ${successCount} ${successCount === 1 ? 'repository' : 'repositories'}`);
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

  const reposToDelete = repositories.filter(repo => repositoriesToDelete.has(repo.id));
  const isDisabled = selectedRepositories.size === 0;

  // Check if all required confirmations are entered
  const allConfirmationsValid = requireRepoDeleteConfirmation 
    ? reposToDelete.every(repo => confirmationInputs[repo.id] === repo.name)
    : true;

  const canDelete = repositoriesToDelete.size > 0 && allConfirmationsValid && !isBulkDeleting;

  const dialogTitle = selectedRepositories.size === 1 
    ? "Delete Repository" 
    : `Delete ${selectedRepositories.size} Repositories`;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Trash2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            Delete Selected ({selectedRepositories.size})
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {repositoriesToDelete.size === 0 ? (
              <span className="text-muted-foreground">
                No repositories selected for deletion.
              </span>
            ) : (
              <span>
                {repositoriesToDelete.size === 1 
                  ? "This action will permanently delete the repository. This cannot be undone."
                  : `This action will permanently delete ${repositoriesToDelete.size} repositories. This cannot be undone.`
                }
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {repositoriesToDelete.size > 0 && (
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {reposToDelete.map(repo => (
              <div key={repo.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm font-medium text-destructive">
                      {repo.full_name}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRepository(repo.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      disabled={isBulkDeleting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {repo.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  
                  {requireRepoDeleteConfirmation && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Type <span className="font-mono font-bold">{repo.name}</span> to confirm:
                      </label>
                      <Input
                        type="text"
                        value={confirmationInputs[repo.id] || ""}
                        onChange={(e) => updateConfirmationInput(repo.id, e.target.value)}
                        placeholder={repo.name}
                        className="text-sm"
                        disabled={isBulkDeleting}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <AlertDialogFooter className="flex-shrink-0">
          <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            disabled={!canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBulkDeleting 
              ? "Deleting..." 
              : repositoriesToDelete.size === 1 
                ? "Delete Repository" 
                : `Delete ${repositoriesToDelete.size} Repositories`
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 