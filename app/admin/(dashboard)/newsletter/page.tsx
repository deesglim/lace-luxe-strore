import NewsletterExportButton from "@/components/admin/NewsletterExportButton";
import { getAllNewsletterSubscribers } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getAllNewsletterSubscribers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-espresso">Newsletter</h1>
          <p className="mt-1 font-sans text-sm text-charcoal/70">
            {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
          </p>
        </div>
        <NewsletterExportButton subscribers={subscribers} />
      </div>

      {subscribers.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/70">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto border border-blush">
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/30 text-xs uppercase tracking-[0.1em] text-bronze">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-blush/60 last:border-0">
                  <td className="px-4 py-3 text-charcoal">{subscriber.email}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {new Date(subscriber.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
