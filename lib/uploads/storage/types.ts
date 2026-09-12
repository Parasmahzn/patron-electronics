export interface ImageStorage {
  /** Writes the buffer under `storageKey`, creating any needed destination path. */
  upload(buffer: Buffer, storageKey: string): Promise<void>;
  /** Best-effort delete. Implementations should not throw if the key is already gone. */
  delete(storageKey: string): Promise<void>;
  /** Renderable, public-facing path for a stored key. */
  getUrl(storageKey: string): string;
  exists(storageKey: string): Promise<boolean>;
  /** Reads the stored bytes back, or `null` if the key doesn't exist. */
  read(storageKey: string): Promise<Buffer | null>;
}
