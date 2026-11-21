import { describe, expect, test } from "vitest";
import { parseCsv, readStudentsCsv } from "../lib/csv";
import { addDays, localNow, toMinutes, toTime } from "../lib/dates";
import { matchFace } from "../lib/face";
import { decodePolyline, distance, estimateTimes, orderStops } from "../lib/geo";
import {
  absentSet, covers, delayAt, eta, nextStopIndex, runsOn, stopResolved, studentStatus, tally,
} from "../lib/roster";

describe("fechas en la zona del colegio", () => {
  test("la fecha local cambia a medianoche del colegio, no en UTC", () => {
    // 2026-03-10 03:30 UTC = 9 de marzo 22:30 en Guayaquil (UTC-5)
    const now = localNow("America/Guayaquil", Date.UTC(2026, 2, 10, 3, 30));
    expect(now).toEqual({ date: "2026-03-09", weekday: 1, minutes: 22 * 60 + 30 });
  });
  test("horas", () => {
    expect(toMinutes("06:45")).toBe(405);
    expect(toTime(405)).toBe("06:45");
    expect(toTime(1445)).toBe("00:05");
    expect(addDays("2026-02-27", 3)).toBe("2026-03-02");
  });
});

describe("ausencias y lista del viaje", () => {
  const absence = { studentId: "ana", from: "2026-03-10", to: "2026-03-12", direction: "to_school" as const };
  test("cubre solo su rango y su sentido", () => {
    expect(covers(absence, "2026-03-10", "to_school")).toBe(true);
    expect(covers(absence, "2026-03-12", "to_school")).toBe(true);
    expect(covers(absence, "2026-03-13", "to_school")).toBe(false);
    expect(covers(absence, "2026-03-11", "from_school")).toBe(false);
    expect(covers({ ...absence, direction: "both" }, "2026-03-11", "from_school")).toBe(true);
  });
  test("la asistencia registrada manda sobre la ausencia", () => {
    const absent = absentSet([absence], "2026-03-10", "to_school");
    expect(studentStatus("ana", new Map(), absent)).toBe("absent");
    expect(studentStatus("ana", new Map([["ana", "boarded"]]), absent)).toBe("boarded");
    expect(studentStatus("luis", new Map(), absent)).toBe("expected");
  });
  test("una ruta corre solo en sus días y si está activa", () => {
    expect(runsOn({ active: true, days: [1, 2, 3, 4, 5] }, 1)).toBe(true);
    expect(runsOn({ active: true, days: [1, 2, 3, 4, 5] }, 6)).toBe(false);
    expect(runsOn({ active: false, days: [1] }, 1)).toBe(false);
  });
});

describe("avance por paradas", () => {
  const stops = [
    { id: "a", time: "06:30", studentIds: ["ana", "luis"] },
    { id: "b", time: "06:40", studentIds: ["eva"] },
  ];
  test("hacia el colegio: la parada se resuelve cuando nadie queda pendiente", () => {
    const none = new Set<string>();
    expect(nextStopIndex(stops, "to_school", new Map(), none)).toBe(0);
    expect(nextStopIndex(stops, "to_school", new Map([["ana", "boarded"]]), none)).toBe(0);
    const first = new Map([["ana", "boarded"], ["luis", "no_show"]] as const);
    expect(nextStopIndex(stops, "to_school", first, none)).toBe(1);
    expect(stopResolved(stops[0], "to_school", new Map([["ana", "boarded"]]), new Set(["luis"]))).toBe(true);
  });
  test("desde el colegio: pendiente es quien va a bordo y aún no baja", () => {
    const none = new Set<string>();
    const aboard = new Map([["ana", "boarded"], ["luis", "no_show"], ["eva", "boarded"]] as const);
    expect(nextStopIndex(stops, "from_school", aboard, none)).toBe(0);
    const dropped = new Map([["ana", "dropped"], ["luis", "no_show"], ["eva", "boarded"]] as const);
    expect(nextStopIndex(stops, "from_school", dropped, none)).toBe(1);
    const all = new Map([["ana", "dropped"], ["luis", "no_show"], ["eva", "dropped"]] as const);
    expect(nextStopIndex(stops, "from_school", all, none)).toBe(2);
  });
  test("retraso y hora estimada", () => {
    expect(delayAt("06:30", 6 * 60 + 38)).toBe(8);
    expect(delayAt("06:30", 6 * 60 + 25)).toBe(0);
    expect(eta("06:40", 8)).toBe("06:48");
  });
  test("resumen de asistencia", () => {
    const counts = tally(stops, new Map([["ana", "dropped"], ["luis", "no_show"]] as const), new Set(["eva"]));
    expect(counts).toMatchObject({ total: 3, dropped: 1, no_show: 1, absent: 1, expected: 0 });
  });
});

describe("orden de paradas", () => {
  const school = { lat: 0, lng: 0 };
  const far = { id: "far", lat: 0, lng: 0.03 };
  const mid = { id: "mid", lat: 0, lng: 0.02 };
  const near = { id: "near", lat: 0, lng: 0.01 };
  test("hacia el colegio termina cerca del colegio; desde el colegio empieza cerca", () => {
    expect(orderStops([mid, near, far], school, "to_school").map((s) => s.id)).toEqual(["far", "mid", "near"]);
    expect(orderStops([mid, far, near], school, "from_school").map((s) => s.id)).toEqual(["near", "mid", "far"]);
  });
  test("las horas estimadas crecen con la distancia", () => {
    expect(distance(school, near)).toBeGreaterThan(1100);
    expect(distance(school, near)).toBeLessThan(1120);
    const times = estimateTimes([near, mid, far], "14:00", school, "from_school");
    expect(times[0] > "14:00").toBe(true);
    expect(times[0] < times[1] && times[1] < times[2]).toBe(true);
    expect(estimateTimes([far, mid], "06:30", school, "to_school")[0]).toBe("06:30");
  });
});

test("decodifica una polilínea codificada", () => {
  // Ejemplo de la especificación del formato.
  expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);
});

describe("reconocimiento facial", () => {
  const vec = (seed: number) => Array.from({ length: 128 }, (_, i) => Math.sin(seed * (i + 1)) * 0.1);
  const shifted = (base: number[], by: number) => base.map((x) => x + by / Math.sqrt(128));
  const candidates = [
    { studentId: "ana", descriptors: [vec(1)] },
    { studentId: "luis", descriptors: [vec(2)] },
  ];
  test("coincidencia clara", () => {
    expect(matchFace(shifted(vec(1), 0.3), candidates)).toMatchObject({ kind: "match", studentId: "ana" });
  });
  test("parecido dudoso pide confirmación", () => {
    expect(matchFace(shifted(vec(1), 0.53), candidates)).toMatchObject({ kind: "unsure", studentId: "ana" });
  });
  test("dos candidatos casi iguales nunca son coincidencia automática", () => {
    const twins = [
      { studentId: "ana", descriptors: [vec(1)] },
      { studentId: "eva", descriptors: [shifted(vec(1), 0.02)] },
    ];
    expect(matchFace(shifted(vec(1), 0.1), twins).kind).toBe("unsure");
  });
  test("desconocido", () => {
    expect(matchFace(shifted(vec(1), 0.9), candidates)).toEqual({ kind: "none" });
    expect(matchFace(vec(1), [])).toEqual({ kind: "none" });
  });
});

describe("CSV de estudiantes", () => {
  test("comillas, punto y coma y BOM", () => {
    expect(parseCsv('﻿a;b\n"x; y";"dijo ""hola"""\n')).toEqual([["a", "b"], ["x; y", 'dijo "hola"']]);
  });
  test("valida filas y agrupa acudientes", () => {
    const csv = [
      "Nombre,Grado,Dirección,Latitud,Longitud,Acudiente nombre,Acudiente correo,Acudiente2 correo",
      "Sofía Andrade,4.º,Calle 1,-0.19,-78.47,Lucía,LUCIA@x.com,papa@x.com",
      ",4.º,,,,,mal-correo,",
      "Mateo,2.º,,,-78.4,Lucía,lucia@x.com,",
    ].join("\n");
    const rows = readStudentsCsv(csv);
    expect(rows[0].row).toMatchObject({ name: "Sofía Andrade", lat: -0.19, guardians: [{ email: "lucia@x.com" }, { email: "papa@x.com" }] });
    expect(rows[1].errors).toEqual(["Falta el nombre", "Correo inválido: mal-correo"]);
    expect(rows[2].errors).toEqual(["Latitud y longitud van juntas"]);
  });
  test("exige las columnas mínimas", () => {
    expect(readStudentsCsv("nombre,grado\nA,1")[0].errors[0]).toContain("acudiente_correo");
  });
});
