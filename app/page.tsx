export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        XC Posture Check
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
        Map your attack surface across every cloud and edge you actually use.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-neutral-600">
        A free posture check from F5 Distributed Cloud. Enter your apex domain
        and get a full inventory of where your traffic terminates, scored for
        policy fragmentation, with per-asset protection gaps and an honest
        view of what XC would consolidate.
      </p>
      <p className="mt-10 text-sm text-neutral-400">
        Coming soon. The full assessment lands when scaffolding completes.
      </p>
    </main>
  );
}
