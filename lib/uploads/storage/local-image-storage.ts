import 'server-only';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { ImageStorage } from './types';

const PUBLIC_IMAGES_ROOT = path.join(process.cwd(), 'public', 'images');

function resolvePath(storageKey: string): string {
  const filePath = path.join(PUBLIC_IMAGES_ROOT, storageKey);
  const normalizedRoot = PUBLIC_IMAGES_ROOT + path.sep;
  if (!filePath.startsWith(normalizedRoot)) {
    throw new Error('Invalid storage key.');
  }
  return filePath;
}

export class LocalImageStorage implements ImageStorage {
  async upload(buffer: Buffer, storageKey: string): Promise<void> {
    const filePath = resolvePath(storageKey);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await fs.unlink(resolvePath(storageKey));
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        console.error(`Failed to delete uploaded image "${storageKey}":`, err);
      }
    }
  }

  getUrl(storageKey: string): string {
    // Served via app/uploads/[...path]/route.ts, not Next's static public/
    // serving — that mechanism freezes its file list at server boot and
    // never sees files written afterward (i.e. every upload).
    return `/uploads/${storageKey}`;
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      await fs.access(resolvePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }

  async read(storageKey: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(resolvePath(storageKey));
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        console.error(`Failed to read uploaded image "${storageKey}":`, err);
      }
      return null;
    }
  }
}
