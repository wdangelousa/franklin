import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { getTokenSecrets } from "@/lib/auth/secrets";

const PUBLIC_TOKEN_PREFIX = "frkpub";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

export interface GeneratedProposalToken {
  value: string;
  prefix: string;
  hash: string;
  ciphertext: string;
}

export function createProposalToken(): GeneratedProposalToken {
  const randomSegment = randomBytes(24).toString("base64url");
  const value = `${PUBLIC_TOKEN_PREFIX}_${randomSegment}`;

  return {
    value,
    prefix: value.slice(0, 16),
    hash: hashProposalToken(value),
    ciphertext: encryptProposalToken(value)
  };
}

export function hashProposalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Decrypts a proposal token ciphertext. Tries the primary key first,
 * then the previous key for rotation support.
 */
export function decryptProposalToken(ciphertext: string | null): string | null {
  if (!ciphertext) return null;

  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(".");
  if (!ivHex || !authTagHex || !encryptedHex) return null;

  const { primary, previous } = getTokenSecrets();

  // Try primary key
  const result = tryDecrypt(ivHex, authTagHex, encryptedHex, deriveKey(primary));
  if (result) return result;

  // Try previous key for rotation
  if (previous) {
    return tryDecrypt(ivHex, authTagHex, encryptedHex, deriveKey(previous));
  }

  return null;
}

function encryptProposalToken(token: string): string {
  const { primary } = getTokenSecrets();
  const key = deriveKey(primary);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}.${authTag.toString("hex")}.${encrypted.toString("hex")}`;
}

function tryDecrypt(ivHex: string, authTagHex: string, encryptedHex: string, key: Buffer): string | null {
  try {
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}
