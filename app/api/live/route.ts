// Canal de tiempo real (Server-Sent Events) del colegio de la sesión.
import { scoped } from "@/db/client";
import { sessionUser } from "@/server/core";
import { readToken } from "@/server/http";
import { subscribe } from "@/server/live";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { token } = readToken(request);
  const user = await scoped("system", (tx) => sessionUser(tx, token, Date.now()));
  if (!user) return new Response(null, { status: 401 });
  const channel = user.schoolId ?? "platform";
  const encoder = new TextEncoder();
  let leave: (() => void) | undefined;
  let beat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {}
      };
      leave = await subscribe(channel, (tags) => write(`data: ${JSON.stringify(tags)}\n\n`));
      write(": conectado\n\n");
      beat = setInterval(() => write(": latido\n\n"), 25000);
      request.signal.addEventListener("abort", () => {
        clearInterval(beat);
        leave?.();
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      clearInterval(beat);
      leave?.();
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" },
  });
}
