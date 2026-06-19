"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, FileText, HandCoins, MoreHorizontal, Search, Truck, Users, WalletCards, X } from "lucide-react";
import { exportReportToPdf, exportToCsv, type ExportRow } from "@/lib/export";
import { partyReportCategories } from "@/lib/report-mock-data";
import type { PartySummary } from "@/lib/report-data";

type PartyRow = {
  id: string;
  name: string;
  type: "Customer" | "Supplier";
  phone: string;
  transactions: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  lastTransaction: string;
  status: "Clear" | "Owes" | "Overdue";
};

type PartyDetail = {
  id: string;
  name: string;
  type: string;
  balance: number;
  rows: Record<string, string | number>[];
};

const emptySummary: PartySummary = {
  totalCustomerBalances: 0,
  totalSupplierBalances: 0,
  overdueCustomers: 0,
  supplierPendingPayments: 0,
  totalCustomerPurchases: 0,
  totalSupplierPurchases: 0,
};

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function PartyReportsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All parties");
  const [status, setStatus] = useState("All statuses");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PartyRow[]>([]);
  const [summary, setSummary] = useState<PartySummary>(emptySummary);
  const [selected, setSelected] = useState<PartyDetail | null>(null);
  const [statementLoading, setStatementLoading] = useState(false);

  const loadParties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/party-reports");
      if (!response.ok) throw new Error("Failed to load party reports.");
      const json = (await response.json()) as { data: { summary: PartySummary; rows: PartyRow[] } };
      setSummary(json.data.summary);
      setRows(json.data.rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Party reports could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadParties();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadParties]);

  const filtered = useMemo(() => {
    const n = query.trim().toLowerCase();
    return rows.filter((party) => (type === "All parties" || party.type === type) && (status === "All statuses" || party.status === status) && (!n || `${party.name} ${party.phone}`.toLowerCase().includes(n)));
  }, [query, rows, status, type]);

  async function openStatement(party: PartyRow) {
    setStatementLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/party-reports/${party.id}`);
      if (!response.ok) throw new Error("Failed to load statement preview.");
      const json = (await response.json()) as { data: PartyDetail };
      setSelected(json.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Statement preview could not be loaded.");
    } finally {
      setStatementLoading(false);
    }
  }

  function downloadPdf() {
    const rows = filtered.map((party) => ({
      "Party name": party.name,
      "Party type": party.type,
      Phone: party.phone,
      "Total transactions": party.transactions,
      "Total amount": party.totalAmount,
      "Paid amount": party.paidAmount,
      Balance: party.balance,
      "Last transaction": party.lastTransaction,
      Status: party.status,
    }));
    if (rows.length === 0) {
      setFeedback("No rows to export.");
      window.setTimeout(() => setFeedback(""), 2500);
      return;
    }
    exportReportToPdf({
      filename: "leadsstacks-party-report.pdf",
      title: "Party report",
      summary: {
        customerBalances: summary.totalCustomerBalances,
        supplierBalances: summary.totalSupplierBalances,
        overdueCustomers: summary.overdueCustomers,
      },
      rows,
    });
    setFeedback("Party PDF exported.");
    window.setTimeout(() => setFeedback(""), 2500);
  }

  function downloadCsv() {
    const exportRows = filtered.map((party) => ({
      "Party name": party.name,
      "Party type": party.type,
      Phone: party.phone,
      "Total transactions": party.transactions,
      "Total amount": party.totalAmount,
      "Paid amount": party.paidAmount,
      Balance: party.balance,
      "Last transaction": party.lastTransaction,
      Status: party.status,
    }));
    const ok = exportToCsv("biashara-party-report", exportRows);
    setFeedback(ok ? "Party CSV exported." : "No rows to export.");
    window.setTimeout(() => setFeedback(""), 2500);
  }

  function downloadStatementCsv() {
    if (!selected) return;
    const ok = exportToCsv(`${selected.type.toLowerCase()}-statement-${selected.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, selected.rows as ExportRow[]);
    setFeedback(ok ? "Statement CSV exported." : "No statement rows to export.");
    window.setTimeout(() => setFeedback(""), 2500);
  }

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Statements and balances</p>
          <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Party Reports</h2>
          <p className="mt-1 text-sm text-[#789083]">Review customer and supplier transactions, statements and balances.</p>
          {error && <p className="mt-2 text-xs font-bold text-[#EF4444]">{error}</p>}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPdf} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B]"><Download size={15} />Download PDF</button>
            <button onClick={downloadCsv} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white"><Download size={15} />Export CSV</button>
          </div>
          {feedback && <p className="mt-2 text-right text-[11px] font-bold text-[#16A34A]">{feedback}</p>}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Summary icon={Users} label="Customer balances" value={money(summary.totalCustomerBalances)} note="Outstanding customer debt" danger />
        <Summary icon={Truck} label="Supplier balances" value={money(summary.totalSupplierBalances)} note="Payable supplier accounts" gold />
        <Summary icon={HandCoins} label="Overdue customers" value={`${summary.overdueCustomers} accounts`} note="Requires collection follow-up" danger />
        <Summary icon={WalletCards} label="Supplier pending" value={`${summary.supplierPendingPayments} suppliers`} note="Outstanding vendor payments" gold />
        <Summary icon={Users} label="Customer purchases" value={money(summary.totalCustomerPurchases)} note="Customer sales total" />
        <Summary icon={Truck} label="Supplier purchases" value={money(summary.totalSupplierPurchases)} note="Supplier purchase total" />
      </section>

      <section className="mt-5">
        <h3 className="font-black text-[#173324]">Party report categories</h3>
        <p className="text-xs text-[#789083]">Generate a focused party statement or transaction history.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partyReportCategories.map((title) => <article key={title} className="flex items-center gap-3 rounded-xl border border-[#DDEAE0] bg-white p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]"><FileText size={15} /></span><div className="flex-1"><p className="text-xs font-black text-[#173324]">{title}</p><button onClick={() => setFeedback(`${title} selected. Use the table filters below.`)} className="mt-1 text-[10px] font-black text-[#16A34A]">Open report</button></div></article>)}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
        <div className="grid gap-3 border-b border-[#E8F0EA] p-4 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search parties" placeholder="Search customer, supplier or phone..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none" /></label>
          <Select label="Party type filter" value={type} onChange={setType} options={["All parties", "Customer", "Supplier"]} />
          <Select label="Party status filter" value={status} onChange={setStatus} options={["All statuses", "Clear", "Owes", "Overdue"]} />
        </div>
        {loading ? <p className="p-6 text-sm font-bold text-[#789083]">Loading party reports...</p> : <PartyTable records={filtered} onView={openStatement} />}
      </section>

      {statementLoading && <p className="mt-3 text-xs font-bold text-[#789083]">Loading statement preview...</p>}
      {selected && <StatementPanel detail={selected} onClose={() => setSelected(null)} onExport={downloadStatementCsv} />}
    </div>
  );
}

function Summary({ icon: Icon, label, value, note, danger, gold }: { icon: typeof Users; label: string; value: string; note: string; danger?: boolean; gold?: boolean }) {
  const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="relative"><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B]">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label>;
}

function PartyTable({ records, onView }: { records: PartyRow[]; onView: (party: PartyRow) => void }) {
  if (records.length === 0) return <p className="p-6 text-sm font-bold text-[#789083]">No party rows found for this filter.</p>;
  return <><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1180px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Party name", "Party type", "Phone", "Total transactions", "Total amount", "Paid amount", "Balance", "Last transaction", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3.5">{h}</th>)}</tr></thead><tbody>{records.map((p) => <tr key={p.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{p.name}</td><td className="px-4 py-3"><PartyType value={p.type} /></td><td className="px-4 py-3">{p.phone}</td><td className="px-4 py-3">{p.transactions}</td><td className="px-4 py-3 font-black text-[#173324]">{money(p.totalAmount)}</td><td className="px-4 py-3 text-[#0F8C42]">{money(p.paidAmount)}</td><td className="px-4 py-3 font-black text-[#EF4444]">{money(p.balance)}</td><td className="px-4 py-3">{p.lastTransaction}</td><td className="px-4 py-3"><Status value={p.status} /></td><td className="px-4 py-3"><button onClick={() => onView(p)} className="rounded-lg border border-[#DDEAE0] p-2 text-[#60766B]" aria-label={`View ${p.name}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div><div className="grid gap-3 p-3 lg:hidden">{records.map((p) => <article key={p.id} className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex justify-between"><div><p className="text-xs font-black text-[#173324]">{p.name}</p><p className="mt-1 text-[10px] text-[#789083]">{p.phone} - {p.type}</p></div><Status value={p.status} /></div><div className="mt-3 grid grid-cols-3 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Total</b><strong>{money(p.totalAmount)}</strong></span><span><b className="block text-[#789083]">Paid</b><strong className="text-[#0F8C42]">{money(p.paidAmount)}</strong></span><span><b className="block text-[#789083]">Balance</b><strong className="text-[#EF4444]">{money(p.balance)}</strong></span></div><button onClick={() => onView(p)} className="mt-3 text-[10px] font-black text-[#16A34A]">View statement</button></article>)}</div></>;
}

function StatementPanel({ detail, onClose, onExport }: { detail: PartyDetail; onClose: () => void; onExport: () => void }) {
  return <div className="fixed inset-0 z-[70] flex justify-end bg-[#07120D]/65 p-4"><aside className="h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white"><div className="flex justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">{detail.name} statement</h3><p className="text-[10px] text-[#789083]">{detail.type} balance: {money(detail.balance)}</p></div><button onClick={onClose}><X size={16} /></button></div><div className="p-4"><button onClick={onExport} className="mb-4 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">Export statement CSV</button>{detail.rows.length === 0 ? <p className="text-sm font-bold text-[#789083]">No statement rows found.</p> : <div className="overflow-x-auto rounded-xl border border-[#DDEAE0]"><table className="w-full min-w-[720px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{Object.keys(detail.rows[0]).map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{detail.rows.map((row, index) => <tr key={index} className="border-t border-[#EEF3EF] text-xs text-[#60766B]">{Object.entries(row).map(([key, value]) => <td key={key} className="px-4 py-3">{typeof value === "number" && key.match(/Total|Paid|Balance/) ? money(value) : value}</td>)}</tr>)}</tbody></table></div>}</div></aside></div>;
}

function PartyType({ value }: { value: "Customer" | "Supplier" }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${value === "Customer" ? "bg-[#16A34A]/10 text-[#0F8C42]" : "bg-[#D4A017]/12 text-[#9A7108]"}`}>{value}</span>;
}

function Status({ value }: { value: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${value === "Clear" ? "bg-[#16A34A]/10 text-[#0F8C42]" : value === "Overdue" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#D4A017]/12 text-[#9A7108]"}`}>{value}</span>;
}
