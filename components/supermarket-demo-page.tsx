import Link from "next/link";
import { ArrowRight, Banknote, Cable, CheckCircle2, CircleDollarSign, Clock3, CreditCard, Database, HandCoins, PackageSearch, ReceiptText, Smartphone, Store, Users } from "lucide-react";

const tills = [
  { till: "Till 1", cashier: "Mary Wanjiku", status: "Active", sales: 48250, transactions: 42, lastSale: "10:42", cash: 12400, mpesa: 32850, bank: 3000, credit: 0 },
  { till: "Till 2", cashier: "John Kamau", status: "Active", sales: 36600, transactions: 31, lastSale: "10:39", cash: 18400, mpesa: 15200, bank: 0, credit: 3000 },
  { till: "Till 3", cashier: "Faith Njeri", status: "Active", sales: 28400, transactions: 26, lastSale: "10:36", cash: 8300, mpesa: 17600, bank: 2500, credit: 0 },
  { till: "Till 4", cashier: "Peter Otieno", status: "Active", sales: 22750, transactions: 19, lastSale: "10:31", cash: 3350, mpesa: 14450, bank: 0, credit: 4950 },
];

const lowStockItems = ["Whole Milk 1L", "Basmati Rice 1kg", "Seed Oil 250ml", "Brake Pads Toyota Axio Front"];
const topItems = ["Seed Oil 1L", "Basmati Rice 1kg", "Whole Milk 1L", "Chips Chicken"];

function money(value: number) {
  return `Ksh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(value)}`;
}

export function SupermarketDemoPage() {
  const totals = tills.reduce(
    (sum, till) => ({
      sales: sum.sales + till.sales,
      transactions: sum.transactions + till.transactions,
      cash: sum.cash + till.cash,
      mpesa: sum.mpesa + till.mpesa,
      bank: sum.bank + till.bank,
      credit: sum.credit + till.credit,
    }),
    { sales: 0, transactions: 0, cash: 0, mpesa: 0, bank: 0, credit: 0 },
  );

  return (
    <div className="mx-auto max-w-[1750px]">
      <div className="mb-6 overflow-hidden rounded-3xl bg-[#07120D] p-5 text-[#F6FFF8] shadow-xl shadow-[#12311F]/10 md:p-7">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4A017]">Presentation demo</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Supermarket 4-Till Demo</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#B8C7BD]">One central POS server, four cashier tills, shared stock and owner reporting.</p>
          </div>
          <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#22C55E]">Demo Mode</p>
            <p className="mt-1 text-sm font-black">Local business data for presentation</p>
            <Link href="/settings" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">Change IndustryOps mode <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {tills.map((till) => <TillCard key={till.till} till={till} />)}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-[#173324]">Central Owner View</h3>
              <p className="mt-1 text-xs text-[#789083]">All tills roll up into one supermarket dashboard.</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Store size={18} /></span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric icon={CircleDollarSign} label="Sales today" value={money(totals.sales)} />
            <Metric icon={ReceiptText} label="Transactions" value={`${totals.transactions}`} />
            <Metric icon={Banknote} label="Cash total" value={money(totals.cash)} />
            <Metric icon={Smartphone} label="M-Pesa total" value={money(totals.mpesa)} />
            <Metric icon={CreditCard} label="Credit sales" value={money(totals.credit)} danger />
            <Metric icon={HandCoins} label="Debtors balance" value={money(161900)} danger />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ListCard icon={PackageSearch} title="Low stock items" items={lowStockItems} danger />
            <ListCard icon={CheckCircle2} title="Top selling items" items={topItems} />
          </div>
        </article>

        <article className="rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#D4A017]/18 text-[#A57809]"><Database size={20} /></span>
            <div>
              <h3 className="font-black text-[#173324]">Shared Stock Explanation</h3>
              <p className="text-xs text-[#8A670C]">Central inventory for all tills.</p>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-[#D4A017]/25 bg-white/70 p-4 text-sm leading-6 text-[#173324]">
            When any till sells an item, stock reduces from the same central inventory. The owner sees one stock balance, one sales total, and one report view even when four cashiers are selling at the same time.
          </p>
          <div className="mt-4 grid gap-2">
            {["Till 1 sells milk", "Central stock reduces immediately", "Till 4 sees updated milk stock", "Owner report updates in one dashboard"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl bg-white/70 p-3 text-xs font-bold text-[#60766B]">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="border-b border-[#E8F0EA] p-4">
          <h3 className="font-black text-[#173324]">Cashier Performance</h3>
          <p className="mt-1 text-xs text-[#789083]">Each cashier logs in separately, so accountability stays clear.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Cashier", "Till", "Sales count", "Cash sales", "M-Pesa sales", "Credit sales", "Total sales", "Status"].map((header) => <th key={header} className="px-4 py-3.5">{header}</th>)}</tr></thead>
            <tbody>{tills.map((till) => <tr key={till.till} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{till.cashier}</td><td className="px-4 py-3">{till.till}</td><td className="px-4 py-3">{till.transactions}</td><td className="px-4 py-3">{money(till.cash)}</td><td className="px-4 py-3">{money(till.mpesa)}</td><td className="px-4 py-3 text-[#EF4444]">{money(till.credit)}</td><td className="px-4 py-3 font-black text-[#173324]">{money(till.sales)}</td><td className="px-4 py-3"><span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-black text-[#0F8C42]">{till.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Users size={18} /></span>
            <div>
              <h3 className="font-black text-[#173324]">Demo Story</h3>
              <p className="text-xs text-[#789083]">Client presentation script.</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#60766B]">
            This is how a supermarket with 4 cashiers can run all tills from one central system. Each cashier logs in separately, but the owner sees all sales, stock, debtors and reports in one dashboard.
          </p>
        </article>

        <article className="rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/18 text-[#A57809]"><Cable size={18} /></span>
            <div>
              <h3 className="font-black text-[#173324]">Hybrid Future Notice</h3>
              <p className="text-xs text-[#8A670C]">Offline sync stage planned after core cloud modules.</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#8A670C]">
            Hybrid offline sync stage will allow tills to continue selling when internet/server connection drops, then sync pending sales when connection returns.
          </p>
        </article>
      </section>
    </div>
  );
}

function TillCard({ till }: { till: (typeof tills)[number] }) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{till.till}</p>
          <h3 className="mt-1 font-black text-[#173324]">{till.cashier}</h3>
        </div>
        <span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-black text-[#0F8C42]">{till.status}</span>
      </div>
      <p className="mt-4 text-lg font-black text-[#173324]">{money(till.sales)}</p>
      <p className="mt-1 text-xs text-[#789083]">{till.transactions} transactions today</p>
      <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#60766B]"><Clock3 size={13} /> Last sale {till.lastSale}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold">
        <span className="rounded-lg bg-[#F8FBF8] p-2">Cash: {money(till.cash)}</span>
        <span className="rounded-lg bg-[#F8FBF8] p-2">M-Pesa: {money(till.mpesa)}</span>
        <span className="rounded-lg bg-[#F8FBF8] p-2">Bank: {money(till.bank)}</span>
        <span className="rounded-lg bg-[#FFF9E8] p-2 text-[#8A670C]">Credit: {money(till.credit)}</span>
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value, danger }: { icon: typeof CircleDollarSign; label: string; value: string; danger?: boolean }) {
  return <div className="rounded-xl border border-[#E8F0EA] bg-[#F8FBF8] p-3"><span className={`grid h-9 w-9 place-items-center rounded-lg ${danger ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}><Icon size={16} /></span><p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className="mt-1 text-sm font-black text-[#173324]">{value}</p></div>;
}

function ListCard({ icon: Icon, title, items, danger }: { icon: typeof PackageSearch; title: string; items: string[]; danger?: boolean }) {
  return <div className="rounded-xl border border-[#E8F0EA] bg-[#F8FBF8] p-3"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-lg ${danger ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}><Icon size={15} /></span><h4 className="text-xs font-black text-[#173324]">{title}</h4></div><div className="mt-3 space-y-1.5">{items.map((item) => <p key={item} className="text-[11px] font-bold text-[#60766B]">- {item}</p>)}</div></div>;
}
