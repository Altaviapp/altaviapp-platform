// Webhook de Wompi. La firma se valida dentro de handleWompiEvent; este es el único
// camino por el que un pago queda aplicado.
import { scoped } from "@/db/client";
import { handleWompiEvent } from "@/server/billing";
import { toolsFor } from "@/server/core";
import type { WompiEvent } from "@/server/wompi";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let event: WompiEvent;
  try {
    event = (await request.json()) as WompiEvent;
  } catch {
    return new Response("cuerpo inválido", { status: 400 });
  }
  const outcome = await scoped("system", async (tx) => {
    const { tools, flush } = toolsFor(tx);
    const result = await handleWompiEvent(tools, event);
    await flush();
    return result;
  });
  console.log(`Wompi: ${outcome}`);
  // Wompi reintenta si no recibe 200; una firma inválida no merece reintento pero sí rechazo.
  return new Response(outcome, { status: outcome === "firma inválida" ? 401 : 200 });
}
