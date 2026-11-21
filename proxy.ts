// Cabeceras de seguridad de cada página. La política de contenido (CSP) usa un valor
// de un solo uso por petición: solo corren los scripts que la propia app entrega.
import { type NextRequest, NextResponse } from "next/server";

const origin = (url: string | undefined) => {
  try {
    return url?.startsWith("http") ? new URL(url).origin : "";
  } catch {
    return "";
  }
};

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const tiles = origin(process.env.NEXT_PUBLIC_PMTILES_URL);
  const assets = origin(process.env.NEXT_PUBLIC_MAP_ASSETS_URL ?? "https://protomaps.github.io/basemaps-assets");
  const geocoder = origin(process.env.NEXT_PUBLIC_GEOCODER_URL ?? "https://nominatim.openstreetmap.org");
  const csp = [
    "default-src 'self'",
    // 'wasm-unsafe-eval': el reconocimiento facial compila su modelo en el navegador.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", // el mapa posiciona sus elementos con estilos en línea
    `img-src 'self' data: blob: https://tile.openstreetmap.org ${assets}`,
    "font-src 'self' data:",
    `connect-src 'self' ${tiles} ${assets} ${geocoder}`,
    "worker-src 'self' blob:",
    "media-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Páginas solamente: la API y los archivos estáticos llevan sus cabeceras desde next.config.
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|models|tiles|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
