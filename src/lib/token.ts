import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Server-side secret key for encrypting game tokens
// In production, use an environment variable
const SECRET = process.env.GAME_SECRET || "wordly-default-secret-key-32ch";
const ALGO = "aes-256-cbc";

function getKey(): Buffer {
  // Ensure exactly 32 bytes
  const key = Buffer.alloc(32);
  Buffer.from(SECRET, "utf-8").copy(key);
  return key;
}

export function encryptToken(data: Record<string, unknown>): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const json = JSON.stringify(data);
  let encrypted = cipher.update(json, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptToken(token: string): Record<string, unknown> | null {
  try {
    const [ivHex, encrypted] = token.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGO, getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}
