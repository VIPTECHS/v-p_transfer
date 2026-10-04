import crypto from "node:crypto";
import { getJwtSecret } from "../middleware/auth.js";

// Veritabanında saklanan gizli değerleri (AI API anahtarı) AES-256-GCM ile
// şifreler. Anahtar JWT_SECRET'tan türetilir; JWT_SECRET değişirse şifreli
// değerler çözülemez ve admin panelden yeniden girilmesi gerekir.
function key() {
  return crypto.createHash("sha256").update(`vip-ai-settings:${getJwtSecret()}`).digest();
}

export function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(payload) {
  try {
    const [v, iv, tag, data] = String(payload).split(":");
    if (v !== "v1") return "";
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
