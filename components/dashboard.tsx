import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  Clock3,
  CreditCard,
  HandCoins,
  PackageSearch,
  RefreshCw,
  SlidersHorizontal,
  Smartphone,
  Store,
  ShoppingBag,
  Truck,
  UserRoundPlus,
} from "lucide-react";
import { getIndustryOpsConfig } from "@/lib/industryops";
import { getDashboardForPage } from "@/lib/db-data";
import { TrialCountdownCard } from "@/components/trial-countdown-card";

const activityIcons = {
  sale: CircleDollarSign,
  alert: AlertTriangle,
  payment: Smartphone,
  transfer: Store,
  customer: UserRoundPlus,
};

function money(value: number) {
  return `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export async function Dashboard() {
  const data = await getDashboardForPage();
  const industry = getIndustryOpsConfig(data.industryMode);
  const hasActivity = data.todaySales > 0 || data.weeklySales > 0 || data.productsCount > 0 || data.customersCount > 0;
  const stats = [
    { label: "Today sales", value: money(data.todaySales), note: "Recorded today", icon: CircleDollarSign, accent: "text-[#16A34A]", tile: "bg-[#16A34A]/10" },
    { label: "M-Pesa sales", value: money(data.mpesaSales), note: "M-Pesa collected today", icon: Smartphone, accent: "text-[#0F8C42]", tile: "bg-[#16A34A]/10" },
    { label: "Cash sales", value: money(data.cashSales), note: "Cash collected today", icon: Banknote, accent: "text-[#D4A017]", tile: "bg-[#D4A017]/12" },
    { label: "Credit sales", value: money(data.creditSales), note: "Unpaid sales balance", icon: CreditCard, accent: "text-[#D97706]", tile: "bg-[#F59E0B]/12" },
    { label: "Stock value", value: money(data.stockValue), note: `${data.productsCount} products`, icon: Boxes, accent: "text-[#16A34A]", tile: "bg-[#16A34A]/10" },
    { label: "Debtors balance", value: money(data.debtorsBalance), note: `${data.customersCount} customers`, icon: HandCoins, accent: "text-[#EF4444]", tile: "bg-[#EF4444]/10" },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">{data.businessName}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Business dashboard</h2>
          <p className="mt-1 text-sm text-[#789083]">Track sales, stock, customers and setup progress for this business account.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/purchases" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-3 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            Purchases <ShoppingBag size={15} />
          </Link>
          <Link href="/suppliers" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-3 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            Suppliers <Truck size={15} />
          </Link>
          <Link href="/customers" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-3 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            Customers <UserRoundPlus size={15} />
          </Link>
          <Link href="/debtors" className="flex w-fit items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-3.5 py-3 text-xs font-bold text-[#8A670C] hover:bg-[#FFF2C9]">
            Due list <HandCoins size={15} />
          </Link>
          <Link href="/sales" className="flex w-fit items-center gap-2 rounded-xl bg-[#12311F] px-4 py-3 text-xs font-bold text-white hover:bg-[#0E2418]">
            Open sales register <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <TrialCountdownCard />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map(({ label, value, note, icon: Icon, accent, tile }) => (
          <article key={label} className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
            <div className="mb-5 flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tile} ${accent}`}>
                <Icon size={19} />
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#789083]">{label}</p>
            <p className="mt-1 text-lg font-black tracking-tight text-[#173324]">{value}</p>
            <p className="mt-2 text-[11px] text-[#789083]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <article className="rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#A57809]">IndustryOps Mode</p>
              <h3 className="mt-1 text-xl font-black text-[#173324]">Current mode: {industry.dashboardTitle}</h3>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-[#8A670C]">{industry.demoFocus}</p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#D4A017]/18 text-[#A57809]">
              <SlidersHorizontal size={20} />
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <IndustryList title="Key benefits" items={industry.demoBenefits} />
            <IndustryList title="Recommended modules" items={industry.recommendedModules} />
            <IndustryList title="Workflow focus" items={[industry.productLabel, industry.salesLabel, industry.customerLabel, industry.stockLabel]} />
          </div>
          <Link href="/settings" className="mt-4 inline-flex rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">Change industry mode</Link>
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-[#173324]">Onboarding</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Set up your business workspace.</p>
            </div>
            <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 text-[10px] font-black text-[#0F8C42]">Fresh account</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#60766B]">
            Start by adding products, customers, suppliers and payment settings. Your reports will build automatically as transactions are recorded.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Add products", "Add customers", "Record first sale", "Configure payments"].map((item) => <span key={item} className="rounded-full bg-[#F8FBF8] px-3 py-1.5 text-[10px] font-black text-[#60766B]">{item}</span>)}
          </div>
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-[#173324]">Hybrid Sync Center</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Track offline sales saved on this device and sync them when connection returns.</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D4A017]/12 text-[#9A7108]">
              <RefreshCw size={18} />
            </span>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#60766B]">
            This is the first Hybrid POS stage: sales can be queued locally in the browser while full cloud sync is being prepared.
          </p>
          <Link href="/sync-center" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]">
            Open Sync Center <ArrowRight size={14} />
          </Link>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-black text-[#173324]">Sales overview</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Reports will appear after transactions are recorded.</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-[#60766B]">
                <i className="h-2 w-2 rounded-full bg-[#16A34A]" /> Sales
              </span>
              <span className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-[#60766B]">Last 7 days</span>
            </div>
          </div>
          <EmptyDashboardPanel
            hasActivity={hasActivity}
            value={money(data.weeklySales)}
            emptyText="No sales yet. Open the sales register to record your first sale."
          />
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-[#173324]">Low stock items</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Products that need attention</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#EF4444]/10 text-[#EF4444]">
              <PackageSearch size={18} />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {data.lowStockItems.length === 0 ? <p className="rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-4 text-xs font-bold text-[#789083]">No low stock items yet. Add products with reorder levels to monitor stock.</p> : null}
            {data.lowStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-[#E8F0EA] p-3">
                <div className="min-w-0 pr-3">
                  <p className="truncate text-xs font-bold text-[#173324]">{item.name}</p>
                  <p className="mt-1 text-[10px] text-[#789083]">{item.warehouse}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#EF4444]/10 px-2.5 py-1 text-[10px] font-black text-[#EF4444]">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
          <Link href="/warehouse" className="mt-4 flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#0F8C42]">
            View inventory <ArrowRight size={14} />
          </Link>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-[#173324]">Recent activity</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Latest actions across your branches</p>
            </div>
            <Clock3 size={18} className="text-[#789083]" />
          </div>
          <div className="mt-5 space-y-4">
            {data.recentActivity.length === 0 ? <p className="rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-4 text-xs font-bold text-[#789083]">No activity yet. Actions such as sales, stock changes and payments will appear here.</p> : null}
            {data.recentActivity.map((item) => {
              const Icon = activityIcons[item.type as keyof typeof activityIcons];
              return (
                <div key={`${item.action}-${item.time}`} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#173324]">{item.action}</p>
                    <p className="truncate text-[11px] text-[#789083]">{item.detail}</p>
                  </div>
                  <time className="shrink-0 text-[10px] font-semibold text-[#9AAEA3]">{item.time}</time>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl bg-[#12311F] p-5 text-[#F6FFF8] shadow-lg shadow-[#12311F]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#D4A017]">Setup assistant</p>
              <h3 className="mt-1 text-lg font-black">You&apos;re almost ready</h3>
            </div>
            <span className="text-2xl font-black text-[#22C55E]">72%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-[#22C55E]" />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#B8C7BD]">
            Add your first products, customers and payment methods to finish business setup.
          </p>
          <button className="mt-5 rounded-xl bg-[#D4A017] px-4 py-2.5 text-xs font-black text-[#07120D] hover:bg-[#E4B432]">
            Continue setup
          </button>
        </article>
      </section>
    </div>
  );
}

function IndustryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#D4A017]/25 bg-white/70 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#8A670C]">{title}</p>
      <div className="mt-2 space-y-1.5">
        {items.slice(0, 4).map((item) => <p key={item} className="text-[11px] font-bold text-[#60766B]">- {item}</p>)}
      </div>
    </div>
  );
}

function EmptyDashboardPanel({ hasActivity, value, emptyText }: { hasActivity: boolean; value: string; emptyText: string }) {
  return (
    <div className="px-4 pb-4 pt-6 sm:px-5">
      <div className="rounded-2xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-8 text-center">
        <p className="text-2xl font-black tracking-tight text-[#173324]">{hasActivity ? value : "KES 0"}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#789083]">{hasActivity ? "Weekly sales total from recorded transactions." : emptyText}</p>
        <Link href="/sales" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white">
          Open sales register <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
