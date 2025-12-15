export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Content - each page controls its own max-width */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
