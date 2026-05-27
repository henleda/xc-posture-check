import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const display = session.user.name ?? session.user.email ?? "Seller";

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium uppercase tracking-widest text-neutral-900"
            >
              XC Posture Check
            </Link>
            <nav className="flex gap-4 text-sm text-neutral-600">
              <Link href="/dashboard" className="hover:text-neutral-900">
                Dashboard
              </Link>
              <Link href="/share-links/new" className="hover:text-neutral-900">
                New share link
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>{display}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:border-neutral-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
