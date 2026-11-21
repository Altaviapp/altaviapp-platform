// Lector de CSV mínimo (comillas, comas o punto y coma) e importación de estudiantes.

export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const sep = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) (row.push(cell.trim()), (cell = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

export type GuardianInput = { name: string; email: string; phone?: string };
export type StudentRow = {
  name: string;
  grade: string;
  address: string;
  lat?: number;
  lng?: number;
  guardians: GuardianInput[];
};
export type RowResult = { line: number; row?: StudentRow; errors: string[] };

export const CSV_HEADERS = [
  "nombre", "grado", "direccion", "latitud", "longitud",
  "acudiente_nombre", "acudiente_correo", "acudiente_telefono",
  "acudiente2_nombre", "acudiente2_correo", "acudiente2_telefono",
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalize = (h: string) =>
  h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");

/** Convierte el CSV en filas validadas. La primera fila son los encabezados. */
export function readStudentsCsv(text: string): RowResult[] {
  const [header, ...lines] = parseCsv(text);
  if (!header) return [];
  const col = new Map(header.map((h, i) => [normalize(h), i]));
  const missing = ["nombre", "grado", "acudiente_correo"].filter((h) => !col.has(h));
  if (missing.length) {
    return [{ line: 1, errors: [`Faltan columnas: ${missing.join(", ")}`] }];
  }
  return lines.map((cells, i) => {
    const get = (h: string) => (col.has(h) ? (cells[col.get(h)!] ?? "") : "");
    const errors: string[] = [];
    const name = get("nombre");
    const grade = get("grado");
    if (!name) errors.push("Falta el nombre");
    if (!grade) errors.push("Falta el grado");
    const guardians: GuardianInput[] = [];
    for (const prefix of ["acudiente", "acudiente2"]) {
      const email = get(`${prefix}_correo`).toLowerCase();
      if (!email) continue;
      if (!EMAIL_RE.test(email)) errors.push(`Correo inválido: ${email}`);
      guardians.push({
        name: get(`${prefix}_nombre`) || email,
        email,
        phone: get(`${prefix}_telefono`) || undefined,
      });
    }
    if (!guardians.length) errors.push("Falta el correo del acudiente");
    const lat = get("latitud") ? Number(get("latitud").replace(",", ".")) : undefined;
    const lng = get("longitud") ? Number(get("longitud").replace(",", ".")) : undefined;
    if ((lat === undefined) !== (lng === undefined)) errors.push("Latitud y longitud van juntas");
    if (lat !== undefined && !(Math.abs(lat) <= 90)) errors.push("Latitud inválida");
    if (lng !== undefined && !(Math.abs(lng) <= 180)) errors.push("Longitud inválida");
    const row: StudentRow = { name, grade, address: get("direccion"), lat, lng, guardians };
    return errors.length ? { line: i + 2, errors } : { line: i + 2, row, errors };
  });
}
