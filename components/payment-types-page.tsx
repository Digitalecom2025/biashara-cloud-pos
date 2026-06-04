"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Banknote, Building2, CreditCard, MoreHorizontal, Plus, Smartphone, Users, WalletCards, X } from "lucide-react";
import { paymentTypes as mockPaymentTypes } from "@/lib/finance-mock-data";
import type { StoredPaymentType } from "@/lib/finance-data";

type PaymentForm = {
  name: string;
  code: string;
  description: string;
  status: "Active" | "Inactive";
};

const icons = { cash: Banknote, mpesa: Smartphone, bank: Building2, card: CreditCard, credit: Users };

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function formFromPaymentType(item?: StoredPaymentType): PaymentForm {
  return {
    name: item?.name ?? "",
    code: item?.code ?? "",
    description: item?.description ?? "",
    status: item?.status ?? "Active",
  };
}

export function PaymentTypesPage() {
  const [items, setItems] = useState<StoredPaymentType[]>(mockPaymentTypes.map((item) => ({ ...item, code: item.id })));
  const [open, setOpen] = useState<StoredPaymentType | "add" | null>(null);
  const [form, setForm] = useState<PaymentForm>(formFromPaymentType());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadPaymentTypes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payment-types");
      if (!response.ok) throw new Error("Failed to load payment types.");
      const json = (await response.json()) as { data: StoredPaymentType[] };
      setItems(json.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Payment types could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPaymentTypes();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPaymentTypes]);

  function openDialog(item?: StoredPaymentType) {
    setOpen(item ?? "add");
    setForm(formFromPaymentType(item));
    setError("");
    setFeedback("");
  }

  async function savePaymentType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const editing = open && open !== "add";
      const response = await fetch(editing ? `/api/payment-types/${open.code}` : "/api/payment-types", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await response.json()) as { data?: StoredPaymentType[]; error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Payment type could not be saved.");
      if (json.data) setItems(json.data);
      setFeedback(json.message ?? "Payment type saved.");
      setOpen(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Payment type could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(item: StoredPaymentType) {
    if (!window.confirm(`Deactivate ${item.name}?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/payment-types/${item.code}`, { method: "DELETE" });
      const json = (await response.json()) as { data?: StoredPaymentType[]; error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Payment type could not be deactivated.");
      if (json.data) setItems(json.data);
      setFeedback(json.message ?? "Payment type deactivated.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Payment type could not be deactivated.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Checkout configuration</p>
          <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Payment Types</h2>
          <p className="mt-1 text-sm text-[#789083]">Configure the methods available during POS checkout.</p>
          {(feedback || error) && <p className={`mt-2 text-xs font-bold ${error ? "text-[#EF4444]" : "text-[#16A34A]"}`}>{error || feedback}</p>}
        </div>
        <button onClick={() => openDialog()} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white"><Plus size={16} />Add payment type</button>
      </div>

      {loading ? <p className="rounded-2xl border border-[#DDEAE0] bg-white p-6 text-sm font-bold text-[#789083]">Loading payment types...</p> : null}
      {!loading && items.length === 0 ? <p className="rounded-2xl border border-[#DDEAE0] bg-white p-6 text-sm font-bold text-[#789083]">No payment types found.</p> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <PaymentCard key={item.code} item={item} onEdit={() => openDialog(item)} onDeactivate={() => deactivate(item)} />)}
      </section>

      {open && (
        <PaymentDialog
          title={open === "add" ? "Add payment type" : `Edit ${open.name}`}
          form={form}
          isEdit={open !== "add"}
          saving={saving}
          onChange={(next) => setForm((current) => ({ ...current, ...next }))}
          onSubmit={savePaymentType}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function PaymentCard({ item, onEdit, onDeactivate }: { item: StoredPaymentType; onEdit: () => void; onDeactivate: () => void }) {
  const Icon = icons[item.code as keyof typeof icons] ?? WalletCards;
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Icon size={21} /></span>
        <button onClick={onEdit} aria-label={`Edit ${item.name}`} className="text-[#789083]"><MoreHorizontal size={18} /></button>
      </div>
      <div className="mt-5 flex items-center gap-2"><h3 className="font-black text-[#173324]">{item.name}</h3><Status value={item.status} /></div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#789083]">{item.code}</p>
      <p className="mt-2 text-xs leading-5 text-[#789083]">{item.description || "No description provided."}</p>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#E8F0EA]">
        <div className="bg-[#F8FBF8] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#789083]">Transactions</p><p className="mt-1 text-sm font-black text-[#173324]">{item.transactions}</p></div>
        <div className="bg-[#F8FBF8] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#789083]">Total collected</p><p className="mt-1 text-sm font-black text-[#173324]">{money(item.totalCollected)}</p></div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button onClick={onEdit} className="rounded-xl border border-[#DDEAE0] py-2.5 text-xs font-black text-[#60766B]">Edit</button>
        <button onClick={onDeactivate} className="rounded-xl border border-[#EF4444]/20 py-2.5 text-xs font-black text-[#EF4444]">Deactivate</button>
      </div>
    </article>
  );
}

function Status({ value }: { value: StoredPaymentType["status"] }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${value === "Active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : "bg-[#789083]/10 text-[#60766B]"}`}>{value}</span>;
}

function PaymentDialog({ title, form, isEdit, saving, onChange, onSubmit, onClose }: { title: string; form: PaymentForm; isEdit: boolean; saving: boolean; onChange: (value: Partial<PaymentForm>) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white">
        <div className="flex justify-between border-b border-[#E8F0EA] p-4">
          <div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="text-[10px] text-[#789083]">Saved in business payment settings.</p></div>
          <button type="button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="grid gap-3 p-4">
          <Field label="Payment name" value={form.name} onChange={(value) => onChange({ name: value })} required />
          <Field label="Payment code" value={form.code} onChange={(value) => onChange({ code: value })} disabled={isEdit} required />
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Description</span><textarea value={form.description} onChange={(event) => onChange({ description: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" /></label>
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select value={form.status} onChange={(event) => onChange({ status: event.target.value as PaymentForm["status"] })} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]"><option>Active</option><option>Inactive</option></select></label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E8F0EA] p-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save payment type"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, disabled, required }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><input required={required} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A] disabled:bg-[#F8FBF8] disabled:text-[#789083]" /></label>;
}
