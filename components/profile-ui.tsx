import Link from "next/link";
import type { ReactNode } from "react";
import type { ProfileMetric, ProfileTransaction } from "@/lib/profile-data";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function ProfileHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 print:mb-3 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-[#789083]">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        {actions}
        <Link href={backHref} className="rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

export function MetricGrid({ metrics }: { metrics: ProfileMetric[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const color = metric.tone === "red" ? "text-[#EF4444]" : metric.tone === "gold" ? "text-[#A57809]" : "text-[#0F8C42]";
        return (
          <article key={metric.label} className="rounded-2xl border border-[#DDEAE0] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{metric.label}</p>
            <p className={`mt-2 text-xl font-black ${color}`}>{metric.value}</p>
          </article>
        );
      })}
    </section>
  );
}

export function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5">
      <h3 className="text-sm font-black text-[#173324]">{title}</h3>
      <dl className="mt-4 space-y-3 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-[#EEF3EF] pb-2 last:border-0 last:pb-0">
            <dt className="font-bold text-[#789083]">{label}</dt>
            <dd className="text-right font-black text-[#173324]">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function TransactionTable({ title, empty, rows }: { title: string; empty: string; rows: ProfileTransaction[] }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
      <div className="border-b border-[#E8F0EA] p-4">
        <h3 className="text-sm font-black text-[#173324]">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <div className="grid min-h-36 place-items-center p-6 text-center text-xs text-[#789083]">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead>
              <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">
                {["Date", "Reference", "Description", "Amount", "Paid", "Due", "Status"].map((heading) => (
                  <th key={heading} className="px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#EEF3EF] text-[#60766B]">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3 font-black text-[#173324]">{row.reference}</td>
                  <td className="px-4 py-3">{row.description}</td>
                  <td className="px-4 py-3 font-black text-[#173324]">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-3">{row.paid === undefined ? "-" : formatCurrency(row.paid)}</td>
                  <td className="px-4 py-3">{row.due === undefined ? "-" : formatCurrency(row.due)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const tone = lower.includes("active") || lower.includes("paid") || lower.includes("complete")
    ? "bg-[#16A34A]/10 text-[#0F8C42]"
    : lower.includes("pending") || lower.includes("partial")
      ? "bg-[#D4A017]/12 text-[#9A7108]"
      : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>;
}
