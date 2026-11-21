"use client";
// Ajustes del colegio: nombre, ubicación, zona horaria y grados.
import { useState } from "react";
import { Map } from "@/components/map";
import { api, errorText, useM, useSession } from "@/components/session";
import { Button, Card, Field, PageHeader, inputClass, useToast } from "@/components/ui";
import { TIMEZONES } from "@/lib/dates";

export default function Ajustes() {
  const { me } = useSession();
  const school = me!.school!;
  const save = useM(api.team.saveSchool);
  const toast = useToast();
  const [name, setName] = useState(school.name);
  const [timezone, setTimezone] = useState(school.timezone);
  const [address, setAddress] = useState(school.location?.address ?? "");
  const [point, setPoint] = useState(school.location && { lat: school.location.lat, lng: school.location.lng });
  const [grades, setGrades] = useState(school.grades.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locate = async () => {
    if (!address.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`);
      const [hit] = (await res.json()) as { lat: string; lon: string }[];
      if (hit) setPoint({ lat: Number(hit.lat), lng: Number(hit.lon) });
      else setError("No encontramos esa dirección. Marca el punto tocando el mapa.");
    } catch {
      setError("No se pudo buscar la dirección. Marca el punto tocando el mapa.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await save({
        name, timezone, grades: grades.split(","),
        location: point ? { ...point, address } : undefined,
      });
      toast("Ajustes guardados");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Ajustes" subtitle="Datos del colegio que usan las rutas." />
      {!school.location && (
        <p className="mb-4 rounded-2xl bg-warn-soft px-4 py-3 text-sm text-warn">
          Ubica el colegio en el mapa: es el origen y el destino de todas las rutas.
        </p>
      )}
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <Field label="Nombre del colegio"><input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="País" hint="Define la zona horaria de las rutas.">
            <select className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {!TIMEZONES.some(([tz]) => tz === timezone) && <option>{timezone}</option>}
              {TIMEZONES.map(([tz, label]) => <option key={tz} value={tz}>{label}</option>)}
            </select>
          </Field>
          <Field label="Grados" hint="Separados por coma, en el orden en que quieres verlos.">
            <textarea className={`${inputClass} h-24 py-2`} value={grades} onChange={(e) => setGrades(e.target.value)} />
          </Field>
          {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
          <Button type="submit" size="lg" loading={busy}>Guardar ajustes</Button>
        </Card>
        <Card className="space-y-3 p-5">
          <Field label="Dirección del colegio">
            <div className="flex gap-2">
              <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, ciudad" />
              <Button variant="secondary" onClick={locate}>Buscar</Button>
            </div>
          </Field>
          <div className="h-80 overflow-hidden rounded-2xl border border-line">
            <Map
              pins={point ? [{ id: "school", kind: "school", ...point, title: name }] : []}
              fitKey={`${point?.lat}|${point?.lng}`}
              onPick={setPoint}
            />
          </div>
          <p className="text-xs text-muted">Toca el mapa para marcar o ajustar la entrada del colegio.</p>
        </Card>
      </form>
    </>
  );
}
