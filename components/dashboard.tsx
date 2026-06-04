import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  Clock3,
  CreditCard,
  HandCoins,
  PackageSearch,
  SlidersHorizontal,
  Smartphone,
  Store,
  ShoppingBag,
  TrendingUp,
  Truck,
  UserRoundPlus,
} from "lucide-react";
import { lowStockItems, recentActivity } from "@/lib/mock-data";
import { getIndustryOpsConfig } from "@/lib/industryops";
import { getCurrentBusiness } from "@/lib/settings-data";

const stats = [
  { label: "Today sales", value: "KES 184,250", note: "+12.8% vs yesterday", icon: CircleDollarSign, accent: "text-[#16A34A]", tile: "bg-[#16A34A]/10" },
  { label: "M-Pesa sales", value: "KES 126,800", note: "68.8% of today's sales", icon: Smartphone, accent: "text-[#0F8C42]", tile: "bg-[#16A34A]/10" },
  { label: "Cash sales", value: "KES 42,450", note: "23.0% of today's sales", icon: Banknote, accent: "text-[#D4A017]", tile: "bg-[#D4A017]/12" },
  { label: "Credit sales", value: "KES 15,000", note: "8.2% of today's sales", icon: CreditCard, accent: "text-[#D97706]", tile: "bg-[#F59E0B]/12" },
  { label: "Stock value", value: "KES 4.82M", note: "Across 3 warehouses", icon: Boxes, accent: "text-[#16A34A]", tile: "bg-[#16A34A]/10" },
  { label: "Debtors balance", value: "KES 286,400", note: "31 outstanding invoices", icon: HandCoins, accent: "text-[#EF4444]", tile: "bg-[#EF4444]/10" },
];

const activityIcons = {
  sale: CircleDollarSign,
  alert: AlertTriangle,
  payment: Smartphone,
  transfer: Store,
  customer: UserRoundPlus,
};

const chartPoints = "0,112 65,96 130,103 195,65 260,73 325,42 390,50 455,22 520,35 585,8";

async function currentIndustryMode() {
  try {
    const business = await getCurrentBusiness();
    return business.industryMode;
  } catch {
    return "Retail";
  }
}

export async function Dashboard() {
  const industry = getIndustryOpsConfig(await currentIndustryMode());

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Tuesday, 02 June 2026</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Good morning, James</h2>
          <p className="mt-1 text-sm text-[#789083]">Here is today&apos;s {industry.salesLabel.toLowerCase()} performance across your business.</p>
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map(({ label, value, note, icon: Icon, accent, tile }) => (
          <article key={label} className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
            <div className="mb-5 flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tile} ${accent}`}>
                <Icon size={19} />
              </span>
              {label === "Today sales" && <ArrowUpRight size={17} className="text-[#16A34A]" />}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#789083]">{label}</p>
            <p className="mt-1 text-lg font-black tracking-tight text-[#173324]">{value}</p>
            <p className="mt-2 text-[11px] text-[#789083]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
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
            <IndustryList title="Demo focus" items={[industry.productLabel, industry.salesLabel, industry.customerLabel, industry.stockLabel]} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/settings" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">Change industry mode</Link>
            {industry.label === "Supermarket" && <Link href="/supermarket-demo" className="rounded-xl border border-[#D4A017]/40 bg-white px-4 py-3 text-xs font-black text-[#8A670C]">Open Supermarket 4-Till Demo</Link>}
            {industry.label !== "Supermarket" && <Link href="/supermarket-demo" className="rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B]">View 4-Till supermarket demo</Link>}
          </div>
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-[#173324]">Demo Mode</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Local business data for presentation.</p>
            </div>
            <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 text-[10px] font-black text-[#0F8C42]">Demo Mode</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#60766B]">
            Use this dashboard to present how Biashara adapts to {industry.label.toLowerCase()} operations while keeping the same reliable sales, stock, customers and reports foundation.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {industry.sampleCategories.slice(0, 4).map((category) => <span key={category} className="rounded-full bg-[#F8FBF8] px-3 py-1.5 text-[10px] font-black text-[#60766B]">{category}</span>)}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-black text-[#173324]">Sales overview</h3>
              <p className="mt-0.5 text-xs text-[#789083]">Revenue performance for the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-[#60766B]">
                <i className="h-2 w-2 rounded-full bg-[#16A34A]" /> Sales
              </span>
              <button className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-[#60766B]">Last 7 days</button>
            </div>
          </div>
          <div className="dashboard-grid px-4 pb-4 pt-6 sm:px-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-black tracking-tight text-[#173324]">KES 1,247,850</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#16A34A]">
                  <TrendingUp size={14} /> 18.4% growth this week
                </p>
              </div>
            </div>
            <svg viewBox="0 0 585 135" className="mt-8 h-[180px] w-full overflow-visible" preserveAspectRatio="none" aria-label="Weekly sales line chart">
              <defs>
                <linearGradient id="salesArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity=".28" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity=".02" />
                </linearGradient>
              </defs>
              <polygon points={`0,135 ${chartPoints} 585,135`} fill="url(#salesArea)" />
              <polyline points={chartPoints} fill="none" stroke="#16A34A" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
              {[["0", "112"], ["65", "96"], ["130", "103"], ["195", "65"], ["260", "73"], ["325", "42"], ["390", "50"], ["455", "22"], ["520", "35"], ["585", "8"]].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#F6FFF8" stroke="#16A34A" strokeWidth="3" />
              ))}
            </svg>
            <div className="mt-1 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-[#789083]">
              <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span>
            </div>
          </div>
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
            {lowStockItems.map((item) => (
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
          <button className="mt-4 flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#0F8C42]">
            View inventory <ArrowRight size={14} />
          </button>
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
            {recentActivity.map((item) => {
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
            Complete your tax settings and add a default payment type to finish business setup.
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
