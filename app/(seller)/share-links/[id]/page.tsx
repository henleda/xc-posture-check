import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { shareLinks } from "@/lib/db/schema/tables/share-links";
import { listAssessmentsForShareLink } from "@/lib/db/queries/assessments";
import { listEventsForShareLink } from "@/lib/db/queries/events";

export const dynamic = "force-dynamic";

async function getShareLink(id: string) {
  const [row] = await db.select().from(shareLinks).where(eq(shareLinks.id, id)).limit(1);
  return row ?? null;
}

export default async function ShareLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Admin gate is enforced by middleware on /share-links/*; no per-row owner
  // check needed since the single admin sees every link.
  const link = await getShareLink(id);
  if (!link) notFound();

  const [assessments, events] = await Promise.all([
    listAssessmentsForShareLink(link.id),
    listEventsForShareLink(link.id),
  ]);

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard"
        className="text-sm text-neutral-500 underline underline-offset-4"
      >
        ← Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
        {link.prospectCompany}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Share URL:{" "}
        <code className="rounded bg-neutral-100 px-2 py-1 text-neutral-900">
          /r/{link.slug}
        </code>
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-neutral-500">Apex domain</dt>
          <dd className="text-neutral-900">{link.prospectApexDomain ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Created</dt>
          <dd className="text-neutral-900">
            {new Date(link.createdAt).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Verified</dt>
          <dd className="text-neutral-900">{link.verified ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Expires</dt>
          <dd className="text-neutral-900">
            {link.expiresAt ? new Date(link.expiresAt).toLocaleString() : "Never"}
          </dd>
        </div>
      </dl>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-900">Assessments</h2>
        {assessments.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No assessments yet from this link.
          </p>
        ) : (
          <ul className="mt-3 text-sm">
            {assessments.map((a) => (
              <li key={a.id} className="border-b border-neutral-100 py-2">
                {a.apexDomain} — {a.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-900">Events</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No events recorded yet.</p>
        ) : (
          <ul className="mt-3 text-sm">
            {events.map((e) => (
              <li key={e.id} className="border-b border-neutral-100 py-2">
                {e.eventType} — {new Date(e.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
