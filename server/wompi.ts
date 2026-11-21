// Pasarela de pagos Wompi (Colombia). Solo lo necesario para cobrar un periodo con el
// checkout web y confirmar el pago por webhook. Documentación: https://docs.wompi.co
import { safeEqual, sha256 } from "./crypto";

const env = () => ({
  publicKey: process.env.WOMPI_PUBLIC_KEY,
  privateKey: process.env.WOMPI_PRIVATE_KEY,
  integrity: process.env.WOMPI_INTEGRITY_SECRET,
  events: process.env.WOMPI_EVENTS_SECRET,
});

/** Hay llaves para cobrar (pública y secreto de integridad) y para confirmar (secreto de eventos). */
export const wompiReady = () => {
  const e = env();
  return !!(e.publicKey && e.integrity && e.events);
};

const apiBase = () => (env().publicKey?.startsWith("pub_prod_") ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1");

/** Firma de integridad: SHA256 de referencia + monto en centavos + moneda + secreto. */
export function integritySignature(reference: string, amountInCents: number, currency: string, secret = env().integrity!): string {
  return sha256(`${reference}${amountInCents}${currency}${secret}`);
}

/** URL del checkout web de Wompi para pagar una referencia. El monto va en pesos. */
export function checkoutUrl(input: { reference: string; total: number; email: string; redirectUrl: string }): string {
  const cents = input.total * 100;
  const params = new URLSearchParams({
    "public-key": env().publicKey!,
    currency: "COP",
    "amount-in-cents": String(cents),
    reference: input.reference,
    "signature:integrity": integritySignature(input.reference, cents, "COP"),
    "redirect-url": input.redirectUrl,
    "customer-data:email": input.email,
  });
  return `https://checkout.wompi.co/p/?${params}`;
}

export type WompiTransaction = {
  id: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type?: string;
};

export type WompiEvent = {
  event: string;
  data: { transaction?: WompiTransaction } & Record<string, unknown>;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
};

/**
 * Valida la firma de un evento: SHA256 de los valores de `signature.properties`
 * (en ese orden) + timestamp + secreto de eventos.
 */
export function verifyEvent(event: WompiEvent, secret = env().events): boolean {
  if (!secret || !event?.signature?.checksum || !Array.isArray(event.signature.properties)) return false;
  const values = event.signature.properties.map((path) =>
    path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], event.data),
  );
  if (values.some((value) => value === undefined || value === null)) return false;
  const expected = sha256(`${values.join("")}${event.timestamp}${secret}`);
  return safeEqual(expected, String(event.signature.checksum).toLowerCase());
}

/** Consulta la transacción en Wompi con la llave privada, para no depender solo del evento. */
export async function fetchTransaction(id: string): Promise<WompiTransaction | null> {
  const { privateKey } = env();
  if (!privateKey) return null;
  const res = await fetch(`${apiBase()}/transactions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${privateKey}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Wompi respondió ${res.status}`);
  return ((await res.json()) as { data: WompiTransaction }).data;
}
