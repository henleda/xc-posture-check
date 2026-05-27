import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { createShareLink } from "@/lib/db/queries/share-links";

const newLinkSchema = z.object({
  prospectCompany: z.string().min(1).max(120),
  prospectApexDomain: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Looks like that's not a valid apex domain")
    .optional()
    .or(z.literal("")),
});

async function createShareLinkAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const parsed = newLinkSchema.safeParse({
    prospectCompany: formData.get("prospectCompany"),
    prospectApexDomain: formData.get("prospectApexDomain"),
  });
  if (!parsed.success) {
    redirect("/share-links/new?error=invalid");
  }

  await createShareLink({
    userId: session.user.id,
    sellerName: session.user.name ?? session.user.email ?? "seller",
    prospectCompany: parsed.data.prospectCompany,
    prospectApexDomain: parsed.data.prospectApexDomain
      ? parsed.data.prospectApexDomain
      : null,
  });

  redirect("/dashboard");
}

export default async function NewShareLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">New share link</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Create a cobranded URL you can drop into your outreach. The prospect lands on a page
        with your name, your photo, and the F5 mark.
      </p>

      <form action={createShareLinkAction} className="mt-8 flex flex-col gap-5">
        <div>
          <label
            htmlFor="prospectCompany"
            className="block text-sm font-medium text-neutral-700"
          >
            Prospect company name
          </label>
          <input
            id="prospectCompany"
            name="prospectCompany"
            type="text"
            required
            placeholder="Acme Industries"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="prospectApexDomain"
            className="block text-sm font-medium text-neutral-700"
          >
            Apex domain <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            id="prospectApexDomain"
            name="prospectApexDomain"
            type="text"
            placeholder="acme.com"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            If you know it, prefilling makes the prospect&rsquo;s flow one click shorter.
          </p>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Generate share link
        </button>
      </form>

      {params.error === "invalid" ? (
        <p className="mt-6 text-sm text-red-600">
          Check the inputs — the company name is required and apex domain must be a valid
          hostname.
        </p>
      ) : null}
    </div>
  );
}
