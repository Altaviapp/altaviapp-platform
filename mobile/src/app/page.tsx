import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Altaviapp
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Aplicación para conductores
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              Bienvenido
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Esta es la aplicación PWA para conductores de transporte escolar.
            </p>
            <div className="flex gap-2">
              <Button>Iniciar viaje</Button>
              <Button variant="outline">Escanear QR</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Próximos pasos:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Next.js 14 + shadcn/ui configurado</li>
              <li>• Configurar autenticación con Clerk</li>
              <li>• Integrar Convex para datos en tiempo real</li>
              <li>• Implementar escaneo de códigos QR</li>
              <li>• Agregar seguimiento GPS en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
