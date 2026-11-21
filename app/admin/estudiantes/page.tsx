"use client";
// Estudiantes: lista, alta y edición, importación CSV, ausencias y rostro.
import { CalendarOff, MapPin, MapPinOff, Plus, ScanFace, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { AbsenceForm } from "@/components/absence-form";
import { FaceEnroll } from "@/components/face-enroll";
import { Map, type Pin } from "@/components/map";
import { api, errorText, useM, useNow, useQ, useSession } from "@/components/session";
import { Badge, Button, Card, Empty, Field, Modal, PageHeader, Spinner, inputClass, useToast } from "@/components/ui";
import { CSV_HEADERS, type RowResult, readStudentsCsv } from "@/lib/csv";

const GEOCODER = process.env.NEXT_PUBLIC_GEOCODER_URL ?? "https://nominatim.openstreetmap.org";

type Student = NonNullable<(typeof api.students.list)["_returnType"]>[number];
type Dialog =
  | { kind: "form"; student?: Student }
  | { kind: "import" }
  | { kind: "face"; student: Student }
  | { kind: "absence"; student: Student }
  | null;

export default function Estudiantes() {
  const { me } = useSession();
  const school = me!.school!;
  const now = useNow(school.timezone);
  const students = useQ(api.students.list, {});
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (students ?? []).filter(
      (s) =>
        (!grade || s.grade === grade) &&
        (!q || s.name.toLowerCase().includes(q) || s.guardians.some((g) => g.name.toLowerCase().includes(q) || g.email.includes(q))),
    );
  }, [students, search, grade]);

  if (!students) return <Spinner />;
  const noHome = students.filter((s) => !s.home).length;

  return (
    <>
      <PageHeader title="Estudiantes" subtitle={`${students.length} activos${noHome ? ` · ${noHome} sin ubicación` : ""}`}>
        <Button variant="secondary" onClick={() => setDialog({ kind: "import" })}><Upload className="size-4" /> Importar CSV</Button>
        <Button onClick={() => setDialog({ kind: "form" })}><Plus className="size-4" /> Nuevo estudiante</Button>
      </PageHeader>

      {students.length === 0 ? (
        <Empty
          title="Aún no hay estudiantes"
          text="Agrégalos uno a uno o importa la lista completa desde un CSV. Cada acudiente podrá entrar con su correo."
          action={<Button onClick={() => setDialog({ kind: "import" })}><Upload className="size-4" /> Importar CSV</Button>}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted" />
              <input className={`${inputClass} pl-10`} placeholder="Buscar por estudiante o acudiente" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className={`${inputClass} !w-auto`} value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Grado">
              <option value="">Todos los grados</option>
              {school.grades.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <Card className="divide-y divide-line/70 overflow-hidden">
            {shown.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-paper/60">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setDialog({ kind: "form", student: s })}>
                  <p className="truncate font-medium">{s.name} <span className="font-normal text-muted">· {s.grade}</span></p>
                  <p className="truncate text-xs text-muted">{s.guardians.map((g) => g.name).join(" y ") || "Sin acudiente"} · {s.address || "Sin dirección"}</p>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  {s.routes.map((r) => <Badge key={r.id}>{r.name}</Badge>)}
                  {!s.routes.length && <Badge tone="warn">Sin ruta</Badge>}
                  {s.home ? <MapPin className="size-4 text-ok" aria-label="Con ubicación" /> : <MapPinOff className="size-4 text-bad" aria-label="Sin ubicación" />}
                  <button type="button" title="Reconocimiento facial" aria-label="Reconocimiento facial" onClick={() => setDialog({ kind: "face", student: s })} className="grid size-9 place-items-center rounded-full hover:bg-ink/5">
                    <ScanFace className={`size-5 ${s.hasFace ? "text-ok" : "text-muted/50"}`} />
                  </button>
                  <button type="button" title="Reportar ausencia" aria-label="Reportar ausencia" onClick={() => setDialog({ kind: "absence", student: s })} className="grid size-9 place-items-center rounded-full hover:bg-ink/5">
                    <CalendarOff className="size-5 text-muted" />
                  </button>
                </div>
              </div>
            ))}
            {!shown.length && <p className="px-4 py-10 text-center text-sm text-muted">Nadie coincide con la búsqueda.</p>}
          </Card>
        </>
      )}

      <Modal open={dialog?.kind === "form"} onClose={close} title={dialog?.kind === "form" && dialog.student ? "Editar estudiante" : "Nuevo estudiante"} wide>
        {dialog?.kind === "form" && <StudentForm student={dialog.student} onDone={close} />}
      </Modal>
      <Modal open={dialog?.kind === "import"} onClose={close} title="Importar estudiantes" wide>
        {dialog?.kind === "import" && <ImportCsv onDone={close} />}
      </Modal>
      <Modal open={dialog?.kind === "face"} onClose={close} title={dialog?.kind === "face" ? `Rostro de ${dialog.student.name}` : ""}>
        {dialog?.kind === "face" && (
          <FaceEnroll studentId={dialog.student.id} studentName={dialog.student.name} hasFace={dialog.student.hasFace} source="school" onDone={close} />
        )}
      </Modal>
      <Modal open={dialog?.kind === "absence"} onClose={close} title={dialog?.kind === "absence" ? `Ausencia de ${dialog.student.name}` : ""}>
        {dialog?.kind === "absence" && <AbsenceForm students={[dialog.student]} today={now.date} onDone={close} />}
      </Modal>
    </>
  );
}

type GuardianForm = { name: string; email: string; phone: string };
const emptyGuardian: GuardianForm = { name: "", email: "", phone: "" };

function StudentForm({ student, onDone }: { student?: Student; onDone: () => void }) {
  const { me } = useSession();
  const school = me!.school!;
  const save = useM(api.students.save);
  const archive = useM(api.students.archive);
  const toast = useToast();
  const [name, setName] = useState(student?.name ?? "");
  const [grade, setGrade] = useState(student?.grade ?? school.grades[0] ?? "");
  const [address, setAddress] = useState(student?.address ?? "");
  const [home, setHome] = useState(student?.home);
  const [note, setNote] = useState(student?.note ?? "");
  const [guardians, setGuardians] = useState<GuardianForm[]>(
    student?.guardians.length ? student.guardians.map((g) => ({ name: g.name, email: g.email, phone: g.phone ?? "" })) : [emptyGuardian],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const setGuardian = (i: number, k: keyof GuardianForm, value: string) =>
    setGuardians((gs) => gs.map((g, n) => (n === i ? { ...g, [k]: value } : g)));

  const locate = async () => {
    if (!address.trim()) return setError("Escribe la dirección para buscarla.");
    setBusy(true);
    setError("");
    try {
      const bias = school.location
        ? `&viewbox=${school.location.lng - 0.4},${school.location.lat + 0.4},${school.location.lng + 0.4},${school.location.lat - 0.4}&bounded=1`
        : "";
      const res = await fetch(`${GEOCODER}/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(address)}${bias}`);
      const [hit] = (await res.json()) as { lat: string; lon: string }[];
      if (hit) setHome({ lat: Number(hit.lat), lng: Number(hit.lon) });
      else setError("No encontramos esa dirección. Marca el punto tocando el mapa.");
    } catch {
      setError("No se pudo buscar la dirección. Marca el punto tocando el mapa.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await save({
        id: student?.id, name, grade, address, home, note: note || undefined,
        guardians: guardians.filter((g) => g.email.trim()).map((g) => ({ name: g.name, email: g.email, phone: g.phone || undefined })),
      });
      toast(student ? "Cambios guardados" : "Estudiante creado");
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const onArchive = async () => {
    if (!student || !confirm(`¿Retirar a ${student.name}? Saldrá de sus rutas y se borrará su registro de rostro.`)) return;
    setBusy(true);
    try {
      await archive({ id: student.id });
      toast("Estudiante retirado");
      onDone();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const pins: Pin[] = [
    ...(school.location ? [{ id: "school", kind: "school" as const, lat: school.location.lat, lng: school.location.lng, title: school.name }] : []),
    ...(home ? [{ id: "home", kind: "home" as const, ...home, title: "Domicilio" }] : []),
  ];

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-4">
        <Field label="Nombre completo">
          <input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Grado">
          <select className={inputClass} value={grade} onChange={(e) => setGrade(e.target.value)}>
            {!school.grades.includes(grade) && grade && <option>{grade}</option>}
            {school.grades.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        {guardians.map((g, i) => (
          <fieldset key={i} className="space-y-2 rounded-2xl border border-line p-3">
            <legend className="px-1 text-sm font-medium">Acudiente {i + 1}</legend>
            <input className={inputClass} placeholder="Nombre" aria-label={`Nombre del acudiente ${i + 1}`} value={g.name} onChange={(e) => setGuardian(i, "name", e.target.value)} />
            <input className={inputClass} type="email" placeholder="Correo" required={i === 0} aria-label={`Correo del acudiente ${i + 1}`} value={g.email} onChange={(e) => setGuardian(i, "email", e.target.value)} />
            <input className={inputClass} type="tel" placeholder="Teléfono" aria-label={`Teléfono del acudiente ${i + 1}`} value={g.phone} onChange={(e) => setGuardian(i, "phone", e.target.value)} />
          </fieldset>
        ))}
        {guardians.length < 2 && (
          <Button variant="ghost" size="sm" onClick={() => setGuardians((g) => [...g, emptyGuardian])}><Plus className="size-4" /> Segundo acudiente</Button>
        )}
        <Field label="Nota para el conductor (opcional)">
          <input className={inputClass} maxLength={200} placeholder="Alergias, quién lo recibe…" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
      <div className="space-y-3">
        <Field label="Dirección">
          <div className="flex gap-2">
            <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, barrio" />
            <Button variant="secondary" onClick={locate} disabled={busy}>Buscar</Button>
          </div>
        </Field>
        <div className="h-64 overflow-hidden rounded-2xl border border-line">
          <Map pins={pins} fitKey={`${home?.lat}|${home?.lng}`} onPick={setHome} />
        </div>
        <p className="text-xs text-muted">
          {home ? "Toca el mapa para ajustar el punto donde se recoge al estudiante." : "Toca el mapa para marcar dónde se recoge al estudiante. Sin punto no se puede asignar a una ruta."}
        </p>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap justify-between gap-3 sm:col-span-2">
        {student ? <Button variant="ghost" className="text-bad" onClick={onArchive} disabled={busy}>Retirar estudiante</Button> : <span />}
        <Button type="submit" loading={busy}>{student ? "Guardar cambios" : "Crear estudiante"}</Button>
      </div>
    </form>
  );
}

function ImportCsv({ onDone }: { onDone: () => void }) {
  const importRows = useM(api.students.importRows);
  const toast = useToast();
  const [rows, setRows] = useState<RowResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = (rows ?? []).filter((r) => r.row);
  const invalid = (rows ?? []).filter((r) => !r.row);

  const template = `data:text/csv;charset=utf-8,${encodeURIComponent(
    `${CSV_HEADERS.join(",")}\nSofía Andrade,4.º,"González Suárez N27, Quito",-0.1985,-78.4792,Lucía Andrade,lucia@correo.com,0990000000,,,\n`,
  )}`;

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      let created = 0;
      let skipped = 0;
      for (let i = 0; i < valid.length; i += 100) {
        const result = await importRows({
          rows: valid.slice(i, i + 100).map(({ row }) => ({
            name: row!.name, grade: row!.grade, address: row!.address,
            home: row!.lat !== undefined && row!.lng !== undefined ? { lat: row!.lat, lng: row!.lng } : undefined,
            guardians: row!.guardians,
          })),
        });
        created += result.created;
        skipped += result.skipped;
      }
      toast(`${created} estudiantes creados${skipped ? `, ${skipped} ya existían` : ""}`);
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Una fila por estudiante. Columnas obligatorias: <b>nombre</b>, <b>grado</b> y <b>acudiente_correo</b>. Los hermanos se agrupan
        solos al compartir el correo del acudiente.{" "}
        <a href={template} download="plantilla-estudiantes.csv" className="font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">Descargar plantilla</a>
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        className="block w-full text-sm file:mr-3 file:h-11 file:rounded-xl file:border-0 file:bg-ink file:px-4 file:font-medium file:text-paper"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) setRows(readStudentsCsv(await file.text()));
        }}
      />
      {rows && (
        <>
          <div className="flex gap-2">
            <Badge tone="ok">{valid.length} listas</Badge>
            {invalid.length > 0 && <Badge tone="bad">{invalid.length} con errores</Badge>}
          </div>
          {invalid.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-bad-soft p-3 text-sm text-bad">
              {invalid.map((r) => <li key={r.line}>Fila {r.line}: {r.errors.join("; ")}</li>)}
            </ul>
          )}
          {valid.length > 0 && (
            <div className="max-h-56 overflow-auto rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-paper text-xs text-muted">
                  <tr><th className="px-3 py-2">Estudiante</th><th className="px-3 py-2">Grado</th><th className="px-3 py-2">Acudientes</th><th className="px-3 py-2">Ubicación</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {valid.map(({ line, row }) => (
                    <tr key={line}>
                      <td className="px-3 py-2">{row!.name}</td>
                      <td className="px-3 py-2">{row!.grade}</td>
                      <td className="px-3 py-2">{row!.guardians.map((g) => g.email).join(", ")}</td>
                      <td className="px-3 py-2">{row!.lat !== undefined ? "Sí" : "Falta"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={run} loading={busy} disabled={!valid.length}>Importar {valid.length || ""} estudiantes</Button>
      </div>
    </div>
  );
}
