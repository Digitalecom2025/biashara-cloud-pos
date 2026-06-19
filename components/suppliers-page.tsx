"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Building2, ChevronDown, Mail, Pencil, Phone, Plus, ShoppingBag, Trash2, Truck, Users, WalletCards, X } from "lucide-react";
import type { Supplier, SupplierStatus } from "@/lib/purchasing-mock-data";

type SupplierFormState = {
  name: string;
  phone: string;
  email: string;
  category: string;
  balance: string;
  status: "active" | "inactive";
};

type SupplierDialogState =
  | { mode: "add"; supplier?: undefined }
  | { mode: "edit"; supplier: Supplier };

const defaultForm: SupplierFormState = { name: "", phone: "", email: "", category: "", balance: "0", status: "active" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function SuppliersPage({ initialSuppliers = [] }: { initialSuppliers?: Supplier[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id ?? "");
  const [dialog, setDialog] = useState<SupplierDialogState | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const selected = suppliers.find((supplier) => supplier.id === selectedId) ?? suppliers[0];
  const filteredSuppliers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const matchesStatus = status === "All statuses" || (status === "Active" && supplier.status !== "Inactive") || supplier.status === status;
      const matchesQuery = !normalized || `${supplier.name} ${supplier.phone} ${supplier.email} ${supplier.category}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [query, status, suppliers]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshSuppliers() {
    const response = await fetch("/api/suppliers", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed to load suppliers.");
    setSuppliers(payload.data);
    if (!payload.data.some((supplier: Supplier) => supplier.id === selectedId)) setSelectedId(payload.data[0]?.id ?? "");
  }

  async function saveSupplier(values: SupplierFormState) {
    setError("");
    const balance = Number(values.balance || 0);
    if (!values.name.trim()) return setError("Supplier name is required.");
    if (!values.phone.trim()) return setError("Phone is required.");
    if (!values.category.trim()) return setError("Category is required.");
    if (!Number.isFinite(balance) || balance < 0) return setError("Opening balance cannot be negative.");

    const isEdit = dialog?.mode === "edit";
    const url = isEdit ? `/api/suppliers/${dialog.supplier.id}` : "/api/suppliers";
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, balance }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save supplier.");
      await refreshSuppliers();
      setSelectedId(payload.data.id);
      setDialog(null);
      showFeedback(isEdit ? "Supplier updated successfully." : "Supplier added successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save supplier.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateSupplier(supplier: Supplier) {
    if (!window.confirm(`Deactivate ${supplier.name}? They will be hidden from the supplier list.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to deactivate supplier.");
      await refreshSuppliers();
      showFeedback("Supplier deactivated successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to deactivate supplier.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Supply chain</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Suppliers</h2><p className="mt-1 text-sm text-[#789083]">Manage vendors, purchasing activity and balances payable.</p></div>
        <button onClick={() => { setError(""); setDialog({ mode: "add" }); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]"><Plus size={16} /> Add supplier</button>
      </div>
      {(feedback || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</div>}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
          <div className="flex flex-col gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row"><label className="relative flex-1"><Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search suppliers" placeholder="Search supplier, category or contact..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></label><label className="relative"><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter suppliers by status" className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] outline-none focus:border-[#16A34A] sm:min-w-40"><option>All statuses</option><option>Active</option><option>Clear</option><option>Owes</option><option>Inactive</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label></div>
          {loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Updating suppliers...</div>}
          <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1150px] border-collapse text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Supplier</th><th className="px-3 py-3.5">Phone</th><th className="px-3 py-3.5">Email</th><th className="px-3 py-3.5">Category</th><th className="px-3 py-3.5">Total purchases</th><th className="px-3 py-3.5">Current balance</th><th className="px-3 py-3.5">Last purchase</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody>{filteredSuppliers.map((supplier) => <SupplierRow key={supplier.id} supplier={supplier} selected={selectedId === supplier.id} onSelect={() => setSelectedId(supplier.id)} onEdit={() => { setError(""); setDialog({ mode: "edit", supplier }); }} onDeactivate={() => deactivateSupplier(supplier)} />)}</tbody></table></div>
          <div className="grid gap-3 p-3 lg:hidden">{filteredSuppliers.map((supplier) => <SupplierCard key={supplier.id} supplier={supplier} selected={selectedId === supplier.id} onSelect={() => setSelectedId(supplier.id)} onEdit={() => { setError(""); setDialog({ mode: "edit", supplier }); }} onDeactivate={() => deactivateSupplier(supplier)} />)}</div>
          {filteredSuppliers.length === 0 && <div className="grid min-h-56 place-items-center p-8 text-center"><div><Truck className="mx-auto text-[#9AAEA3]" size={32} /><p className="mt-3 text-sm font-black text-[#173324]">{suppliers.length === 0 ? "No suppliers yet" : "No matching suppliers"}</p><p className="mt-1 text-xs text-[#789083]">{suppliers.length === 0 ? "Add a supplier when you start purchasing stock." : "Adjust the search or status filter."}</p></div></div>}
          <footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filteredSuppliers.length}</b> of <b className="text-[#173324]">{suppliers.length}</b> suppliers</footer>
        </article>
        {selected ? <SupplierProfile supplier={selected} onFeedback={showFeedback} /> : <aside className="grid min-h-72 place-items-center rounded-2xl border border-[#DDEAE0] bg-white p-6 text-center text-xs text-[#789083]">No supplier selected.</aside>}
      </section>
      {dialog && <SupplierDialog state={dialog} loading={loading} error={error} onClose={() => setDialog(null)} onSave={saveSupplier} />}
    </div>
  );
}

function formFromSupplier(supplier?: Supplier): SupplierFormState {
  if (!supplier) return defaultForm;
  return { name: supplier.name, phone: supplier.phone, email: supplier.email, category: supplier.category, balance: String(supplier.currentBalance), status: supplier.status === "Inactive" ? "inactive" : "active" };
}

function SupplierDialog({ state, loading, error, onClose, onSave }: { state: SupplierDialogState; loading: boolean; error: string; onClose: () => void; onSave: (values: SupplierFormState) => void }) {
  const [values, setValues] = useState<SupplierFormState>(() => formFromSupplier(state.supplier));
  const title = state.mode === "add" ? "Add supplier" : `Edit ${state.supplier.name}`;
  function update<K extends keyof SupplierFormState>(field: K, value: SupplierFormState[K]) { setValues((current) => ({ ...current, [field]: value })); }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="mt-1 text-[11px] text-[#789083]">Supplier details are saved to the business database.</p></div><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]" aria-label="Close supplier form"><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="p-4">{error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}<div className="grid gap-3 md:grid-cols-2"><Field label="Supplier name" required value={values.name} onChange={(value) => update("name", value)} /><Field label="Phone" required value={values.phone} onChange={(value) => update("phone", value)} /><Field label="Email" value={values.email} onChange={(value) => update("email", value)} /><Field label="Category" required value={values.category} onChange={(value) => update("category", value)} /><Field label="Opening balance" type="number" value={values.balance} onChange={(value) => update("balance", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select value={values.status} onChange={(event) => update("status", event.target.value as "active" | "inactive")} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button><button disabled={loading} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save supplier"}</button></div></form></article></div>;
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}

function SupplierRow({ supplier, selected, onSelect, onEdit, onDeactivate }: { supplier: Supplier; selected: boolean; onSelect: () => void; onEdit: () => void; onDeactivate: () => void }) {
  return <tr onClick={onSelect} className={`cursor-pointer border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB] ${selected ? "bg-[#16A34A]/[0.035]" : ""}`}><td className="px-4 py-3"><div className="flex items-center gap-2.5"><SupplierAvatar supplier={supplier} /><p className="font-black text-[#173324]">{supplier.name}</p></div></td><td className="px-3 py-3 font-semibold">{supplier.phone}</td><td className="px-3 py-3">{supplier.email || "-"}</td><td className="px-3 py-3">{supplier.category}</td><td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(supplier.totalPurchases)}</td><td className="px-3 py-3 font-bold text-[#EF4444]">{formatCurrency(supplier.currentBalance)}</td><td className="px-3 py-3">{supplier.lastPurchase}</td><td className="px-3 py-3"><SupplierStatusBadge status={supplier.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={(event) => { event.stopPropagation(); onEdit(); }} aria-label={`Edit ${supplier.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></button><button onClick={(event) => { event.stopPropagation(); onDeactivate(); }} aria-label={`Deactivate ${supplier.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></button></div></td></tr>;
}

function SupplierCard({ supplier, selected, onSelect, onEdit, onDeactivate }: { supplier: Supplier; selected: boolean; onSelect: () => void; onEdit: () => void; onDeactivate: () => void }) {
  return <article className={`rounded-xl border p-3 text-left ${selected ? "border-[#16A34A]/60 bg-[#16A34A]/[0.035]" : "border-[#E8F0EA]"}`}><button onClick={onSelect} className="w-full text-left"><div className="flex items-start gap-3"><SupplierAvatar supplier={supplier} /><div className="min-w-0 flex-1"><p className="text-xs font-black text-[#173324]">{supplier.name}</p><p className="mt-1 truncate text-[10px] text-[#789083]">{supplier.category}</p></div><SupplierStatusBadge status={supplier.status} /></div><div className="mt-3 grid grid-cols-2 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Purchases</b><strong className="mt-1 block text-[#173324]">{formatCurrency(supplier.totalPurchases)}</strong></span><span><b className="block text-[#789083]">Balance</b><strong className="mt-1 block text-[#EF4444]">{formatCurrency(supplier.currentBalance)}</strong></span></div></button><div className="mt-3 flex justify-end gap-2"><button onClick={onEdit} className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-[10px] font-black text-[#60766B]">Edit</button><button onClick={onDeactivate} className="rounded-lg bg-[#EF4444]/10 px-3 py-2 text-[10px] font-black text-[#EF4444]">Deactivate</button></div></article>;
}

function SupplierAvatar({ supplier }: { supplier: Supplier }) { return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#12311F] text-[10px] font-black text-[#F6FFF8]">{supplier.initials}</span>; }
function SupplierStatusBadge({ status }: { status: SupplierStatus }) { const tone = status === "Clear" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Owes" ? "bg-[#D4A017]/12 text-[#9A7108]" : "bg-[#789083]/10 text-[#60766B]"; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>; }

function SupplierProfile({ supplier, onFeedback }: { supplier: Supplier; onFeedback: (message: string) => void }) {
  return <aside className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5 xl:sticky xl:top-[96px]"><div className="bg-[#12311F] p-5 text-white"><div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-sm font-black text-[#22C55E]">{supplier.initials}</span><Truck size={19} className="text-[#B8C7BD]" /></div><h3 className="mt-4 text-lg font-black">{supplier.name}</h3><p className="mt-1 text-[11px] text-[#B8C7BD]">{supplier.category}</p></div><div className="space-y-3 p-4 text-xs"><p className="flex items-center gap-2 text-[#60766B]"><Phone size={14} className="text-[#16A34A]" /> {supplier.phone}</p><p className="flex items-center gap-2 text-[#60766B]"><Mail size={14} className="text-[#16A34A]" /> {supplier.email || "No email added"}</p><p className="flex items-center gap-2 text-[#60766B]"><Building2 size={14} className="text-[#16A34A]" /> {supplier.status} account</p></div><div className="grid grid-cols-2 gap-px bg-[#E8F0EA]"><ProfileStat icon={ShoppingBag} label="Purchases" value={formatCurrency(supplier.totalPurchases)} /><ProfileStat icon={WalletCards} label="Balance" value={formatCurrency(supplier.currentBalance)} danger={supplier.currentBalance > 0} /></div><div className="space-y-2 p-4"><button onClick={() => onFeedback("Supplier profile placeholder. Detailed supplier profile will be connected later.")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white hover:bg-[#12883E]">View supplier profile <ArrowUpRight size={14} /></button><button onClick={() => onFeedback("Supplier statement placeholder. PDF export will be connected later.")} className="w-full rounded-xl border border-[#DDEAE0] py-3 text-xs font-black text-[#60766B]">Supplier statement</button></div></aside>;
}

function ProfileStat({ icon: Icon, label, value, danger }: { icon: typeof Users; label: string; value: string; danger?: boolean }) { return <div className="bg-[#F8FBF8] p-3"><Icon size={14} className="text-[#16A34A]" /><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#789083]">{label}</p><p className={`mt-1 text-xs font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p></div>; }
