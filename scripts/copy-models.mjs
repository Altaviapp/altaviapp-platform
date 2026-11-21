// Copia los modelos de reconocimiento facial a public/models (no se versionan: pesan ~6 MB).
import { cpSync, existsSync, mkdirSync } from "node:fs";

const from = "node_modules/@vladmandic/face-api/model";
const files = ["tiny_face_detector_model", "face_landmark_68_tiny_model", "face_recognition_model"];
if (existsSync(from)) {
  mkdirSync("public/models", { recursive: true });
  for (const name of files) {
    cpSync(`${from}/${name}.bin`, `public/models/${name}.bin`);
    cpSync(`${from}/${name}-weights_manifest.json`, `public/models/${name}-weights_manifest.json`);
  }
}
