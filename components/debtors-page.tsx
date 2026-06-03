"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronDown, CircleDollarSign, Download, FileText, HandCoins, History, MoreHorizontal, ReceiptText, Search, Users, X } from "lucide-react";
import { customers as mockCustomers, debtors as mockDebtors, type Customer, type Debtor } from "@/lib/customer-mock-data";

type PaymentFormState = {
  customerId: string;
  amount: string;
  paymentMethod: "Cash" | "M-Pesa" | "Bank";
  reference: string;
  note: string;
};

type PaymentHistory = {
  id: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: string;
  createdAt: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function DebtorsPage({ initialDebtors = mockDebtors, initialCustomers = mockCustomers }: { initialDebtors?: Debtor[]; initialCustomers?: Customer[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors.length > 0 ? initialDebtors : mockDebtors);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers.length > 0 ? initialCustomers : mockCustomers);
  const [paymentDebtor, setPaymentDebtor] = useState<Debtor | null>(null);
  const [historyDebtor, setHistoryDebtor] = useState<Debtor | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const filteredDebtors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return debtors.filter((debtor) => (status === "All statuses" || debtor.status === status) && (!normalized || `${debtor.customer} ${debtor.phone} ${debtor.invoice}`.toLowerCase().includes(normalized)));
  }, [query, status, debtors]);
  const totals = debtors.reduce((result, debtor) => ({ debt: result.debt + debtor.originalAmount, paid: result.paid + debtor.paidAmount, balance: result.balance + debtor.balanceDue, overdue: result.overdue + (debtor.daysOverdue > 0 ? debtor.balanceDue : 0) }), { debt: 0, paid: 0, balance: 0, overdue: 0 });

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshDebtors() {
    const [debtorsResponse, customersResponse] = await Promise.all([
      fetch("/api/debtors", { cache: "no-store" }),
      fetch("/api/customers", { cache: "no-store" }),
    ]);
    const debtorsPayload = await debtorsResponse.json();
    const customersPayload = await customersResponse.json();
    if (!debtorsResponse.ok) throw new Error(debtorsPayload.error ?? "Failed to refresh debtors.");
    if (!customersResponse.ok) throw new Error(customersPayload.error ?? "Failed to refresh customers.");
    setDebtors(debtorsPayload.data);
    setCustomers(customersPayload.data);
  }

  async function recordPayment(values: PaymentFormState, allowOverpay = false) {
    setError("");
    const amount = Number(values.amount);
    const selectedCustomer = customers.find((customer) => customer.id === values.customerId);
    if (!values.customerId) return setError("Customer is required.");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Amount must be greater than 0.");
    if (!values.paymentMethod) return setError("Payment method is required.");
    if (selectedCustomer && selectedCustomer.debtBalance <= 0 && !window.confirm("This customer has zero balance. Record payment anyway?")) return;
    if (selectedCustomer && amount > selectedCustomer.debtBalance && !allowOverpay) {
      if (!window.confirm("Payment amount exceeds the customer balance. Continue and clear the balance?")) return;
      return recordPayment(values, true);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, amount, allowOverpay }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to record payment.");
      await refreshDebtors();
      setPaymentDebtor(null);
      showFeedback("Payment recorded and customer balance updated.");
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  }

  async function openHistory(debtor: Debtor) {
    setHistoryDebtor(debtor);
    setLoadingHistory(true);
    setHistory([]);
    setError("");
    try {
      const response = await fetch(`/api/payments?customerId=${encodeURIComponent(debtor.customerId)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to load payment history.");
      setHistory(payload.data);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Failed to load payment history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Accounts receivable</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Due List / Debtors</h2><p className="mt-1 text-sm text-[#789083]">Monitor outstanding invoices and follow up customer balances.</p></div><div><div className="flex flex-wrap gap-2"><button onClick={() => showFeedback("Debtors PDF export placeholder. PDF export will be connected later.")} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><FileText size={15} /> Download PDF</button><button onClick={() => showFeedback("Debtors CSV export placeholder. CSV export will be connected later.")} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white"><Download size={15} /> Export CSV</button></div>{feedback && <p className="mt-2 text-right text-[11px] font-bold text-[#16A34A]">{feedback}</p>}</div></div>
      {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={HandCoins} label="Total debt issued" value={formatCurrency(totals.debt)} note={`${debtors.length} open invoices`} /><SummaryCard icon={CircleDollarSign} label="Paid amount" value={formatCurrency(totals.paid)} note="Collected against credit sales" /><SummaryCard icon={CalendarClock} label="Overdue amount" value={formatCurrency(totals.overdue)} note="Requires follow-up" danger /><SummaryCard icon={Users} label="Number of debtors" value={`${debtors.length} customers`} note={`Balance due ${formatCurrency(totals.balance)}`} />
      </section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="flex flex-col gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search debtors" placeholder="Search customer, phone or invoice..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></label><label className="relative"><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter debtor status" className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] outline-none focus:border-[#16A34A] sm:min-w-40"><option>All statuses</option><option>Overdue</option><option>Partial</option><option>Due soon</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label></div>
        {loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Updating debtor balances...</div>}
        <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1280px] border-collapse text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Customer</th><th className="px-3 py-3.5">Phone</th><th className="px-3 py-3.5">Invoice</th><th className="px-3 py-3.5">Original amount</th><th className="px-3 py-3.5">Paid amount</th><th className="px-3 py-3.5">Balance due</th><th className="px-3 py-3.5">Due date</th><th className="px-3 py-3.5">Days overdue</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody>{filteredDebtors.map((debtor) => <DebtorRow key={debtor.id} debtor={debtor} onPay={() => setPaymentDebtor(debtor)} onHistory={() => openHistory(debtor)} />)}</tbody></table></div>
        <div className="grid gap-3 p-3 lg:hidden">{filteredDebtors.map((debtor) => <DebtorCard key={debtor.id} debtor={debtor} onPay={() => setPaymentDebtor(debtor)} onHistory={() => openHistory(debtor)} />)}</div>
        {filteredDebtors.length === 0 && <div className="grid min-h-56 place-items-center p-8 text-center"><div><Users className="mx-auto text-[#9AAEA3]" size={32} /><p className="mt-3 text-sm font-black text-[#173324]">No matching debtors</p><p className="mt-1 text-xs text-[#789083]">Adjust the search or status filter.</p></div></div>}
        <footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filteredDebtors.length}</b> of <b className="text-[#173324]">{debtors.length}</b> outstanding invoices</footer>
      </section>
      {paymentDebtor && <PaymentModal debtor={paymentDebtor} customers={customers} loading={loading} error={error} onClose={() => setPaymentDebtor(null)} onSave={recordPayment} />}
      {historyDebtor && <HistoryPanel debtor={historyDebtor} history={history} loading={loadingHistory} onClose={() => setHistoryDebtor(null)} onFeedback={showFeedback} />}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, note, danger }: { icon: typeof Users; label: string; value: string; note: string; danger?: boolean }) { return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${danger ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black tracking-tight ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
function DebtorRow({ debtor, onPay, onHistory }: { debtor: Debtor; onPay: () => void; onHistory: () => void }) { return <tr className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]"><td className="px-4 py-3 font-black text-[#173324]">{debtor.customer}</td><td className="px-3 py-3">{debtor.phone}</td><td className="px-3 py-3 font-bold">{debtor.invoice}</td><td className="px-3 py-3">{formatCurrency(debtor.originalAmount)}</td><td className="px-3 py-3 text-[#0F8C42]">{formatCurrency(debtor.paidAmount)}</td><td className="px-3 py-3 font-black text-[#EF4444]">{formatCurrency(debtor.balanceDue)}</td><td className="px-3 py-3">{debtor.dueDate}</td><td className="px-3 py-3"><OverdueDays days={debtor.daysOverdue} /></td><td className="px-3 py-3"><DebtStatus status={debtor.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={onPay} className="rounded-lg bg-[#16A34A] px-2.5 py-2 text-[10px] font-black text-white hover:bg-[#12883E]">Record payment</button><button onClick={onHistory} aria-label={`View payment history for ${debtor.customer}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><History size={15} /></button><button aria-label={`More debtor actions for ${debtor.customer}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><MoreHorizontal size={15} /></button></div></td></tr>; }
function DebtorCard({ debtor, onPay, onHistory }: { debtor: Debtor; onPay: () => void; onHistory: () => void }) { return <article className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-black text-[#173324]">{debtor.customer}</p><p className="mt-1 text-[10px] text-[#789083]">{debtor.invoice} - {debtor.phone}</p></div><DebtStatus status={debtor.status} /></div><div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Original</b><strong className="mt-1 block text-[#173324]">{formatCurrency(debtor.originalAmount)}</strong></span><span><b className="block text-[#789083]">Paid</b><strong className="mt-1 block text-[#0F8C42]">{formatCurrency(debtor.paidAmount)}</strong></span><span><b className="block text-[#789083]">Due</b><strong className="mt-1 block text-[#EF4444]">{formatCurrency(debtor.balanceDue)}</strong></span></div><div className="mt-3 flex items-center justify-between gap-2"><p className="text-[10px] text-[#789083]">Due {debtor.dueDate} - <OverdueDays days={debtor.daysOverdue} /></p><div className="flex gap-1"><button onClick={onHistory} aria-label={`View payment history for ${debtor.customer}`} className="grid h-8 w-8 place-items-center rounded-lg border border-[#DDEAE0] text-[#789083]"><History size={14} /></button><button onClick={onPay} className="rounded-lg bg-[#16A34A] px-2.5 py-2 text-[10px] font-black text-white">Record payment</button></div></div></article>; }
function DebtStatus({ status }: { status: Debtor["status"] }) { const tone = status === "Overdue" ? "bg-[#EF4444]/10 text-[#EF4444]" : status === "Partial" ? "bg-[#D4A017]/12 text-[#9A7108]" : "bg-[#16A34A]/10 text-[#0F8C42]"; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>; }
function OverdueDays({ days }: { days: number }) { return <span className={days > 0 ? "font-black text-[#EF4444]" : "text-[#789083]"}>{days > 0 ? `${days} days` : days === 0 ? "Due today" : `${Math.abs(days)} days left`}</span>; }

function PaymentModal({ debtor, customers, loading, error, onClose, onSave }: { debtor: Debtor; customers: Customer[]; loading: boolean; error: string; onClose: () => void; onSave: (values: PaymentFormState) => void }) {
  const [values, setValues] = useState<PaymentFormState>({ customerId: debtor.customerId, amount: "", paymentMethod: "M-Pesa", reference: "", note: "" });
  const selectedCustomer = customers.find((customer) => customer.id === values.customerId);
  const balance = selectedCustomer?.debtBalance ?? debtor.balanceDue;

  function update<K extends keyof PaymentFormState>(field: K, value: PaymentFormState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return <Modal title="Record payment" subtitle={`${debtor.customer} - ${debtor.invoice}`} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave(values); }}>{error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}<div className="rounded-xl bg-[#F8FBF8] p-3 text-xs"><p className="flex justify-between text-[#789083]"><span>Current balance</span><b className="text-[#EF4444]">{formatCurrency(balance)}</b></p></div><label className="mt-4 block"><span className="text-[11px] font-black uppercase tracking-wider text-[#789083]">Customer</span><select value={values.customerId} onChange={(event) => update("customerId", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{customers.filter((customer) => customer.debtBalance > 0 || customer.id === values.customerId).map((customer) => <option key={customer.id} value={customer.id}>{customer.name} - {formatCurrency(customer.debtBalance)}</option>)}</select></label><Field label="Amount paid" required type="number" value={values.amount} onChange={(value) => update("amount", value)} /><label className="mt-3 block"><span className="text-[11px] font-black uppercase tracking-wider text-[#789083]">Payment method</span><select value={values.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value as PaymentFormState["paymentMethod"])} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Cash</option><option>M-Pesa</option><option>Bank</option></select></label><Field label="Reference" value={values.reference} onChange={(value) => update("reference", value)} /><label className="mt-3 block"><span className="text-[11px] font-black uppercase tracking-wider text-[#789083]">Payment note</span><textarea value={values.note} onChange={(event) => update("note", event.target.value)} className="mt-2 min-h-20 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" placeholder="Optional note..." /></label><button disabled={loading} className="mt-4 w-full rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save payment"}</button></form></Modal>;
}

function HistoryPanel({ debtor, history, loading, onClose, onFeedback }: { debtor: Debtor; history: PaymentHistory[]; loading: boolean; onClose: () => void; onFeedback: (message: string) => void }) {
  return <Modal title="Payment history" subtitle={`${debtor.customer} - ${debtor.invoice}`} onClose={onClose}>{loading && <p className="rounded-xl bg-[#FFF9E8] p-3 text-xs font-bold text-[#8A670C]">Loading payment history...</p>} {!loading && history.length === 0 && <p className="rounded-xl bg-[#F8FBF8] p-3 text-xs text-[#789083]">No database payment history found yet for this customer.</p>} <div className="mt-3 space-y-2">{history.map((payment) => <HistoryItem key={payment.id} label={`${payment.paymentMethod} payment`} amount={payment.amount} date={formatDateTime(payment.createdAt)} reference={payment.reference} />)}</div><button onClick={() => onFeedback("Customer statement placeholder. PDF export will be connected later.")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDEAE0] py-3 text-xs font-black text-[#60766B]"><Download size={14} /> Download customer statement</button></Modal>;
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="mt-3 block"><span className="text-[11px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}

function HistoryItem({ label, amount, date, reference }: { label: string; amount: number; date: string; reference: string }) { return <div className="flex items-center gap-3 rounded-xl border border-[#E8F0EA] p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]"><ReceiptText size={15} /></span><div className="flex-1"><p className="text-xs font-black text-[#173324]">{label}</p><p className="mt-0.5 text-[10px] text-[#789083]">{date}{reference ? ` - ${reference}` : ""}</p></div><b className="text-xs text-[#173324]">{formatCurrency(amount)}</b></div>; }
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="mt-0.5 text-[10px] text-[#789083]">{subtitle}</p></div><button onClick={onClose} aria-label="Close dialog" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><X size={16} /></button></div><div className="p-4">{children}</div></article></div>; }
