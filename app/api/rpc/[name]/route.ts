// Punto único de la API: POST /api/rpc/modulo.funcion con { args }.
import { findFn } from "@/server/api";
import { AppError, run } from "@/server/core";
import { clientIp, readToken, sameOrigin, sessionCookie } from "@/server/http";

export const dynamic = "force-dynamic";
const MAX_BODY = 512 * 1024;

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });

export async function POST(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const fn = findFn((await params).name);
  if (!fn) return json({ error: "No existe." }, 404);
  const { token, viaCookie } = readToken(request);
  if (viaCookie && !sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ error: "La petición es demasiado grande." }, 413);
    const body = text ? (JSON.parse(text) as { args?: unknown }) : {};
    const result = await run(fn, body.args, { token, ip: clientIp(request) });
    const headers: Record<string, string> = {};
    if (result.session !== undefined) headers["set-cookie"] = sessionCookie(result.session);
    // Las apps nativas no usan cookie: reciben el token en la respuesta.
    const native = request.headers.get("x-abordo-client") === "native";
    return json({ data: result.data, tags: result.tags, ...(native && result.session ? { session: result.session } : {}) }, 200, headers);
  } catch (error) {
    if (error instanceof AppError) return json({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return json({ error: "Los datos enviados no son válidos." }, 400);
    console.error("Error interno:", error);
    return json({ error: "Algo salió mal. Intenta de nuevo." }, 500);
  }
}
