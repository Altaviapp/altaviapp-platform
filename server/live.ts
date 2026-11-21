// Tiempo real: Postgres avisa (LISTEN/NOTIFY) qué etiquetas cambiaron en qué colegio y
// este proceso lo reparte a los navegadores conectados por Server-Sent Events.
// Como el aviso pasa por Postgres, funciona igual con varias réplicas de la app.
import { rawClient } from "@/db/client";

type Send = (tags: string[]) => void;
type Hub = { channels: Map<string, Set<Send>>; listening?: Promise<unknown> };
const state = globalThis as { __abordoHub?: Hub };
const hub: Hub = (state.__abordoHub ??= { channels: new Map<string, Set<Send>>() });

function listen() {
  hub.listening ??= rawClient()
    .listen("abordo", (payload) => {
      try {
        const { s, t } = JSON.parse(payload) as { s: string; t: string[] };
        hub.channels.get(s)?.forEach((send) => send(t));
      } catch {}
    })
    .catch((error) => {
      hub.listening = undefined;
      console.error("LISTEN falló:", (error as Error).message);
    });
  return hub.listening;
}

/** Suscribe una conexión al canal de un colegio (o "platform"). Devuelve cómo salir. */
export async function subscribe(channel: string, send: Send): Promise<() => void> {
  await listen();
  const set = hub.channels.get(channel) ?? new Set();
  set.add(send);
  hub.channels.set(channel, set);
  return () => {
    set.delete(send);
    if (!set.size) hub.channels.delete(channel);
  };
}
