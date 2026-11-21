// Comparación de rostros. Solo matemáticas sobre vectores: el modelo corre en el navegador.

export type FaceCandidate = { studentId: string; descriptors: number[][] };
export type FaceMatch =
  | { kind: "match"; studentId: string; distance: number }
  | { kind: "unsure"; studentId: string; distance: number }
  | { kind: "none" };

export const DESCRIPTOR_SIZE = 128;
export const MATCH_MAX = 0.48; // por debajo: coincidencia segura
export const UNSURE_MAX = 0.58; // entre ambos: pedir confirmación al conductor
export const MARGIN = 0.06; // ventaja mínima sobre el segundo candidato

export function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export function isDescriptor(d: unknown): d is number[] {
  return Array.isArray(d) && d.length === DESCRIPTOR_SIZE && d.every((n) => Number.isFinite(n));
}

/**
 * Busca al estudiante más parecido entre los candidatos del viaje.
 * Es "match" solo si está cerca y con ventaja clara sobre el siguiente;
 * si no, "unsure" para que el conductor confirme, o "none".
 */
export function matchFace(descriptor: number[], candidates: FaceCandidate[]): FaceMatch {
  const scored = candidates
    .map((c) => ({
      studentId: c.studentId,
      distance: Math.min(...c.descriptors.map((d) => euclidean(descriptor, d))),
    }))
    .filter((c) => Number.isFinite(c.distance))
    .sort((a, b) => a.distance - b.distance);
  const best = scored[0];
  if (!best || best.distance > UNSURE_MAX) return { kind: "none" };
  const runnerUp = scored[1]?.distance ?? Infinity;
  if (best.distance <= MATCH_MAX && runnerUp - best.distance >= MARGIN) {
    return { kind: "match", ...best };
  }
  return { kind: "unsure", ...best };
}
