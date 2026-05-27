import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { shareLinks } from "@/lib/db/schema/tables/share-links";
import { users } from "@/lib/db/schema/tables/users";
import { getActiveShareLinkBySlug } from "@/lib/db/queries/share-links";

export const dynamic = "force-dynamic";

async function getSellerForShareLink(shareLinkId: string) {
  const [row] = await db
    .select({
      name: users.name,
      title: users.title,
      avatarUrl: users.avatarUrl,
      image: users.image,
      calendarUrl: users.calendarUrl,
    })
    .from(users)
    .innerJoin(shareLinks, eq(shareLinks.userId, users.id))
    .where(eq(shareLinks.id, shareLinkId))
    .limit(1);
  return row ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = await getActiveShareLinkBySlug(slug);
  if (!link) return { title: "Not found — XC Posture Check" };
  return {
    title: `${link.prospectCompany} — XC Posture Check`,
    description: `A 90-second security posture assessment for ${link.prospectCompany}, shared by F5.`,
  };
}

export default async function ProspectLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getActiveShareLinkBySlug(slug);
  if (!link) notFound();

  const seller = await getSellerForShareLink(link.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
      <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-neutral-500">
        <span>F5</span>
        <span aria-hidden>·</span>
        <span>Distributed Cloud</span>
      </div>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
        A 90-second posture check for {link.prospectCompany}.
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-neutral-600">
        Enter your apex domain and we&rsquo;ll map your external attack surface across every cloud
        and edge provider you actually use, score how fragmented your security stack is, and show
        you which assets are exposed. Free. No login.
      </p>

      <form className="mt-10 flex max-w-xl flex-col gap-3" action="#" method="post">
        <label htmlFor="apex" className="text-sm font-medium text-neutral-700">
          Your apex domain
        </label>
        <div className="flex gap-2">
          <input
            id="apex"
            name="apex"
            type="text"
            required
            defaultValue={link.prospectApexDomain ?? ""}
            placeholder="example.com"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled
            className="cursor-not-allowed rounded-md bg-neutral-300 px-4 py-2 text-sm font-medium text-white"
            title="Assessment engine ships in Phase 4"
          >
            Run check
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          Coming soon. The assessment engine lands in Phase 4.
        </p>
      </form>

      {seller ? (
        <aside className="mt-16 flex items-center gap-4 rounded-md border border-neutral-200 p-4">
          {seller.image || seller.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={seller.image ?? seller.avatarUrl ?? ""}
              alt={seller.name ?? "Seller"}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm text-neutral-500">
              {(seller.name ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium text-neutral-900">{seller.name ?? "F5 Seller"}</p>
            {seller.title ? (
              <p className="text-neutral-500">{seller.title}</p>
            ) : null}
            {seller.calendarUrl ? (
              <a
                href={seller.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 underline underline-offset-4"
              >
                Book time
              </a>
            ) : null}
          </div>
        </aside>
      ) : null}
    </main>
  );
}
