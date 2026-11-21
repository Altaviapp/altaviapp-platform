import type { NextConfig } from "next";

// Cabeceras de seguridad comunes a todas las respuestas. La política de contenido (CSP)
// de las páginas se arma por petición en proxy.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const config: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  devIndicators: false,
  poweredByHeader: false,
  // Desarrollo desde el celular por la tailnet (https://equipo.tu-tailnet.ts.net).
  allowedDevOrigins: ["**.ts.net"],
  output: "standalone", // imagen de Docker mínima
  serverExternalPackages: ["postgres", "nodemailer", "web-push"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
