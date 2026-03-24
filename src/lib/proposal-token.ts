import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

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

export function decryptProposalToken(ciphertext: string | null): string | null {
  if (!ciphertext) {
    return null;
  }

  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(".");

  if (!ivHex || !authTagHex || !encryptedHex) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      ENCRYPTION_ALGORITHM,
      getTokenEncryptionKey(),
      Buffer.from(ivHex, "hex")
    );

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

function encryptProposalToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getTokenEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}.${authTag.toString("hex")}.${encrypted.toString("hex")}`;
}

function getTokenEncryptionKey(): Buffer {
  const secret =
    process.env.FRANKLIN_TOKEN_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "franklin-dev-token-secret";

  return createHash("sha256").update(secret).digest();
}
