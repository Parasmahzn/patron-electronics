import { NextResponse, type NextRequest } from 'next/server';
import { isValidStorageKey } from '@/lib/uploads/storage-key';
import { getImageStorage } from '@/lib/uploads/storage';

// Neither Next.js's `public/` folder serving (which computes its set of
// servable files once at server boot and never rescans — every runtime
// upload 404s forever under it) nor a bucket's own public URL (Railway
// Storage Buckets, among others, don't support public read access at all)
// can serve a runtime-uploaded image. This route reads it back through
// whichever ImageStorage provider is active instead, on every request.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const storageKey = segments.join('/');

  if (!isValidStorageKey(storageKey)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = await getImageStorage().read(storageKey);
  if (!buffer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/webp',
      // Safe to cache aggressively: storage keys are a fresh UUID per
      // upload and are never overwritten in place.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
