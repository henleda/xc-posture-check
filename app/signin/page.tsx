import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";

export const metadata = {
  title: "Sign in — XC Posture Check",
};

async function signInAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { password, redirectTo: "/dashboard" });
  } catch (error) {
    // signIn throws a NEXT_REDIRECT on success — re-throw so Next can handle it.
    if (error instanceof AuthError) {
      redirect("/signin?error=invalid");
    }
    throw error;
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        XC Posture Check
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">Admin sign in</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Enter the admin password to manage share links and view telemetry.
      </p>
      <form action={signInAction} className="mt-8 flex flex-col gap-3">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700">
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Sign in
        </button>
      </form>
      {error === "invalid" ? (
        <p className="mt-6 text-sm text-red-600">Incorrect password.</p>
      ) : null}
      <p className="mt-12 text-xs text-neutral-400">
        Built by F5 XC Product Marketing. Seller self-service sign-in (SSO) is coming after the
        internal alpha.
      </p>
    </main>
  );
}
