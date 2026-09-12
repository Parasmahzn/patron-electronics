'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { updateAvatarAction } from '@/app/actions/auth';
import { deleteUploadedImageAction } from '@/app/actions/uploads';

export function ChangeAvatarDialog({
  name,
  currentAvatarUrl,
  onClose,
}: {
  name: string;
  currentAvatarUrl: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The avatar this dialog opened with. Replacing it with a new upload
  // before saving is safe to clean up immediately — nothing in the DB
  // references the superseded upload yet. Key extraction happens
  // server-side inside deleteUploadedImageAction (a URL that isn't one of
  // our managed uploads safely no-ops there).
  const initialUrlRef = useRef(currentAvatarUrl ?? '');

  function handleUploaded(url: string) {
    if (avatarUrl && avatarUrl !== initialUrlRef.current) {
      void deleteUploadedImageAction(avatarUrl);
    }
    setAvatarUrl(url);
  }

  function handleClose() {
    // Discarding an uploaded-but-unsaved image — clean it up rather than
    // leaving it orphaned.
    if (avatarUrl && avatarUrl !== initialUrlRef.current) {
      void deleteUploadedImageAction(avatarUrl);
    }
    onClose();
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    const formData = new FormData();
    formData.append('avatarUrl', avatarUrl);
    const result = await updateAvatarAction(formData);
    setIsSaving(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  const hasChanged = avatarUrl !== (currentAvatarUrl ?? '');

  return (
    <Dialog title="Change Profile Picture" onClose={handleClose}>
      <div className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <div className="flex items-center gap-4">
          <Avatar name={name} src={avatarUrl || null} size={64} />
          <div className="min-w-[220px] flex-1">
            <ImageUpload
              destination="avatars"
              onUploaded={(metadata) => handleUploaded(metadata.url)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving || !hasChanged}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
