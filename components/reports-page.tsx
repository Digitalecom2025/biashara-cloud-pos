"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, ChartNoAxesCombined, ChevronDown, CircleDollarSign, FileSpreadsheet, FileText, HandCoins, MoreHorizontal, ReceiptText, Search, TrendingUp, WalletCards } from "lucide-react";
import { exportToCsv, type ExportRow } from "@/lib/export";
import { reportCategories } from "@/lib/report-mock-data";
import type { ReportSummary, ReportTable } from "@/lib/report-data";

type ReportOption = {
  title: string;
  endpoint: string;
  filename: string;
};

const reportOptions: ReportOption[] = [
  { title: "Sales Report", endpoint: "/api/reports/sales", filename: "biashara-sales-report" },
  { title: "Product Sales Report", endpoint: "/api/reports/products", filename: "biashara-product-sales-report" },
  { title: "Stock Report", endpoint: "/api/reports/stock", filename: "biashara-stock-report" },
  { title: "Low Stock Report", endpoint: "/api/reports/stock", filename: "biashara-low-stock-report" },
  { title: "Purchase Report", endpoint: "/api/reports/purchases", filename: "biashara-purchase-report" },
  { title: "Expense Report", endpoint: "/api/reports/expenses", filename: "biashara-expense-report" },
  { title: "Payment Method Report", endpoint: "/api/reports/payments", filename: "biashara-payment-method-report" },
  { title: "Cashier Report", endpoint: "/api/reports/cashiers", filename: "biashara-cashier-report" },
  { title: "Branch Report", endpoint: "/api/reports/branches", filename: "biashara-branch-report" },
  { title: "Profit Estimate Report", endpoint: "/api/reports/products", filename: "biashara-profit-estimate-report" },
  { title: "Tax Report", endpoint: "/api/reports/sales", filename: "biashara-tax-report" },
  { title: "Audit Report", endpoint: "/api/reports/sales", filename: "biashara-audit-report" },
];

const emptySummary: ReportSummary = {
  todaySales: 0,
  monthlySales: 0,
  grossProfitEstimate: 0,
  stockValue: 0,
  totalExpenses: 0,
  totalDebtors: 0,
  totalPurchases: 0,
  cashTotal: 0,
  mpesaTotal: 0,
  bankTotal: 0,
  cardTotal: 0,
};

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function ReportsPage() {
  const [date, setDate] = useState("This month");
  const [branch, setBranch] = useState("All branches");
  const [user, setUser] = useState("All users");
  const [reportType, setReportType] = useState("Sales Report");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [table, setTable] = useState<ReportTable>({ columns: [], rows: [] });

  const selectedReport = reportOptions.find((option) => option.title === reportType) ?? reportOptions[0];

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/reports/summary");
      if (!response.ok) throw new Error("Failed to load report summary.");
      const json = (await response.json()) as { data: ReportSummary };
      setSummary(json.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Report summary could not be loaded.");
    }
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(selectedReport.endpoint);
      if (!response.ok) throw new Error("Failed to load report preview.");
      const json = (await response.json()) as { data: ReportTable };
      const rows = reportType === "Low Stock Report" ? json.data.rows.filter((row) => row.Status !== "Healthy") : json.data.rows;
      setTable({ ...json.data, rows });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Report preview could not be loaded.");
      setTable({ columns: [], rows: [] });
    } finally {
      setLoading(false);
    }
  }, [reportType, selectedReport.endpoint]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSummary();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSummary]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReport]);

  const filteredRows = useMemo(() => {
    const n = query.trim().toLowerCase();
    return table.rows.filter((row) => {
      const branchMatch = branch === "All branches" || row.Branch === branch;
      const userMatch = user === "All users" || row.Cashier === user || row["Recorded by"] === user;
      const queryMatch = !n || Object.values(row).join(" ").toLowerCase().includes(n);
      return branchMatch && userMatch && queryMatch;
    });
  }, [branch, query, table.rows, user]);

  const branchOptions = useMemo(() => ["All branches", ...Array.from(new Set(table.rows.map((row) => String(row.Branch ?? "")).filter(Boolean)))], [table.rows]);
  const userOptions = useMemo(() => ["All users", ...Array.from(new Set(table.rows.map((row) => String(row.Cashier ?? row["Recorded by"] ?? "")).filter(Boolean)))], [table.rows]);

  function pdfPlaceholder() {
    setFeedback("PDF export coming soon.");
    window.setTimeout(() => setFeedback(""), 2500);
  }

  function downloadCsv() {
    const ok = exportToCsv(selectedReport.filename, filteredRows as ExportRow[]);
    setFeedback(ok ? "CSV exported." : "No rows to export.");
    window.setTimeout(() => setFeedback(""), 2500);
  }

  return (
    <div className="mx-auto max-w-[1750px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Business intelligence</p>
          <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Reports</h2>
          <p className="mt-1 text-sm text-[#789083]">Generate operational reports across sales, stock, finance and branches.</p>
          {error && <p className="mt-2 text-xs font-bold text-[#EF4444]">{error}</p>}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <button onClick={pdfPlaceholder} className="flex items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-3 text-xs font-black text-[#60766B]"><FileText size={15} />Download PDF</button>
            <button onClick={downloadCsv} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-3.5 py-3 text-xs font-black text-white"><FileSpreadsheet size={15} />Export CSV</button>
          </div>
          {feedback && <p className="mt-2 text-right text-[11px] font-bold text-[#16A34A]">{feedback}</p>}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={CircleDollarSign} label="Today sales" value={money(summary.todaySales)} note="From Sale records today" />
        <Summary icon={TrendingUp} label="Monthly sales" value={money(summary.monthlySales)} note="Current month Sale total" />
        <Summary icon={ChartNoAxesCombined} label="Gross profit estimate" value={money(summary.grossProfitEstimate)} note="Sales minus estimated product cost" gold />
        <Summary icon={Boxes} label="Stock value" value={money(summary.stockValue)} note="Product stock at purchase price" />
        <Summary icon={WalletCards} label="Total expenses" value={money(summary.totalExpenses)} note="Active expense records" danger />
        <Summary icon={HandCoins} label="Total debtors" value={money(summary.totalDebtors)} note="Customer debt balances" danger />
        <Summary icon={ReceiptText} label="Total purchases" value={money(summary.totalPurchases)} note="Purchase record totals" gold />
        <Summary icon={WalletCards} label="Payment totals" value={money(summary.cashTotal + summary.mpesaTotal + summary.bankTotal + summary.cardTotal)} note={`Cash ${money(summary.cashTotal)} | M-Pesa ${money(summary.mpesaTotal)}`} />
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between">
          <div><h3 className="font-black text-[#173324]">Report categories</h3><p className="text-xs text-[#789083]">Choose a report template to generate a database preview.</p></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reportCategories.map((item) => (
            <button key={item.title} onClick={() => setReportType(item.title)} className={`rounded-xl border bg-white p-4 text-left hover:border-[#16A34A]/50 ${reportType === item.title ? "border-[#16A34A] shadow-sm shadow-[#16A34A]/10" : "border-[#DDEAE0]"}`}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]"><ReceiptText size={16} /></span>
              <h4 className="mt-3 text-xs font-black text-[#173324]">{item.title}</h4>
              <p className="mt-1 text-[11px] leading-5 text-[#789083]">{item.description}</p>
              <span className="mt-3 block text-[10px] font-black text-[#16A34A]">Generate report</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
        <div className="grid gap-3 border-b border-[#E8F0EA] p-4 xl:grid-cols-[minmax(0,1fr)_190px_160px_190px_180px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search report previews" placeholder="Search report preview..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none" /></label>
          <Select label="Report type" value={reportType} onChange={setReportType} options={reportOptions.map((option) => option.title)} />
          <Select label="Date filter" value={date} onChange={setDate} options={["Today", "This week", "This month", "Custom range"]} />
          <Select label="Branch filter" value={branch} onChange={setBranch} options={branchOptions} />
          <Select label="Cashier filter" value={user} onChange={setUser} options={userOptions} />
        </div>
        {loading ? <p className="p-6 text-sm font-bold text-[#789083]">Loading report preview...</p> : <PreviewTable columns={table.columns} records={filteredRows} />}
      </section>
    </div>
  );
}

function Summary({ icon: Icon, label, value, note, danger, gold }: { icon: typeof Boxes; label: string; value: string; note: string; danger?: boolean; gold?: boolean }) {
  const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="relative"><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B]">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label>;
}

function PreviewTable({ columns, records }: { columns: string[]; records: Record<string, string | number>[] }) {
  if (records.length === 0) return <p className="p-6 text-sm font-bold text-[#789083]">No report rows found for this selection.</p>;
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{columns.map((header) => <th key={header} className="px-4 py-3.5">{header}</th>)}<th className="px-4 py-3.5">Actions</th></tr></thead>
          <tbody>{records.map((row, index) => <tr key={`${row[columns[0]]}-${index}`} className="border-t border-[#EEF3EF] text-xs text-[#60766B]">{columns.map((column) => <td key={column} className="px-4 py-3">{typeof row[column] === "number" && column.toLowerCase().match(/total|paid|due|cost|profit|value|expense|balance|collected/) ? money(Number(row[column])) : row[column]}</td>)}<td className="px-4 py-3"><MoreHorizontal size={16} /></td></tr>)}</tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">{records.map((row, index) => <article key={`${row[columns[0]]}-${index}`} className="rounded-xl border border-[#E8F0EA] p-3"><p className="text-xs font-black text-[#173324]">{row[columns[0]]}</p><div className="mt-3 grid gap-1 text-[10px] text-[#60766B]">{columns.slice(1, 5).map((column) => <p key={column}><b className="text-[#789083]">{column}:</b> {String(row[column] ?? "")}</p>)}</div></article>)}</div>
    </>
  );
}
