import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// OWASP minimum for scrypt: N=2^17, r=8, p=1. It needs 128 MiB, above Node's 32 MiB default maxmem.
const SCRYPT_OPTIONS = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

// Stored as "<salt hex>:<key hex>".
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  const candidate = await deriveKey(password, Buffer.from(salt, "hex"));
  return timingSafeEqual(candidate, Buffer.from(key, "hex"));
}
