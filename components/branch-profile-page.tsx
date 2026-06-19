import Link from "next/link";
import { InfoCard, MetricGrid, ProfileHeader, TransactionTable, formatCurrency, StatusBadge } from "@/components/profile-ui";
import type { BranchProfileData } from "@/lib/profile-data";

export function BranchProfilePage({ branch }: { branch: BranchProfileData }) {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ProfileHeader
        eyebrow="Branch profile"
        title={branch.name}
        subtitle={`${branch.location} - ${branch.businessName}`}
        backHref="/branches"
        backLabel="Back to branches"
        actions={
          <>
            <Link href={`/branches/${branch.id}/dashboard`} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">View branch dashboard</Link>
            <Link href="/branches" className="rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Edit branch</Link>
            <Link href="/hrm" className="rounded-xl border border-[#D4A017]/40 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C]">Add staff</Link>
          </>
        }
      />
      <MetricGrid metrics={branch.metrics.slice(0, 4)} />
      <section className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <InfoCard title="Branch details" rows={[
          ["Location", branch.location],
          ["Manager", branch.managerName],
          ["Phone", branch.phone || "No phone added"],
          ["Status", branch.status],
          ["Created", branch.createdAt],
        ]} />
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5">
          <h3 className="text-sm font-black text-[#173324]">Assigned users</h3>
          {branch.users.length === 0 ? <p className="mt-4 text-xs text-[#789083]">No users assigned to this branch yet.</p> : (
            <div className="mt-4 space-y-2">
              {branch.users.map((user) => <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FBF8] p-3 text-xs"><div><p className="font-black text-[#173324]">{user.name}</p><p className="mt-1 text-[#789083]">{user.email} - {user.role}</p></div><StatusBadge status={user.status} /></div>)}
            </div>
          )}
        </article>
      </section>
      <section className="mt-5">
        <TransactionTable title="Recent branch sales" empty="No sales recorded in this branch yet." rows={branch.recentSales} />
      </section>
    </div>
  );
}

export function BranchDashboardPage({ branch }: { branch: BranchProfileData }) {
  return (
    <div className="mx-auto max-w-[1550px]">
      <ProfileHeader
        eyebrow="Branch dashboard"
        title={`${branch.name} dashboard`}
        subtitle={`${branch.location} - Manager: ${branch.managerName}`}
        backHref={`/branches/${branch.id}`}
        backLabel="Back to branch profile"
        actions={<Link href="/sales" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">Record first sale</Link>}
      />
      <MetricGrid metrics={branch.metrics} />
      {branch.recentSales.length === 0 && branch.products.length === 0 && branch.users.length === 0 && (
        <section className="mt-5 grid gap-3 md:grid-cols-4">
          <OnboardingCard title="Record first sale" href="/sales" />
          <OnboardingCard title="Add products" href="/products" />
          <OnboardingCard title="Add staff/cashier" href="/hrm" />
          <OnboardingCard title="Configure branch" href="/branches" />
        </section>
      )}
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <TransactionTable title="Recent sales" empty="No sales recorded in this branch yet." rows={branch.recentSales} />
        <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
          <div className="border-b border-[#E8F0EA] p-4"><h3 className="text-sm font-black text-[#173324]">Products and stock</h3></div>
          {branch.products.length === 0 ? <div className="grid min-h-36 place-items-center p-6 text-center text-xs text-[#789083]">No branch products assigned yet.</div> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{branch.products.map((product) => <tr key={product.id} className="border-t border-[#EEF3EF] text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{product.name}</td><td className="px-4 py-3">{product.category}</td><td className="px-4 py-3">{product.stock}</td><td className="px-4 py-3">{formatCurrency(product.value)}</td><td className="px-4 py-3"><StatusBadge status={product.status} /></td></tr>)}</tbody></table></div>
          )}
        </article>
      </section>
      <section className="mt-5 rounded-2xl border border-[#DDEAE0] bg-white p-5">
        <h3 className="text-sm font-black text-[#173324]">Low stock items</h3>
        {branch.lowStockProducts.length === 0 ? <p className="mt-3 text-xs text-[#789083]">No low stock products in this branch.</p> : <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{branch.lowStockProducts.map((product) => <div key={product.id} className="rounded-xl bg-[#FFF9E8] p-4 text-xs"><p className="font-black text-[#173324]">{product.name}</p><p className="mt-1 text-[#8A670C]">Stock {product.stock}, reorder at {product.reorderLevel}</p></div>)}</div>}
      </section>
    </div>
  );
}

function OnboardingCard({ title, href }: { title: string; href: string }) {
  return <Link href={href} className="rounded-2xl border border-[#DDEAE0] bg-white p-4 text-xs font-black text-[#173324] hover:border-[#16A34A]/50 hover:bg-[#F8FBF8]">{title}</Link>;
}

