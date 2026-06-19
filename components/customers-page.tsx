"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import type { Customer, CustomerStatus, CustomerType } from "@/lib/customer-mock-data";

type CustomerFormState = {
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  debtBalance: string;
  status: "active" | "inactive";
};

type CustomerDialogState =
  | { mode: "add"; customer?: undefined }
  | { mode: "edit"; customer: Customer };

const customerTypes: CustomerType[] = ["Walk-in", "Retail", "Wholesale", "Company", "Regular"];

const defaultForm: CustomerFormState = {
  name: "",
  phone: "",
  email: "",
  customerType: "Retail",
  debtBalance: "0",
  status: "active",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function CustomersPage({ initialCustomers = [] }: { initialCustomers?: Customer[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? "");
  const [dialog, setDialog] = useState<CustomerDialogState | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const selected = customers.find((customer) => customer.id === selectedId) ?? customers[0];
  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesStatus =
        status === "All statuses" ||
        (status === "Active" && customer.status !== "Inactive") ||
        customer.status === status;
      const matchesQuery = !normalized || `${customer.name} ${customer.phone}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [query, status, customers]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshCustomers() {
    const response = await fetch("/api/customers", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed to load customers.");
    setCustomers(payload.data);
    if (!payload.data.some((customer: Customer) => customer.id === selectedId)) setSelectedId(payload.data[0]?.id ?? "");
  }

  async function saveCustomer(values: CustomerFormState) {
    setError("");
    const debtBalance = Number(values.debtBalance || 0);
    if (!values.name.trim()) return setError("Customer name is required.");
    if (!values.phone.trim()) return setError("Phone number is required.");
    if (!Number.isFinite(debtBalance) || debtBalance < 0) return setError("Opening debt balance cannot be negative.");

    const isEdit = dialog?.mode === "edit";
    const url = isEdit ? `/api/customers/${dialog.customer.id}` : "/api/customers";
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, debtBalance }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save customer.");
      await refreshCustomers();
      setSelectedId(payload.data.id);
      setDialog(null);
      showFeedback(isEdit ? "Customer updated successfully." : "Customer added successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save customer.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateCustomer(customer: Customer) {
    if (!window.confirm(`Deactivate ${customer.name}? They will be hidden from the customer list.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to deactivate customer.");
      await refreshCustomers();
      showFeedback("Customer deactivated successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to deactivate customer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Relationship management</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Customers</h2>
          <p className="mt-1 text-sm text-[#789083]">Track customer activity, balances and purchase history.</p>
        </div>
        <button onClick={() => { setError(""); setDialog({ mode: "add" }); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
          <Plus size={16} /> Add customer
        </button>
      </div>

      {(feedback || error) && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>
          {error || feedback}
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
          <div className="flex flex-col gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search customers" placeholder="Search customer or phone..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" />
            </label>
            <label className="relative">
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter customers by status" className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] outline-none focus:border-[#16A34A] sm:min-w-40">
                <option>All statuses</option><option>Active</option><option>Clear</option><option>Owes</option><option>Overdue</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} />
            </label>
          </div>

          {loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Updating customers...</div>}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
                <th className="px-4 py-3.5">Customer</th><th className="px-3 py-3.5">Phone</th><th className="px-3 py-3.5">Email</th><th className="px-3 py-3.5">Type</th><th className="px-3 py-3.5">Total purchases</th><th className="px-3 py-3.5">Debt balance</th><th className="px-3 py-3.5">Last purchase</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th>
              </tr></thead>
              <tbody>{filteredCustomers.map((customer) => (
                <tr key={customer.id} onClick={() => setSelectedId(customer.id)} className={`cursor-pointer border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB] ${selectedId === customer.id ? "bg-[#16A34A]/[0.035]" : ""}`}>
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><CustomerAvatar customer={customer} /><div><p className="font-black text-[#173324]">{customer.name}</p><p className="mt-0.5 text-[10px] text-[#9AAEA3]">{customer.industries}</p></div></div></td>
                  <td className="px-3 py-3 font-semibold">{customer.phone}</td><td className="px-3 py-3">{customer.email ?? "-"}</td><td className="px-3 py-3"><TypeBadge type={customer.type} /></td><td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(customer.totalPurchases)}</td><td className="px-3 py-3 font-bold text-[#EF4444]">{formatCurrency(customer.debtBalance)}</td><td className="px-3 py-3">{customer.lastPurchase}</td><td className="px-3 py-3"><StatusBadge status={customer.status} /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={(event) => { event.stopPropagation(); setError(""); setDialog({ mode: "edit", customer }); }} aria-label={`Edit ${customer.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></button><button onClick={(event) => { event.stopPropagation(); deactivateCustomer(customer); }} aria-label={`Deactivate ${customer.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 lg:hidden">
            {filteredCustomers.map((customer) => (
              <article key={customer.id} className={`rounded-xl border p-3 text-left ${selectedId === customer.id ? "border-[#16A34A]/60 bg-[#16A34A]/[0.035]" : "border-[#E8F0EA]"}`}>
                <button onClick={() => setSelectedId(customer.id)} className="w-full text-left">
                  <div className="flex items-start gap-3"><CustomerAvatar customer={customer} /><div className="min-w-0 flex-1"><p className="text-xs font-black text-[#173324]">{customer.name}</p><p className="mt-1 truncate text-[10px] text-[#789083]">{customer.phone} - {customer.type}</p></div><StatusBadge status={customer.status} /></div>
                  <div className="mt-3 grid grid-cols-2 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Total purchases</b><strong className="mt-1 block text-[#173324]">{formatCurrency(customer.totalPurchases)}</strong></span><span><b className="block text-[#789083]">Debt balance</b><strong className="mt-1 block text-[#EF4444]">{formatCurrency(customer.debtBalance)}</strong></span></div>
                </button>
                <div className="mt-3 flex justify-end gap-2"><button onClick={() => { setError(""); setDialog({ mode: "edit", customer }); }} className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-[10px] font-black text-[#60766B]">Edit</button><button onClick={() => deactivateCustomer(customer)} className="rounded-lg bg-[#EF4444]/10 px-3 py-2 text-[10px] font-black text-[#EF4444]">Deactivate</button></div>
              </article>
            ))}
          </div>

          {filteredCustomers.length === 0 && <div className="grid min-h-56 place-items-center p-8 text-center"><div><Users className="mx-auto text-[#9AAEA3]" size={32} /><p className="mt-3 text-sm font-black text-[#173324]">{customers.length === 0 ? "No customers yet" : "No matching customers"}</p><p className="mt-1 text-xs text-[#789083]">{customers.length === 0 ? "Add your first customer or continue without one." : "Adjust the search or status filter."}</p></div></div>}
          <footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filteredCustomers.length}</b> of <b className="text-[#173324]">{customers.length}</b> customers</footer>
        </article>

        {selected ? <CustomerProfile customer={selected} onFeedback={showFeedback} /> : <EmptyProfile />}
      </section>

      {dialog && <CustomerDialog state={dialog} loading={loading} error={error} onClose={() => setDialog(null)} onSave={saveCustomer} />}
    </div>
  );
}

function formFromCustomer(customer?: Customer): CustomerFormState {
  if (!customer) return defaultForm;
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    customerType: customer.type,
    debtBalance: String(customer.debtBalance),
    status: customer.status === "Inactive" ? "inactive" : "active",
  };
}

function CustomerDialog({ state, loading, error, onClose, onSave }: { state: CustomerDialogState; loading: boolean; error: string; onClose: () => void; onSave: (values: CustomerFormState) => void }) {
  const [values, setValues] = useState<CustomerFormState>(() => formFromCustomer(state.customer));
  const title = state.mode === "add" ? "Add customer" : `Edit ${state.customer.name}`;

  function update<K extends keyof CustomerFormState>(field: K, value: CustomerFormState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(values);
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4">
      <article className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E8F0EA] p-4">
          <div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="mt-1 text-[11px] text-[#789083]">Customer details are saved to the business database.</p></div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]" aria-label="Close customer form"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-4">
          {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Customer name" required value={values.name} onChange={(value) => update("name", value)} />
            <Field label="Phone number" required value={values.phone} onChange={(value) => update("phone", value)} />
            <Field label="Email" value={values.email} onChange={(value) => update("email", value)} />
            <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Customer type</span><select value={values.customerType} onChange={(event) => update("customerType", event.target.value as CustomerType)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{customerTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <Field label="Opening debt balance" type="number" value={values.debtBalance} onChange={(value) => update("debtBalance", value)} />
            <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select value={values.status} onChange={(event) => update("status", event.target.value as "active" | "inactive")} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button><button disabled={loading} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save customer"}</button></div>
        </form>
      </article>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}

function CustomerAvatar({ customer }: { customer: Customer }) {
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#12311F] text-[10px] font-black text-[#F6FFF8]">{customer.initials}</span>;
}

function TypeBadge({ type }: { type: Customer["type"] }) {
  return <span className="rounded-full bg-[#D4A017]/12 px-2.5 py-1 text-[10px] font-black text-[#9A7108]">{type}</span>;
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const tone = status === "Clear" || status === "Active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Owes" ? "bg-[#D4A017]/12 text-[#9A7108]" : status === "Inactive" ? "bg-[#789083]/10 text-[#60766B]" : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>;
}

function CustomerProfile({ customer, onFeedback }: { customer: Customer; onFeedback: (message: string) => void }) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5 xl:sticky xl:top-[96px]">
      <div className="bg-[#12311F] p-5 text-white">
        <div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-sm font-black text-[#22C55E]">{customer.initials}</span><UserRound size={19} className="text-[#B8C7BD]" /></div>
        <h3 className="mt-4 text-lg font-black">{customer.name}</h3><p className="mt-1 text-[11px] text-[#B8C7BD]">{customer.industries}</p>
      </div>
      <div className="space-y-3 p-4 text-xs">
        <p className="flex items-center gap-2 text-[#60766B]"><Phone size={14} className="text-[#16A34A]" /> {customer.phone}</p><p className="flex items-center gap-2 text-[#60766B]"><Mail size={14} className="text-[#16A34A]" /> {customer.email ?? "No email added"}</p><p className="flex items-center gap-2 text-[#60766B]"><Building2 size={14} className="text-[#16A34A]" /> {customer.type} customer</p>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#E8F0EA]">
        <ProfileStat icon={ShoppingBag} label="Purchases" value={formatCurrency(customer.totalPurchases)} /><ProfileStat icon={WalletCards} label="Balance" value={formatCurrency(customer.debtBalance)} danger={customer.debtBalance > 0} />
      </div>
      <div className="space-y-2 p-4"><button onClick={() => onFeedback("Full profile placeholder. Detailed profile will be connected later.")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white hover:bg-[#12883E]">View full profile <ArrowUpRight size={14} /></button><button onClick={() => onFeedback("Customer statement placeholder. PDF export will be connected later.")} className="w-full rounded-xl border border-[#DDEAE0] py-3 text-xs font-black text-[#60766B]">Customer statement</button></div>
    </aside>
  );
}

function EmptyProfile() {
  return <aside className="grid min-h-72 place-items-center rounded-2xl border border-[#DDEAE0] bg-white p-6 text-center text-xs text-[#789083]">No customer selected.</aside>;
}

function ProfileStat({ icon: Icon, label, value, danger }: { icon: typeof Users; label: string; value: string; danger?: boolean }) {
  return <div className="bg-[#F8FBF8] p-3"><Icon size={14} className="text-[#16A34A]" /><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#789083]">{label}</p><p className={`mt-1 text-xs font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p></div>;
}
