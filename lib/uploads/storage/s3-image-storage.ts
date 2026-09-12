import 'server-only';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import type { ImageStorage } from './types';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for S3 image storage.`);
  }
  return value;
}

type Config = { client: S3Client; bucket: string };

// Storage keys are a fresh UUID per upload and are never overwritten in
// place (see the immutable Cache-Control header on app/uploads/[...path]/
// route.ts) — so once bytes for a key are fetched, they never go stale and
// can be cached indefinitely with no TTL/revalidation logic needed at all.
// This is an in-memory, per-process cache: it's not shared across multiple
// server instances if this app is ever scaled horizontally, and it resets
// on every restart/redeploy — but it still eliminates the repeat GetObject
// calls (bucket API requests, egress, and their cost) that the browser's
// own Cache-Control can't prevent: a different visitor, a cold browser
// cache, or next/image's own optimizer re-fetching the source image to
// generate a new size/quality variant all still hit this server once each,
// and this cache absorbs every one of those after the first.
const MAX_CACHE_BYTES = 200 * 1024 * 1024; // 200MB — generous for WebP thumbnails, bounded so memory can't grow unbounded

export class S3ImageStorage implements ImageStorage {
  // Built lazily, on first actual use — not at module scope. Next.js
  // collects page data for nearly every route by importing this module
  // transitively (via upload.service.ts), so an eager S3Client/env-var
  // validation here would crash the *entire build* over a missing S3_*
  // var, even for pages that never touch image storage. Deferring it means
  // a misconfigured setup only fails the specific upload attempt at
  // runtime, with the same clear error message.
  #config: Config | null = null;

  // Map insertion order doubles as recency order here: re-inserting a key
  // (in #cacheGet, on a hit) moves it to the end, so the oldest untouched
  // entry is always first — a cheap LRU without a dedicated library.
  #cache = new Map<string, Buffer>();
  #cacheBytes = 0;

  #cacheGet(key: string): Buffer | null {
    const buffer = this.#cache.get(key);
    if (!buffer) return null;
    this.#cache.delete(key);
    this.#cache.set(key, buffer);
    return buffer;
  }

  #cacheStore(key: string, buffer: Buffer): void {
    // A single file larger than the whole budget would otherwise evict
    // everything else just to hold it — not worth it, skip caching it.
    if (buffer.byteLength > MAX_CACHE_BYTES) return;
    this.#cache.set(key, buffer);
    this.#cacheBytes += buffer.byteLength;
    while (this.#cacheBytes > MAX_CACHE_BYTES) {
      const oldestKey = this.#cache.keys().next().value;
      if (oldestKey === undefined) break;
      const oldestSize = this.#cache.get(oldestKey)?.byteLength ?? 0;
      this.#cache.delete(oldestKey);
      this.#cacheBytes -= oldestSize;
    }
  }

  #cacheEvict(key: string): void {
    const buffer = this.#cache.get(key);
    if (!buffer) return;
    this.#cache.delete(key);
    this.#cacheBytes -= buffer.byteLength;
  }

  #getConfig(): Config {
    if (!this.#config) {
      this.#config = {
        bucket: requireEnv('S3_BUCKET'),
        client: new S3Client({
          endpoint: requireEnv('S3_ENDPOINT'),
          region: process.env.S3_REGION || 'auto',
          forcePathStyle: true,
          credentials: {
            accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
            secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
          },
        }),
      };
    }
    return this.#config;
  }

  async upload(buffer: Buffer, storageKey: string): Promise<void> {
    const { client, bucket } = this.#getConfig();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: 'image/webp',
      }),
    );
    // Seed the cache with what we just uploaded — the very next read (e.g.
    // the admin's own page re-rendering right after upload) is guaranteed
    // to be for these exact bytes, so there's no reason to make it a real
    // GetObject round trip.
    this.#cacheStore(storageKey, buffer);
  }

  async delete(storageKey: string): Promise<void> {
    // Evict first regardless of whether the remote delete below succeeds —
    // a cached copy of a key the caller is actively trying to remove must
    // never keep being served, even if the S3 call itself fails/retries.
    this.#cacheEvict(storageKey);
    try {
      const { client, bucket } = this.#getConfig();
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
    } catch (error) {
      console.error(`Failed to delete uploaded image "${storageKey}":`, error);
    }
  }

  getUrl(storageKey: string): string {
    // Served via app/uploads/[...path]/route.ts — Railway Storage Buckets
    // (and many S3-compatible providers) don't support public read access,
    // so the bucket is never addressed directly by the browser. The route
    // reads the object back server-side instead.
    return `/uploads/${storageKey}`;
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const { client, bucket } = this.#getConfig();
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: storageKey }));
      return true;
    } catch {
      return false;
    }
  }

  async read(storageKey: string): Promise<Buffer | null> {
    const cached = this.#cacheGet(storageKey);
    if (cached) return cached;

    try {
      const { client, bucket } = this.#getConfig();
      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: storageKey }));
      if (!response.Body) return null;
      const bytes = await response.Body.transformToByteArray();
      const buffer = Buffer.from(bytes);
      this.#cacheStore(storageKey, buffer);
      return buffer;
    } catch (error) {
      const err = error as { name?: string };
      if (err.name !== 'NoSuchKey') {
        console.error(`Failed to read uploaded image "${storageKey}":`, error);
      }
      return null;
    }
  }
}
