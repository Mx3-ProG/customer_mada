// Server-only field-level encryption for sensitive client data at rest.
// SECURITY: Never import this from a component/hook — only from *.server.ts or *.functions.ts handlers.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const PREFIX = "v1:";

let cachedKey: Buffer | undefined;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env["ENCRYPTION_KEY"];
  if (!raw) {
    throw new Error(
      "Missing ENCRYPTION_KEY environment variable. Check your .env configuration.",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded AES-256 key).",
    );
  }
  cachedKey = key;
  return key;
}

/** Encrypts a single field value. Returns null/empty input unchanged. */
export function encryptField(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "")
    return value ?? null;
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

/**
 * Decrypts a single field value. Values that don't carry the `v1:` prefix are
 * returned as-is (not-yet-migrated legacy data, or a value that was never encrypted).
 */
export function decryptField(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "")
    return value ?? null;
  if (!value.startsWith(PREFIX)) return value;

  const [ivB64, authTagB64, ciphertextB64] = value
    .slice(PREFIX.length)
    .split(":");
  if (!ivB64 || !authTagB64 || !ciphertextB64) return value;

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Columns in `public.clients` treated as sensitive and encrypted at rest. */
export const SENSITIVE_CLIENT_FIELDS = [
  "name",
  "siret",
  "sector",
  "phone",
  "email",
  "address",
  "website",
  "google_business",
] as const;

type SensitiveField = (typeof SENSITIVE_CLIENT_FIELDS)[number];

/** Encrypts the sensitive fields of a client draft before it is written to the DB. */
export function encryptClientDraft<
  T extends Partial<Record<SensitiveField, string | null>>,
>(draft: T): T {
  const result: Record<string, unknown> = { ...draft };
  for (const field of SENSITIVE_CLIENT_FIELDS) {
    if (field in draft) {
      result[field] = encryptField(draft[field]);
    }
  }
  return result as T;
}

/** Decrypts the sensitive fields of a client row read from the DB. */
export function decryptClientRow<
  T extends Partial<Record<SensitiveField, string | null>>,
>(row: T): T {
  const result: Record<string, unknown> = { ...row };
  for (const field of SENSITIVE_CLIENT_FIELDS) {
    if (field in row) {
      result[field] = decryptField(row[field]);
    }
  }
  return result as T;
}
