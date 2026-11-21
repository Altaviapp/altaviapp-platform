// Prepara .env.development.local para la versión de desarrollo: genera una vez las llaves
// de notificaciones push, para poder probarlas desde un teléfono real.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { generateVAPIDKeys } from "web-push";

const file = ".env.development.local";
const current = existsSync(file) ? readFileSync(file, "utf8") : "";
if (!/^VAPID_PRIVATE_KEY=/m.test(current)) {
  const keys = generateVAPIDKeys();
  const lines = [
    `VAPID_PUBLIC_KEY=${keys.publicKey}`,
    `VAPID_PRIVATE_KEY=${keys.privateKey}`,
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`,
    "VAPID_SUBJECT=mailto:desarrollo@abordo.local",
  ];
  writeFileSync(file, `${current.trimEnd()}\n${lines.join("\n")}\n`.trimStart());
  console.log("Llaves de push generadas en .env.development.local");
}
