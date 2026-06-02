"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  Banknote,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import { purchaseReturns, purchases, suppliers, type Purchase, type PurchaseStatus } from "@/lib/purchasing-mock-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function PurchasesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [supplier, setSupplier] = useState("All suppliers");
  const [addOpen, setAddOpen] = useState(false);
  const filteredPurchases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return purchases.filter((purchase) => {
      const matchesStatus = status === "All statuses" || purchase.status === status;
      const matchesSupplier = supplier === "All suppliers" || purchase.supplier === supplier;
      const matchesQuery = !normalized || `${purchase.invoice} ${purchase.supplier} ${purchase.description}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesSupplier && matchesQuery;
    });
  }, [query, status, supplier]);
  const totals = purchases.reduce((result, purchase) => ({ total: result.total + purchase.totalAmount, paid: result.paid + purchase.paidAmount, balance: result.balance + purchase.balanceDue }), { total: 0, paid: 0, balance: 0 });
  const returnTotal = purchaseReturns.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Stock procurement</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Purchases</h2><p className="mt-1 text-sm text-[#789083]">Track stock intake, supplier invoices and outstanding payments.</p></div>
        <button onClick={() => setAddOpen(true)} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]"><Plus size={16} /> Add purchase</button>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={ShoppingBag} label="Total purchases" value={formatCurrency(totals.total)} note={`${purchases.length} purchase invoices`} />
        <SummaryCard icon={CircleDollarSign} label="Paid purchases" value={formatCurrency(totals.paid)} note="Settled supplier payments" />
        <SummaryCard icon={WalletCards} label="Supplier balance" value={formatCurrency(totals.balance)} note="Outstanding amount payable" danger />
        <SummaryCard icon={ArrowDownLeft} label="Purchase returns" value={formatCurrency(returnTotal)} note={`${purchaseReturns.length} returns recorded`} gold />
      </section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-3 border-b border-[#E8F0EA] p-4 lg:grid-cols-[minmax(0,1fr)_170px_230px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search purchases" placeholder="Search invoice, supplier or purchase..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></label>
          <FilterSelect label="Filter purchase status" value={status} onChange={setStatus} options={["All statuses", "Paid", "Partial", "Unpaid"]} />
          <FilterSelect label="Filter by supplier" value={supplier} onChange={setSupplier} options={["All suppliers", ...suppliers.map((item) => item.name)]} />
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1240px] border-collapse text-left">
            <thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Invoice</th><th className="px-3 py-3.5">Supplier</th><th className="px-3 py-3.5">Purchase date</th><th className="px-3 py-3.5">Items</th><th className="px-3 py-3.5">Total amount</th><th className="px-3 py-3.5">Paid amount</th><th className="px-3 py-3.5">Balance due</th><th className="px-3 py-3.5">Payment</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead>
            <tbody>{filteredPurchases.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} />)}</tbody>
          </table>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">{filteredPurchases.map((purchase) => <PurchaseCard key={purchase.id} purchase={purchase} />)}</div>
        <footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filteredPurchases.length}</b> of <b className="text-[#173324]">{purchases.length}</b> purchases</footer>
      </section>
      {addOpen && <AddPurchasePlaceholder onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, note, danger, gold }: { icon: typeof ShoppingBag; label: string; value: string; note: string; danger?: boolean; gold?: boolean }) {
  const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black tracking-tight ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] outline-none focus:border-[#16A34A]">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label>;
}

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  return <tr className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]"><td className="px-4 py-3"><p className="font-black text-[#173324]">{purchase.invoice}</p><p className="mt-0.5 max-w-56 truncate text-[10px] text-[#9AAEA3]">{purchase.description}</p></td><td className="px-3 py-3 font-semibold">{purchase.supplier}</td><td className="px-3 py-3">{purchase.date}</td><td className="px-3 py-3">{purchase.itemsCount}</td><td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(purchase.totalAmount)}</td><td className="px-3 py-3 text-[#0F8C42]">{formatCurrency(purchase.paidAmount)}</td><td className="px-3 py-3 font-bold text-[#EF4444]">{formatCurrency(purchase.balanceDue)}</td><td className="px-3 py-3">{purchase.paymentMethod}</td><td className="px-3 py-3"><PurchaseStatusBadge status={purchase.status} /></td><td className="px-4 py-3 text-right"><button aria-label={`Actions for ${purchase.invoice}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><MoreHorizontal size={16} /></button></td></tr>;
}

function PurchaseCard({ purchase }: { purchase: Purchase }) {
  return <article className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-[#173324]">{purchase.invoice}</p><p className="mt-1 text-[10px] font-semibold text-[#789083]">{purchase.supplier}</p><p className="mt-1 text-[10px] text-[#9AAEA3]">{purchase.description}</p></div><PurchaseStatusBadge status={purchase.status} /></div><div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Total</b><strong className="mt-1 block text-[#173324]">{formatCurrency(purchase.totalAmount)}</strong></span><span><b className="block text-[#789083]">Paid</b><strong className="mt-1 block text-[#0F8C42]">{formatCurrency(purchase.paidAmount)}</strong></span><span><b className="block text-[#789083]">Balance</b><strong className="mt-1 block text-[#EF4444]">{formatCurrency(purchase.balanceDue)}</strong></span></div><p className="mt-2 text-[10px] text-[#789083]">{purchase.date} · {purchase.itemsCount} items · {purchase.paymentMethod}</p></article>;
}

function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  const tone = status === "Paid" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Partial" ? "bg-[#D4A017]/12 text-[#9A7108]" : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>;
}

function AddPurchasePlaceholder({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">Add stock purchase</h3><p className="mt-0.5 text-[10px] text-[#789083]">Mock purchase intake form</p></div><button onClick={onClose} aria-label="Close add purchase dialog" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><X size={16} /></button></div><div className="grid gap-3 p-4 sm:grid-cols-2"><PlaceholderField label="Supplier" placeholder="Select supplier" icon={Truck} /><PlaceholderField label="Supplier invoice" placeholder="e.g. SUP-INV-204" icon={ReceiptText} /><PlaceholderField label="Payment method" placeholder="Cash / M-Pesa / Bank" icon={CreditCard} /><PlaceholderField label="Amount paid" placeholder="KES 0" icon={Banknote} /><label className="sm:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Purchase items</span><textarea placeholder="Search and add purchased stock items..." className="mt-2 min-h-24 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></label><button className="sm:col-span-2 rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white hover:bg-[#12883E]">Save mock purchase</button><p className="text-center text-[10px] text-[#9AAEA3] sm:col-span-2">Placeholder flow only. No purchase will be saved.</p></div></article></div>;
}

function PlaceholderField({ label, placeholder, icon: Icon }: { label: string; placeholder: string; icon: typeof Truck }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><span className="relative mt-2 block"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAEA3]" size={14} /><input placeholder={placeholder} className="w-full rounded-xl border border-[#DDEAE0] py-3 pl-8 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></span></label>;
}
