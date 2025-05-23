'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserSettingsContext } from './user-settings-provider';

interface DeleteRepoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  repoName: string;
  isLoading?: boolean;
}

export function DeleteRepoDialog({
  isOpen,
  onClose,
  onConfirm,
  repoName,
  isLoading = false,
}: DeleteRepoDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const { requireRepoDeleteConfirmation } = useUserSettingsContext();

  const handleConfirm = () => {
    if (requireRepoDeleteConfirmation && confirmationText !== repoName) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  const isConfirmationValid = !requireRepoDeleteConfirmation || confirmationText === repoName;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Repository</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the{' '}
            <strong>{repoName}</strong> repository.
          </DialogDescription>
        </DialogHeader>

        {requireRepoDeleteConfirmation && (
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <strong>{repoName}</strong> to confirm deletion:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={repoName}
              autoComplete="off"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Repository'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 