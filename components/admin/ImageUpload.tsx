'use client';

import { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatFileSize } from '@/lib/utils/format-file-size';
import { uploadImageAction } from '@/app/actions/uploads';
import { UPLOAD_ALLOWED_MIME_TYPES, UPLOAD_MAX_SIZE_BYTES } from '@/lib/uploads/upload.constants';
import type { UploadDestination } from '@/lib/uploads/upload.constants';
import type { UploadedImageMetadata } from '@/lib/uploads/upload.service';

const ALLOWED_MIME_LIST: readonly string[] = UPLOAD_ALLOWED_MIME_TYPES;

export function ImageUpload({
  destination,
  onUploaded,
  disabled,
}: {
  destination: UploadDestination;
  onUploaded: (metadata: UploadedImageMetadata) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  async function handleFile(file: File) {
    setError(null);

    // Client-side pre-check is UX only — the real validation happens
    // server-side in the upload Server Action regardless of this check.
    if (!ALLOWED_MIME_LIST.includes(file.type)) {
      setError('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, AVIF.');
      return;
    }
    if (file.size > UPLOAD_MAX_SIZE_BYTES) {
      setError(`File is too large — max ${formatFileSize(UPLOAD_MAX_SIZE_BYTES)}.`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImageAction(destination, formData);
      if ('error' in result) {
        setError(result.error);
      } else {
        onUploaded(result.data);
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const isBusy = disabled || isUploading;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={isBusy ? -1 : 0}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (isBusy) return;
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        onClick={() => !isBusy && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!isBusy && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-3 py-4 text-center text-xs transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface',
          isBusy && 'pointer-events-none cursor-default opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME_LIST.join(',')}
          className="hidden"
          disabled={isBusy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        {isUploading ? (
          <>
            <Loader2 aria-hidden="true" className="text-primary h-4 w-4 animate-spin" />
            <span className="text-muted">Uploading…</span>
          </>
        ) : (
          <>
            <UploadCloud aria-hidden="true" className="text-muted h-4 w-4" />
            <span className="text-midnight font-medium">Drop image or click to browse</span>
            <span className="text-muted">
              JPEG, PNG, WebP, GIF, or AVIF — max {formatFileSize(UPLOAD_MAX_SIZE_BYTES)}
            </span>
          </>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              inputRef.current?.click();
            }}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
