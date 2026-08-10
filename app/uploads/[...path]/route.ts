import path from 'node:path';
import fs from 'node:fs/promises';
import { NextResponse, type NextRequest } from 'next/server';
import { isValidStorageKey } from '@/lib/uploads/storage-key';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'images');

// Next.js's `public/` folder serving computes its set of servable files once
// at server boot (`next start`) and never rescans afterward, so files that
// appear after boot — every runtime upload, by definition — 404 forever
// under that mechanism regardless of what's actually on disk. This route
// handler serves uploaded images itself, reading the filesystem fresh on
// every request instead.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const storageKey = segments.join('/');

  if (!isValidStorageKey(storageKey)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const buffer = await fs.readFile(path.join(UPLOADS_ROOT, storageKey));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/webp',
        // Safe to cache aggressively: storage keys are a fresh UUID per
        // upload and are never overwritten in place.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT') {
      console.error(`Failed to read uploaded image "${storageKey}":`, err);
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
