// Criptografía del servidor: hashes, tokens y cifrado de los vectores de rostro.
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
export const randomToken = () => randomBytes(32).toString("hex");
export const randomDigits = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Llave de 32 bytes para los datos biométricos. Obligatoria en producción. */
function faceKey(): Buffer {
  const value = process.env.FACE_KEY;
  if (value) {
    const key = Buffer.from(value, "base64");
    if (key.length !== 32) throw new Error("FACE_KEY debe ser de 32 bytes en base64");
    return key;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Falta FACE_KEY");
  return createHash("sha256").update("abordo-solo-desarrollo").digest();
}

/** Cifra con AES-256-GCM. Formato: iv.etiqueta.datos, en base64. */
export function seal(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", faceKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

export function unseal<T>(sealed: string): T {
  const [iv, tag, data] = sealed.split(".").map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", faceKey(), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8")) as T;
}
