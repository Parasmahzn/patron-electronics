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
    throw new Error(`${name} is required when STORAGE_PROVIDER=s3.`);
  }
  return value;
}

type Config = { client: S3Client; bucket: string };

export class S3ImageStorage implements ImageStorage {
  // Built lazily, on first actual use — not at module scope. Next.js
  // collects page data for nearly every route by importing this module
  // transitively (via upload.service.ts), so an eager S3Client/env-var
  // validation here would crash the *entire build* over a missing S3_*
  // var, even for pages that never touch image storage. Deferring it means
  // a misconfigured setup only fails the specific upload attempt at
  // runtime, with the same clear error message.
  #config: Config | null = null;

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
  }

  async delete(storageKey: string): Promise<void> {
    try {
      const { client, bucket } = this.#getConfig();
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
    } catch (error) {
      console.error(`Failed to delete uploaded image "${storageKey}":`, error);
    }
  }

  getUrl(storageKey: string): string {
    // Served via app/uploads/[...path]/route.ts, same as LocalImageStorage —
    // Railway Storage Buckets (and many S3-compatible providers) don't
    // support public read access, so the bucket is never addressed directly
    // by the browser. The route reads the object back server-side instead.
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
    try {
      const { client, bucket } = this.#getConfig();
      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: storageKey }));
      if (!response.Body) return null;
      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (error) {
      const err = error as { name?: string };
      if (err.name !== 'NoSuchKey') {
        console.error(`Failed to read uploaded image "${storageKey}":`, error);
      }
      return null;
    }
  }
}
