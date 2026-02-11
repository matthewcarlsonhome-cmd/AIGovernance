'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileUploadProps {
  /** Supabase Storage bucket name. */
  bucket: string;
  /** Path prefix within the bucket (e.g. `projects/abc-123/evidence`). */
  path: string;
  /** Called with the public URL of the uploaded file on success. */
  onUpload: (url: string) => void;
  /**
   * Comma-separated MIME types or file extensions to accept.
   * Examples: `".pdf,.docx"` or `"application/pdf,image/*"`.
   */
  accept?: string;
  /** Maximum file size in megabytes. Defaults to 10 MB. */
  maxSizeMB?: number;
  /** Optional additional className for the outer wrapper. */
  className?: string;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FileUpload({
  bucket,
  path,
  onUpload,
  accept,
  maxSizeMB = 10,
  className,
}: FileUploadProps): React.ReactElement {
  const [state, setState] = React.useState<UploadState>('idle');
  const [progress, setProgress] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ---- Validation ---------------------------------------------------------

  function validateFile(file: File): string | null {
    // Size check
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds the ${maxSizeMB} MB limit.`;
    }

    // Type check (if accept is provided)
    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
      const fileMime = file.type.toLowerCase();

      const isAccepted = acceptedTypes.some((acceptType) => {
        if (acceptType.startsWith('.')) {
          return fileExt === acceptType;
        }
        if (acceptType.endsWith('/*')) {
          const baseType = acceptType.replace('/*', '');
          return fileMime.startsWith(baseType);
        }
        return fileMime === acceptType;
      });

      if (!isAccepted) {
        return `File type "${file.type || fileExt}" is not accepted. Accepted: ${accept}`;
      }
    }

    return null;
  }

  // ---- Upload -------------------------------------------------------------

  async function handleUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setState('error');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase is not configured. File upload is unavailable.');
      setState('error');
      return;
    }

    setState('uploading');
    setProgress(0);
    setFileName(file.name);
    setErrorMessage('');

    try {
      const supabase = createClient();
      const filePath = `${path}/${Date.now()}-${file.name}`;

      // Simulate progress since Supabase JS v2 doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        setErrorMessage(error.message || 'Upload failed. Please try again.');
        setState('error');
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      setState('success');
      onUpload(urlData.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed unexpectedly.';
      setErrorMessage(message);
      setState('error');
    }
  }

  // ---- Event handlers -----------------------------------------------------

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  function reset() {
    setState('idle');
    setProgress(0);
    setErrorMessage('');
    setFileName('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  // ---- Render -------------------------------------------------------------

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragOver
            ? 'border-slate-900 bg-slate-50'
            : 'border-slate-300 hover:border-slate-400',
          state === 'error' && 'border-red-300 bg-red-50',
          state === 'success' && 'border-emerald-500/50 bg-emerald-500/5',
        )}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
          id="file-upload-input"
        />

        {state === 'idle' && (
          <>
            <Upload className="h-10 w-10 text-slate-400 mb-3" />
            <p className="text-sm font-medium text-slate-900">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {accept ? `Accepted: ${accept}` : 'Any file type'} &middot; Max {maxSizeMB} MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          </>
        )}

        {state === 'uploading' && (
          <div className="w-full max-w-xs space-y-3 text-center">
            <File className="h-8 w-8 text-slate-900 mx-auto" />
            <p className="text-sm font-medium text-slate-900 truncate">
              {fileName}
            </p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="w-full max-w-xs space-y-3 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-medium text-slate-900 truncate">
              {fileName}
            </p>
            <p className="text-xs text-emerald-600">
              Upload complete
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
            >
              Upload Another
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="w-full max-w-xs space-y-3 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm font-medium text-red-500">
              Upload Failed
            </p>
            <p className="text-xs text-slate-500">
              {errorMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
            >
              <X className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
