import { redirect } from "next/navigation";
import { z } from "zod";
import { createShareLink } from "@/lib/db/queries/share-links";
import {
  listSellers,
  createUser,
  getUserByEmail,
  UserDomainNotAllowedError,
} from "@/lib/db/queries/users";

const schema = z.object({
  sellerId: z.string().uuid().optional().or(z.literal("")),
  newSellerName: z.string().max(120).optional().or(z.literal("")),
  newSellerEmail: z.string().email().optional().or(z.literal("")),
  newSellerTitle: z.string().max(120).optional().or(z.literal("")),
  newSellerCalendarUrl: z.string().url().optional().or(z.literal("")),
  prospectCompany: z.string().min(1).max(120),
  prospectApexDomain: z
    .string()
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i)
    .optional()
    .or(z.literal("")),
});

async function createAction(formData: FormData) {
  "use server";
  const parsed = schema.safeParse({
    sellerId: formData.get("sellerId"),
    newSellerName: formData.get("newSellerName"),
    newSellerEmail: formData.get("newSellerEmail"),
    newSellerTitle: formData.get("newSellerTitle"),
    newSellerCalendarUrl: formData.get("newSellerCalendarUrl"),
    prospectCompany: formData.get("prospectCompany"),
    prospectApexDomain: formData.get("prospectApexDomain"),
  });
  if (!parsed.success) redirect("/share-links/new?error=invalid");
  const d = parsed.data;

  let userId = d.sellerId || "";
  let sellerName = "";

  if (!userId) {
    // Creating a new seller inline requires at least name + email.
    if (!d.newSellerName || !d.newSellerEmail) {
      redirect("/share-links/new?error=seller");
    }
    try {
      const existing = await getUserByEmail(d.newSellerEmail);
      const seller =
        existing ??
        (await createUser({
          email: d.newSellerEmail,
          name: d.newSellerName,
          title: d.newSellerTitle || null,
          calendarUrl: d.newSellerCalendarUrl || null,
        }));
      userId = seller.id;
      sellerName = seller.name ?? d.newSellerName;
    } catch (error) {
      if (error instanceof UserDomainNotAllowedError) {
        redirect("/share-links/new?error=f5email");
      }
      throw error;
    }
  } else {
    const sellers = await listSellers();
    sellerName = sellers.find((s) => s.id === userId)?.name ?? "seller";
  }

  await createShareLink({
    userId,
    sellerName,
    prospectCompany: d.prospectCompany,
    prospectApexDomain: d.prospectApexDomain || null,
  });

  redirect("/dashboard");
}

const ERRORS: Record<string, string> = {
  invalid: "Check the inputs — company name is required and URLs/domains must be valid.",
  seller: "Pick an existing seller or fill in at least a name and email for a new one.",
  f5email: "Seller email must be an @f5.com address.",
};

export default async function NewShareLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, sellers] = await Promise.all([searchParams, listSellers()]);

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">New share link</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Attribute the link to a seller (their name, title, and calendar appear on the prospect
        page), then set the prospect details.
      </p>

      <form action={createAction} className="mt-8 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-neutral-900">Seller</legend>
          {sellers.length > 0 ? (
            <div>
              <label htmlFor="sellerId" className="block text-sm text-neutral-700">
                Existing seller
              </label>
              <select
                id="sellerId"
                name="sellerId"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
                defaultValue=""
              >
                <option value="">— add a new seller below —</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.email}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="rounded-md border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Or add a new seller</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                name="newSellerName"
                type="text"
                placeholder="Name"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <input
                name="newSellerEmail"
                type="email"
                placeholder="name@f5.com"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <input
                name="newSellerTitle"
                type="text"
                placeholder="Title (optional)"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <input
                name="newSellerCalendarUrl"
                type="url"
                placeholder="Calendar URL (optional)"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-neutral-900">Prospect</legend>
          <div>
            <label htmlFor="prospectCompany" className="block text-sm text-neutral-700">
              Company name
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
            <label htmlFor="prospectApexDomain" className="block text-sm text-neutral-700">
              Apex domain <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              id="prospectApexDomain"
              name="prospectApexDomain"
              type="text"
              placeholder="acme.com"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Generate share link
        </button>
      </form>

      {error && ERRORS[error] ? (
        <p className="mt-6 text-sm text-red-600">{ERRORS[error]}</p>
      ) : null}
    </div>
  );
}
