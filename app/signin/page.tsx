import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { isAllowedEmail } from "@/lib/auth/allowed-email";

export const metadata = {
  title: "Sign in — XC Posture Check",
};

async function signInAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/signin?error=missing");
  }
  if (!isAllowedEmail(email)) {
    redirect("/signin?error=denied");
  }
  await signIn("resend", { email, redirectTo: "/dashboard" });
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        XC Posture Check
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        Sign in
      </h1>
      <p className="mt-3 text-sm text-neutral-600">
        Sellers only. Enter your <span className="font-medium">@f5.com</span> email and we&rsquo;ll
        send you a one-time sign-in link.
      </p>
      <form action={signInAction} className="mt-8 flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@f5.com"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Send sign-in link
        </button>
      </form>
      {error === "denied" ? (
        <p className="mt-6 text-sm text-red-600">
          That email isn&rsquo;t allowed. Sign in with an @f5.com address.
        </p>
      ) : null}
      {error === "missing" ? (
        <p className="mt-6 text-sm text-red-600">Enter an email address.</p>
      ) : null}
      <p className="mt-12 text-xs text-neutral-400">
        Built by F5 XC Product Marketing. Not part of the XC SKU surface.
      </p>
    </main>
  );
}
