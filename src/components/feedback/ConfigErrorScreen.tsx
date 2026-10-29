export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <section className="surface-card max-w-lg p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-gold-deep uppercase">Keybank Admin</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Configuration required</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
      </section>
    </main>
  )
}
