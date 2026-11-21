// Suscripción, Wompi, cola de tareas y consola del dueño.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import * as t from "@/db/schema";
import { GRACE_DAYS, addMonths, dailyBilling, handleWompiEvent, quote } from "@/server/billing";
import { toolsFor } from "@/server/core";
import { sha256 } from "@/server/crypto";
import { type WompiEvent, checkoutUrl, integritySignature, verifyEvent } from "@/server/wompi";
import { createApp, message } from "./harness";

const DAY = 86400000;
type App = Awaited<ReturnType<typeof createApp>>;
let app: App;
let admin: string;

beforeEach(async () => {
  process.env.WOMPI_PUBLIC_KEY = "pub_test_abc";
  process.env.WOMPI_INTEGRITY_SECRET = "test_integrity_xyz";
  process.env.WOMPI_EVENTS_SECRET = "test_events_123";
  delete process.env.WOMPI_PRIVATE_KEY;
  process.env.IVA_PERCENT = "19";
  app = await createApp();
  await app.seed();
  admin = await app.login("coordinacion@demo.abordo.app");
});

/** Corre una tarea de sistema (alcance "system") y publica sus cambios. */
const system = <T>(fn: (tools: ReturnType<typeof toolsFor>["tools"]) => Promise<T>) =>
  app.system(async (tx) => {
    const { tools, flush } = toolsFor(tx, app.clock.now);
    const result = await fn(tools);
    await flush();
    return result;
  });

function event(reference: string, status: string, amountInCents: number, secret = "test_events_123"): WompiEvent {
  const transaction = { id: "1234-1610641025-49201", status, reference, amount_in_cents: amountInCents, currency: "COP", payment_method_type: "PSE" };
  const timestamp = 1530291411;
  return {
    event: "transaction.updated",
    data: { transaction: transaction as never },
    signature: { properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"], checksum: sha256(`${transaction.id}${status}${amountInCents}${timestamp}${secret}`).toUpperCase() },
    timestamp,
  };
}

describe("Wompi", () => {
  test("firma de integridad: ejemplo de la documentación oficial", () => {
    // Cadena del ejemplo: "sk8-438k4-xmxm392-sn2m2490000COPprod_integrity_…" (referencia + centavos + moneda + secreto).
    expect(integritySignature("sk8-438k4-xmxm392-sn2m", 2490000, "COP", "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6")).toBe(
      "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5",
    );
  });

  test("la firma del evento depende del secreto y de cada campo firmado", () => {
    const good = event("ref", "APPROVED", 4490000);
    expect(verifyEvent(good)).toBe(true);
    expect(verifyEvent(event("ref", "APPROVED", 4490000, "otro_secreto"))).toBe(false);
    expect(verifyEvent({ ...good, data: { transaction: { ...good.data.transaction!, amount_in_cents: 1 } } })).toBe(false);
    expect(verifyEvent({ ...good, data: { transaction: { ...good.data.transaction!, status: "DECLINED" } } })).toBe(false);
    expect(verifyEvent({ ...good, signature: { ...good.signature, properties: [] } })).toBe(true === false);
  });

  test("el checkout lleva monto en centavos, referencia y firma", () => {
    const url = new URL(checkoutUrl({ reference: "r1", total: 78540, email: "a@b.co", redirectUrl: "https://app/x" }));
    expect(url.origin + url.pathname).toBe("https://checkout.wompi.co/p/");
    expect(url.searchParams.get("amount-in-cents")).toBe("7854000");
    expect(url.searchParams.get("signature:integrity")).toBe(integritySignature("r1", 7854000, "COP"));
  });
});

describe("suscripción", () => {
  test("cotiza por estudiante activo en ruta, con IVA", async () => {
    expect(quote(11, 6000, 1)).toEqual({ students: 11, months: 1, subtotal: 66000, tax: 12540, total: 78540, taxPercent: 19 });
    const status = await app.call("billing.status", {}, admin);
    expect(status).toMatchObject({ status: "trial", pricePerStudent: 6000, monthly: { students: 11, total: 78540 }, yearly: { total: 942480 }, canPay: true });
    // Un estudiante que sale de las rutas deja de cobrarse.
    const students = await app.call("students.list", {}, admin);
    await app.call("students.archive", { id: students[0].id }, admin);
    expect((await app.call("billing.status", {}, admin)).monthly.students).toBe(10);
  });

  test("sumar meses respeta el fin de mes", () => {
    expect(new Date(addMonths(Date.UTC(2027, 0, 31), 1)).toISOString().slice(0, 10)).toBe("2027-02-28");
    expect(new Date(addMonths(Date.UTC(2026, 10, 15), 12)).toISOString().slice(0, 10)).toBe("2027-11-15");
  });

  test("el pago solo se aplica con evento firmado, monto exacto y una sola vez", async () => {
    const { url } = await app.call("billing.checkout", { months: 1 }, admin);
    const reference = new URL(url).searchParams.get("reference")!;
    const before = await app.call("billing.status", {}, admin);
    expect(before.charges[0]).toMatchObject({ status: "pending", total: 78540 });

    expect(await system((tools) => handleWompiEvent(tools, event(reference, "APPROVED", 7854000, "secreto_falso")))).toBe("firma inválida");
    expect(await system((tools) => handleWompiEvent(tools, event(reference, "APPROVED", 100)))).toBe("monto distinto");
    expect(await system((tools) => handleWompiEvent(tools, event("otra-ref", "APPROVED", 7854000)))).toBe("referencia desconocida");
    expect((await app.call("billing.status", {}, admin)).status).toBe("trial");

    expect(await system((tools) => handleWompiEvent(tools, event(reference, "APPROVED", 7854000)))).toBe("pago aplicado");
    const after = await app.call("billing.status", {}, admin);
    expect(after.status).toBe("active");
    expect(after.charges[0]).toMatchObject({ status: "paid", method: "PSE" });
    // Pagar durante la prueba no pierde días: el mes empieza cuando termina la prueba.
    expect(after.paidUntil).toBe(addMonths(before.trialEndsAt, 1));
    // Wompi reintenta el mismo evento: no se extiende dos veces.
    expect(await system((tools) => handleWompiEvent(tools, event(reference, "APPROVED", 7854000)))).toBe("ya aplicado");
    expect((await app.call("billing.status", {}, admin)).paidUntil).toBe(after.paidUntil);
    expect((await app.call("notifications.mine", {}, admin)).items[0].title).toBe("Pago recibido");
  });

  test("un pago rechazado deja el cobro como fallido y no activa nada", async () => {
    const { url } = await app.call("billing.checkout", { months: 12 }, admin);
    const reference = new URL(url).searchParams.get("reference")!;
    expect(await system((tools) => handleWompiEvent(tools, event(reference, "DECLINED", 94248000)))).toBe("pago rechazado");
    expect(await app.call("billing.status", {}, admin)).toMatchObject({ status: "trial", charges: [{ status: "failed" }] });
  });

  test("mora y suspensión: bloquea la edición del coordinador, nunca la operación", async () => {
    const driver = await app.login("ramiro@demo.abordo.app");
    const lucia = await app.login("lucia@demo.abordo.app");
    const status = await app.call("billing.status", {}, admin);

    app.clock.now = status.trialEndsAt - 3 * DAY;
    await system(dailyBilling);
    expect((await app.call("notifications.mine", {}, admin)).items[0].title).toBe("Tu periodo vence pronto");
    await system(dailyBilling); // el recordatorio no se repite
    expect((await app.call("notifications.mine", {}, admin)).items).toHaveLength(1);

    app.clock.now = status.trialEndsAt + DAY;
    await system(dailyBilling);
    expect((await app.call("billing.status", {}, admin)).status).toBe("past_due");
    await app.call("team.saveVehicle", { name: "Bus 3", plate: "AAA-111", capacity: 20, active: true }, admin); // en mora aún puede editar

    app.clock.now = status.trialEndsAt + (GRACE_DAYS + 1) * DAY;
    await system(dailyBilling);
    expect((await app.call("billing.status", {}, admin)).status).toBe("suspended");
    expect(await message(app.call("team.saveVehicle", { name: "Bus 4", plate: "BBB-222", capacity: 20, active: true }, admin))).toContain("suspendida");
    expect(await message(app.call("students.archive", { id: (await app.call("students.list", {}, admin))[0].id }, admin))).toContain("suspendida");

    // La operación sigue: el conductor inicia y la familia ve y reporta.
    const date = new Date(app.clock.now - 5 * 3600000).toISOString().slice(0, 10);
    const routes = await app.call("trips.myDay", { date }, driver);
    const tripId = await app.call("trips.start", { routeId: routes[0].routeId }, driver);
    expect(tripId).toBeTruthy();
    expect((await app.call("family.home", { date }, lucia)).children).toHaveLength(2);

    // Y el coordinador sí puede pagar; al pagar vuelve a editar.
    const { url } = await app.call("billing.checkout", { months: 1 }, admin);
    await system((tools) => handleWompiEvent(tools, event(new URL(url).searchParams.get("reference")!, "APPROVED", 7854000)));
    expect((await app.call("billing.status", {}, admin)).status).toBe("active");
    await app.call("team.saveVehicle", { name: "Bus 4", plate: "BBB-222", capacity: 20, active: true }, admin);
  });

  test("un colegio sin precio configurado no entra en mora", async () => {
    await app.call("auth.registerSchool", { schoolName: "Colegio Gratis", name: "Eva", email: "eva@gratis.edu", timezone: "America/Bogota" });
    app.clock.now += 400 * DAY;
    await system(dailyBilling);
    const [sub] = await app.system(async (tx) => {
      const [school] = await tx.select().from(t.schools).where(eq(t.schools.name, "Colegio Gratis"));
      return tx.select().from(t.subscriptions).where(eq(t.subscriptions.schoolId, school.id));
    });
    expect(sub.status).toBe("trial");
  });
});

describe("dueño de la plataforma", () => {
  test("ve todos los colegios, ajusta el precio y registra un pago por transferencia", async () => {
    await app.system((tx) => tx.insert(t.users).values({ email: "dueno@abordo.app", name: "Dueño", role: "owner" }));
    const owner = await app.login("dueno@abordo.app");
    await app.call("auth.registerSchool", { schoolName: "Otro Colegio", name: "Eva", email: "eva@otro.edu", timezone: "America/Bogota" });

    const schools = await app.call("owner.schools", {}, owner);
    expect(schools.map((s) => s.name).sort()).toEqual(["Colegio Los Arrayanes", "Otro Colegio"]);
    const demo = schools.find((s) => s.name === "Colegio Los Arrayanes")!;
    expect(demo).toMatchObject({ students: 11, monthly: 78540, status: "trial" });

    await app.call("owner.update", { schoolId: demo.id, pricePerStudent: 5000 }, owner);
    expect((await app.call("billing.status", {}, admin)).monthly.total).toBe(65450);

    await app.call("owner.recordPayment", { schoolId: demo.id, months: 6, total: 300000, note: "Transferencia Bancolombia" }, owner);
    const status = await app.call("billing.status", {}, admin);
    expect(status).toMatchObject({ status: "active", charges: [{ method: "manual", status: "paid", months: 6, total: 300000 }] });

    // Un coordinador no entra a la consola ni cambia su propio precio.
    expect(await message(app.call("owner.update", { schoolId: demo.id, pricePerStudent: 1 }, admin))).toContain("permiso");
  });
});

describe("cola de tareas", () => {
  test("una tarea que falla se reintenta más tarde y no bloquea las demás", async () => {
    await app.system((tx) =>
      tx.insert(t.jobs).values([
        { kind: "no-existe", payload: {}, runAt: app.clock.now },
        { kind: "email", payload: { to: "a@b.co", subject: "Hola", text: "Prueba" }, runAt: app.clock.now },
        { kind: "email", payload: { to: "c@d.co", subject: "Luego", text: "Futuro" }, runAt: app.clock.now + 3600000 },
      ]),
    );
    const { runDueJobs } = await import("@/server/jobs");
    expect(await runDueJobs(app.clock.now, app.db)).toBe(2);
    const left = await app.system((tx) => tx.select().from(t.jobs));
    expect(left.map((j) => j.kind).sort()).toEqual(["email", "no-existe"]);
    const failed = left.find((j) => j.kind === "no-existe")!;
    expect(failed).toMatchObject({ attempts: 1, lockedUntil: null });
    expect(failed.runAt).toBeGreaterThan(app.clock.now);
    expect(failed.lastError).toContain("desconocida");
  });
});
