// Copia a public/ los archivos que el navegador carga por URL y que no se versionan:
// los modelos de reconocimiento facial (~6 MB) y el proceso auxiliar del mapa.
import { cpSync, existsSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

const faces = "node_modules/@vladmandic/face-api/model";
if (existsSync(faces)) {
  mkdirSync("public/models", { recursive: true });
  for (const name of ["tiny_face_detector_model", "face_landmark_68_tiny_model", "face_recognition_model"]) {
    cpSync(`${faces}/${name}.bin`, `public/models/${name}.bin`);
    cpSync(`${faces}/${name}-weights_manifest.json`, `public/models/${name}-weights_manifest.json`);
  }
}

const worker = "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs";
if (existsSync(worker)) cpSync(worker, "public/maplibre-gl-worker.mjs");
