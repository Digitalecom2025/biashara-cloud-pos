"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowDownLeft, Banknote, ChevronDown, CircleDollarSign, FileSpreadsheet, FileText, Landmark, Pencil, Plus, Search, Smartphone, Trash2, TrendingUp, WalletCards, X } from "lucide-react";
import type { ExpenseRecord, LedgerRecord, TillSummary } from "@/lib/finance-mock-data";
import type { FinanceData, FinanceSummary } from "@/lib/finance-data";
import { exportReportToPdf, exportToCsv, type ExportRow } from "@/lib/export";

type Tab = "tills" | "mpesa" | "bank" | "expenses" | "income";
type BranchOption = { id: string; name: string };
type ExpenseForm = {
  category: string;
  description: string;
  amount: string;
  paymentMethod: string;
  branchId: string;
  recordedBy: string;
  date: string;
  status: string;
};

const emptySummary: FinanceSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  cashBalance: 0,
  mpesaBalance: 0,
  bankBalance: 0,
  creditDebtTotal: 0,
  profitEstimate: 0,
};

const categories = ["Stock Purchase", "Rent", "Staff Wages", "Transport", "Packaging", "Electricity", "Marketing", "Repairs", "Other"];
const methods = ["Cash", "M-Pesa", "Bank", "Card"];
const statuses = ["Approved", "Pending", "Rejected"];

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function dateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formFromExpense(expense?: ExpenseRecord): ExpenseForm {
  return {
    category: expense?.category ?? "Stock Purchase",
    description: expense?.description ?? "",
    amount: expense ? String(expense.amount) : "",
    paymentMethod: expense?.paymentMethod ?? "Cash",
    branchId: expense?.branchId ?? "",
    recordedBy: expense?.recordedBy ?? "Owner",
    date: dateInputValue(),
    status: expense?.status ?? "Approved",
  };
}

export function FinancePage() {
  const [tab, setTab] = useState<Tab>("tills");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<FinanceSummary>(emptySummary);
  const [tillRows, setTillRows] = useState<TillSummary[]>([]);
  const [mpesaRows, setMpesaRows] = useState<LedgerRecord[]>([]);
  const [bankRows, setBankRows] = useState<LedgerRecord[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseRecord[]>([]);
  const [incomeRows, setIncomeRows] = useState<LedgerRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [editing, setEditing] = useState<ExpenseRecord | "add" | null>(null);
  const [form, setForm] = useState<ExpenseForm>(formFromExpense());

  const loadFinance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [financeResponse, branchResponse] = await Promise.all([fetch("/api/finance/summary"), fetch("/api/branches")]);
      if (!financeResponse.ok) throw new Error("Failed to load finance records.");
      const financeJson = (await financeResponse.json()) as { data: FinanceData };
      setSummary(financeJson.data.summary);
      setTillRows(financeJson.data.tillSummaries);
      setMpesaRows(financeJson.data.mpesaRecords);
      setBankRows(financeJson.data.bankRecords);
      setExpenseRows(financeJson.data.expenses);
      setIncomeRows(financeJson.data.incomeRecords);

      if (branchResponse.ok) {
        const branchJson = (await branchResponse.json()) as { data: BranchOption[] };
        setBranches(branchJson.data.map((branch) => ({ id: branch.id, name: branch.name })));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Finance data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFinance();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadFinance]);

  function openForm(expense?: ExpenseRecord) {
    setEditing(expense ?? "add");
    setForm(formFromExpense(expense));
    setError("");
  }

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const endpoint = editing && editing !== "add" ? `/api/expenses/${editing.id}` : "/api/expenses";
      const response = await fetch(endpoint, {
        method: editing && editing !== "add" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount), branchId: form.branchId || null }),
      });
      const json = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Expense could not be saved.");
      setFeedback(json.message ?? "Expense saved.");
      setEditing(null);
      await loadFinance();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Expense could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelExpense(expense: ExpenseRecord) {
    if (!window.confirm(`Cancel ${expense.category} expense ${expense.id}?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
      const json = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Expense could not be cancelled.");
      setFeedback(json.message ?? "Expense cancelled.");
      await loadFinance();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Expense could not be cancelled.");
    } finally {
      setSaving(false);
    }
  }

  function currentExportRows(): ExportRow[] {
    if (tab === "tills") {
      return tillRows.map((row) => ({
        till: row.till,
        branch: row.branch,
        cashier: row.cashier,
        openingFloat: row.openingFloat,
        cashSales: row.cashSales,
        cashExpenses: row.cashExpenses,
        expectedCash: row.expectedCash,
        status: row.status,
      }));
    }
    if (tab === "expenses") {
      return expenseRows.map((row) => ({
        id: row.id,
        category: row.category,
        description: row.description,
        amount: row.amount,
        paymentMethod: row.paymentMethod,
        branch: row.branch,
        recordedBy: row.recordedBy,
        date: row.date,
        status: row.status,
      }));
    }
    const rows = tab === "mpesa" ? mpesaRows : tab === "bank" ? bankRows : incomeRows;
    return rows.map((row) => ({
      id: row.id,
      reference: row.reference,
      description: row.description,
      amount: row.amount,
      branch: row.branch,
      recordedBy: row.recordedBy,
      date: row.date,
      status: row.status,
    }));
  }

  const exportFinanceCsv = () => {
    const ok = exportToCsv(`leadsstacks-finance-${tab}.csv`, currentExportRows());
    setFeedback(ok ? "Finance CSV exported." : "No finance rows to export.");
    window.setTimeout(() => setFeedback(""), 2500);
  };

  const exportFinancePdf = () => {
    const rows = currentExportRows();
    if (rows.length === 0) {
      setFeedback("No finance rows to export.");
      window.setTimeout(() => setFeedback(""), 2500);
      return;
    }
    exportReportToPdf({
      filename: `leadsstacks-finance-${tab}.pdf`,
      title: `Finance ${tab} report`,
      summary: {
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        profitEstimate: summary.profitEstimate,
      },
      rows,
    });
    setFeedback("Finance PDF exported.");
    window.setTimeout(() => setFeedback(""), 2500);
  };

  return (
    <div className="mx-auto max-w-[1750px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Business ledger</p>
          <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Finance & Accounts</h2>
          <p className="mt-1 text-sm text-[#789083]">Track tills, collections, bank activity, expenses and income records.</p>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportFinancePdf} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B]"><FileText size={15} />Download PDF</button>
            <button onClick={exportFinanceCsv} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B]"><FileSpreadsheet size={15} />Export CSV</button>
            <button onClick={() => openForm()} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white"><Plus size={15} />Add Expense</button>
          </div>
          {(feedback || error) && <p className={`mt-2 text-right text-[11px] font-bold ${error ? "text-[#EF4444]" : "text-[#16A34A]"}`}>{error || feedback}</p>}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Summary icon={CircleDollarSign} label="Total income" value={money(summary.totalIncome)} note="Sales records" />
        <Summary icon={ArrowDownLeft} label="Total expenses" value={money(summary.totalExpenses)} note="Approved business costs" danger />
        <Summary icon={Banknote} label="Cash balance" value={money(summary.cashBalance)} note="Cash payments less cash expenses" />
        <Summary icon={Smartphone} label="M-Pesa balance" value={money(summary.mpesaBalance)} note="Completed mobile payments" />
        <Summary icon={Landmark} label="Bank balance" value={money(summary.bankBalance)} note="Recorded bank payments" />
        <Summary icon={TrendingUp} label="Profit estimate" value={money(summary.profitEstimate)} note={`Credit due: ${money(summary.creditDebtTotal)}`} gold />
      </section>

      <div className="table-scroll mt-5 flex gap-1 overflow-x-auto rounded-xl border border-[#DDEAE0] bg-white p-1">
        {([["tills", "Cash drawer / tills"], ["mpesa", "M-Pesa records"], ["bank", "Bank records"], ["expenses", "Expense records"], ["income", "Income records"]] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-black ${tab === id ? "bg-[#12311F] text-white" : "text-[#60766B]"}`}>{label}</button>
        ))}
      </div>

      <section className="mt-3 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-3 border-b border-[#E8F0EA] p-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search finance records" placeholder="Search reference, branch or description..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none" />
          </label>
          <label className="relative">
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter finance status" className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B]">
              <option>All statuses</option><option>Completed</option><option>Pending</option><option>Failed</option><option>Approved</option><option>Rejected</option><option>Open</option><option>Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} />
          </label>
        </div>
        {loading ? <p className="p-6 text-sm font-bold text-[#789083]">Loading finance records...</p> : <FinanceTable tab={tab} query={query} status={status} rows={{ tills: tillRows, mpesa: mpesaRows, bank: bankRows, expenses: expenseRows, income: incomeRows }} onEdit={openForm} onCancel={cancelExpense} />}
      </section>

      {editing && (
        <ExpenseDialog
          title={editing === "add" ? "Add expense" : `Edit expense ${editing.id}`}
          form={form}
          branches={branches}
          saving={saving}
          onChange={(next) => setForm((current) => ({ ...current, ...next }))}
          onSubmit={submitExpense}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Summary({ icon: Icon, label, value, note, danger, gold }: { icon: typeof WalletCards; label: string; value: string; note: string; danger?: boolean; gold?: boolean }) {
  const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>;
}

function FinanceTable({ tab, query, status, rows, onEdit, onCancel }: { tab: Tab; query: string; status: string; rows: { tills: TillSummary[]; mpesa: LedgerRecord[]; bank: LedgerRecord[]; expenses: ExpenseRecord[]; income: LedgerRecord[] }; onEdit: (expense: ExpenseRecord) => void; onCancel: (expense: ExpenseRecord) => void }) {
  const n = query.trim().toLowerCase();
  const filterStatus = <T extends { status: string }>(record: T) => status === "All statuses" || record.status === status;
  const empty = <p className="p-6 text-sm font-bold text-[#789083]">No records found for this filter.</p>;

  if (tab === "tills") {
    const records = rows.tills.filter((record) => filterStatus(record) && (!n || `${record.till} ${record.branch} ${record.cashier}`.toLowerCase().includes(n)));
    return records.length ? <Tills records={records} /> : empty;
  }
  if (tab === "expenses") {
    const records = rows.expenses.filter((record) => filterStatus(record) && (!n || `${record.id} ${record.category} ${record.description} ${record.branch}`.toLowerCase().includes(n)));
    return records.length ? <Expenses records={records} onEdit={onEdit} onCancel={onCancel} /> : empty;
  }
  const ledgerRows = tab === "mpesa" ? rows.mpesa : tab === "bank" ? rows.bank : rows.income;
  const records = ledgerRows.filter((record) => filterStatus(record) && (!n || `${record.id} ${record.reference} ${record.description} ${record.branch}`.toLowerCase().includes(n)));
  return records.length ? <Ledger records={records} /> : empty;
}

function Tills({ records }: { records: TillSummary[] }) {
  return <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Till", "Branch", "Cashier", "Opening float", "Cash sales", "Cash expenses", "Expected cash", "Status"].map((h) => <th key={h} className="px-4 py-3.5">{h}</th>)}</tr></thead><tbody>{records.map((r) => <tr key={r.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{r.till}</td><td className="px-4 py-3">{r.branch}</td><td className="px-4 py-3">{r.cashier}</td><td className="px-4 py-3">{money(r.openingFloat)}</td><td className="px-4 py-3 text-[#0F8C42]">{money(r.cashSales)}</td><td className="px-4 py-3 text-[#EF4444]">{money(r.cashExpenses)}</td><td className="px-4 py-3 font-black text-[#173324]">{money(r.expectedCash)}</td><td className="px-4 py-3"><Badge value={r.status} /></td></tr>)}</tbody></table></div><MobileCards records={records.map((r) => ({ title: r.till, subtitle: `${r.branch} - ${r.cashier}`, amount: money(r.expectedCash), status: r.status }))} /></>;
}

function Ledger({ records }: { records: LedgerRecord[] }) {
  return <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Record ID", "Reference", "Description", "Amount", "Branch", "Recorded by", "Date", "Status"].map((h) => <th key={h} className="px-4 py-3.5">{h}</th>)}</tr></thead><tbody>{records.map((r) => <tr key={r.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{r.id}</td><td className="px-4 py-3">{r.reference}</td><td className="px-4 py-3">{r.description}</td><td className="px-4 py-3 font-black text-[#173324]">{money(r.amount)}</td><td className="px-4 py-3">{r.branch}</td><td className="px-4 py-3">{r.recordedBy}</td><td className="px-4 py-3">{r.date}</td><td className="px-4 py-3"><Badge value={r.status} /></td></tr>)}</tbody></table></div><MobileCards records={records.map((r) => ({ title: `${r.id} - ${r.reference}`, subtitle: r.description, amount: money(r.amount), status: r.status }))} /></>;
}

function Expenses({ records, onEdit, onCancel }: { records: ExpenseRecord[]; onEdit: (expense: ExpenseRecord) => void; onCancel: (expense: ExpenseRecord) => void }) {
  return <><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1180px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Expense ID", "Category", "Description", "Amount", "Payment method", "Branch", "Recorded by", "Date", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3.5">{h}</th>)}</tr></thead><tbody>{records.map((r) => <tr key={r.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{r.id}</td><td className="px-4 py-3">{r.category}</td><td className="px-4 py-3">{r.description}</td><td className="px-4 py-3 font-black text-[#EF4444]">{money(r.amount)}</td><td className="px-4 py-3">{r.paymentMethod}</td><td className="px-4 py-3">{r.branch}</td><td className="px-4 py-3">{r.recordedBy}</td><td className="px-4 py-3">{r.date}</td><td className="px-4 py-3"><Badge value={r.status} /></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => onEdit(r)} aria-label={`Edit ${r.id}`} className="rounded-lg border border-[#DDEAE0] p-2 text-[#60766B]"><Pencil size={14} /></button><button onClick={() => onCancel(r)} aria-label={`Cancel ${r.id}`} className="rounded-lg border border-[#EF4444]/20 p-2 text-[#EF4444]"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div><MobileCards records={records.map((r) => ({ title: `${r.id} - ${r.category}`, subtitle: r.description, amount: money(r.amount), status: r.status }))} /></>;
}

function MobileCards({ records }: { records: { title: string; subtitle: string; amount: string; status: string }[] }) {
  return <div className="grid gap-3 p-3 md:hidden">{records.map((r) => <article key={r.title} className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex justify-between gap-2"><div><p className="text-xs font-black text-[#173324]">{r.title}</p><p className="mt-1 text-[10px] text-[#789083]">{r.subtitle}</p></div><Badge value={r.status} /></div><p className="mt-3 text-sm font-black text-[#173324]">{r.amount}</p></article>)}</div>;
}

function Badge({ value }: { value: string }) {
  const danger = ["Failed", "Rejected", "Cancelled"].includes(value);
  const pending = ["Pending", "Open"].includes(value);
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${danger ? "bg-[#EF4444]/10 text-[#EF4444]" : pending ? "bg-[#D4A017]/12 text-[#9A7108]" : "bg-[#16A34A]/10 text-[#0F8C42]"}`}>{value}</span>;
}

function ExpenseDialog({ title, form, branches, saving, onChange, onSubmit, onClose }: { title: string; form: ExpenseForm; branches: BranchOption[]; saving: boolean; onChange: (value: Partial<ExpenseForm>) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
        <div className="flex justify-between border-b border-[#E8F0EA] p-4">
          <div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="text-[10px] text-[#789083]">Saved to the Finance & Accounts ledger.</p></div>
          <button type="button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Select label="Expense category" value={form.category} onChange={(value) => onChange({ category: value })} options={categories} />
          <Field label="Description" value={form.description} onChange={(value) => onChange({ description: value })} required />
          <Field label="Amount" type="number" value={form.amount} onChange={(value) => onChange({ amount: value })} required />
          <Select label="Payment method" value={form.paymentMethod} onChange={(value) => onChange({ paymentMethod: value })} options={methods} />
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Branch</span><select value={form.branchId} onChange={(event) => onChange({ branchId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none"><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
          <Field label="Recorded by" value={form.recordedBy} onChange={(value) => onChange({ recordedBy: value })} />
          <Field label="Date" type="datetime-local" value={form.date} onChange={(value) => onChange({ date: value })} required />
          <Select label="Status" value={form.status} onChange={(value) => onChange({ status: value })} options={statuses} />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E8F0EA] p-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save expense"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
