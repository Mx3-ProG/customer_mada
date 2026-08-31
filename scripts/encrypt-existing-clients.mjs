#!/usr/bin/env node
// One-time data migration: encrypts sensitive columns of existing `clients` rows in place.
// Usage: node scripts/encrypt-existing-clients.mjs
// Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ENCRYPTION_KEY in the environment (.env).
import { createCipheriv, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv() {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* no .env file, rely on process env */
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

for (const [name, value] of Object.entries({
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ENCRYPTION_KEY,
})) {
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
}

const key = Buffer.from(ENCRYPTION_KEY, "base64");
if (key.length !== 32) {
  console.error(
    "ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded AES-256 key).",
  );
  process.exit(1);
}

const PREFIX = "v1:";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function encryptField(value) {
  if (value === null || value === undefined || value === "")
    return value ?? null;
  if (value.startsWith(PREFIX)) return value; // already migrated
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

const SENSITIVE_CLIENT_FIELDS = [
  "name",
  "siret",
  "sector",
  "phone",
  "email",
  "address",
  "website",
  "google_business",
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: rows, error } = await supabase.from("clients").select("*");
  if (error) {
    console.error("Failed to fetch clients:", error.message);
    process.exit(1);
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const update = {};
    let changed = false;

    for (const field of SENSITIVE_CLIENT_FIELDS) {
      const current = row[field];
      if (current === null || current === undefined || current === "") continue;
      if (typeof current === "string" && current.startsWith(PREFIX)) continue; // already migrated
      update[field] = encryptField(current);
      changed = true;
    }

    if (!changed) {
      skipped += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("clients")
      .update(update)
      .eq("id", row.id);
    if (updateError) {
      failed += 1;
      console.error(`Failed to migrate client ${row.id}:`, updateError.message);
      continue;
    }
    migrated += 1;
  }

  console.log(
    `Done. Migrated: ${migrated}, already encrypted: ${skipped}, failed: ${failed}.`,
  );
  if (failed > 0) process.exit(1);
}

main();
