import Link from "next/link";
import { listAllShareLinks } from "@/lib/db/queries/share-links";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const links = await listAllShareLinks();

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600">
            All share links. Each is a cobranded URL attributed to a seller you can drop into
            outreach.
          </p>
        </div>
        <Link
          href="/share-links/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New share link
        </Link>
      </div>

      <div className="mt-8">
        {links.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-300 px-6 py-12 text-center">
            <p className="text-sm text-neutral-600">No share links yet.</p>
            <Link
              href="/share-links/new"
              className="mt-3 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              Create the first one
            </Link>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-4">Prospect</th>
                <th className="py-2 pr-4">Seller</th>
                <th className="py-2 pr-4">Slug</th>
                <th className="py-2 pr-4">Apex domain</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-neutral-100">
                  <td className="py-3 pr-4 font-medium text-neutral-900">
                    {link.prospectCompany}
                  </td>
                  <td className="py-3 pr-4 text-neutral-600">{link.sellerName ?? "—"}</td>
                  <td className="py-3 pr-4 text-neutral-600">/r/{link.slug}</td>
                  <td className="py-3 pr-4 text-neutral-600">{link.prospectApexDomain ?? "—"}</td>
                  <td className="py-3 pr-4 text-neutral-500">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/share-links/${link.id}`}
                      className="text-neutral-900 underline underline-offset-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
