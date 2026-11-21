import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import "./globals.css";
import { Providers } from "@/components/session";

export const metadata: Metadata = {
  title: "Abordo",
  description: "Rutas escolares en vivo para colegios, conductores y familias.",
  appleWebApp: { capable: true, title: "Abordo", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#12301f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Cada página se sirve por petición para que lleve el valor de un solo uso de la CSP (proxy.ts).
  await connection();
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
