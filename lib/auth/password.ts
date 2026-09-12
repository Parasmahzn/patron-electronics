import 'server-only';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Fixed 12-round hash of an arbitrary string — not secret, it will never
// match a real password. It exists only so a login attempt against an
// email that doesn't exist still pays the same bcrypt cost as one that
// does, instead of short-circuiting to a fast `false` that would let an
// attacker enumerate valid admin emails by measuring response time.
const DUMMY_HASH = '$2b$12$exxq0ywzPrlwxqUgG83ZROQjXUH1dwVAnAxgfDi75f7smkaWcUklu';

export async function verifyLoginPassword(
  password: string,
  hash: string | null | undefined,
): Promise<boolean> {
  return bcrypt.compare(password, hash ?? DUMMY_HASH);
}
