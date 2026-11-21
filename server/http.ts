// Datos de la petición HTTP que necesita el servidor: sesión, IP y origen.
import { SESSION_COOKIE } from "./core";

/** Token de sesión: cabecera Authorization (apps nativas) o cookie (web). */
export function readToken(request: Request): { token?: string; viaCookie: boolean } {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return { token: header.slice(7).trim(), viaCookie: false };
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split(/;\s*/).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return { token: match?.slice(SESSION_COOKIE.length + 1), viaCookie: true };
}

/**
 * IP del cliente. Detrás del proxy propio (Caddy o túnel) se toma el último valor de
 * X-Forwarded-For, que es el que escribió nuestro proxy y el cliente no puede falsificar.
 */
export function clientIp(request: Request): string {
  const header = process.env.CLIENT_IP_HEADER ?? "x-forwarded-for";
  const value = request.headers.get(header);
  return value?.split(",").pop()?.trim() || "desconocida";
}

/**
 * Protección CSRF: una petición con cookie debe venir de la propia app.
 * Los navegadores envían Origin en todo POST; si no coincide con el host, se rechaza.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  const allowed = new Set<string>();
  if (process.env.APP_URL) allowed.add(new URL(process.env.APP_URL).origin);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    allowed.add(`https://${host}`);
    if (process.env.NODE_ENV !== "production") allowed.add(`http://${host}`);
  }
  return allowed.has(origin);
}

export function sessionCookie(token: string | null): string {
  const base = `${SESSION_COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return token ? `${base}; Max-Age=${90 * 24 * 3600}${secure}` : `${base}; Max-Age=0${secure}`;
}
