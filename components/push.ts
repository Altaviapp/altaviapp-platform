// Notificaciones push del navegador (Web Push con llave VAPID pública).

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export type PushSupport = "ready" | "unconfigured" | "unsupported" | "needs-install";

export function pushSupport(): PushSupport {
  if (!KEY) return "unconfigured";
  if (typeof window === "undefined") return "unsupported";
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
  // En iPhone el push solo existe con la app instalada en la pantalla de inicio.
  if (ios && !standalone) return "needs-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  return "ready";
}

function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

/** Pide permiso y devuelve la suscripción para guardarla en el servidor. */
export async function subscribePush(): Promise<{ endpoint: string; p256dh: string; auth: string }> {
  if ((await Notification.requestPermission()) !== "granted") {
    throw new Error("Activa las notificaciones de Abordo en los ajustes de tu navegador.");
  }
  await navigator.serviceWorker.register("/sw.js");
  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(KEY!) }));
  const json = subscription.toJSON();
  return { endpoint: json.endpoint!, p256dh: json.keys!.p256dh, auth: json.keys!.auth };
}

/** Cancela la suscripción de este dispositivo y devuelve su endpoint. */
export async function unsubscribePush(): Promise<string | null> {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return null;
  await subscription.unsubscribe();
  return subscription.endpoint;
}
