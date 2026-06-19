"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ChevronDown,
  CircleDollarSign,
  Eye,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import type { Purchase, PurchaseStatus, Supplier } from "@/lib/purchasing-mock-data";
import type { Product } from "@/lib/mock-data";

type PurchaseItemForm = {
  productId: string;
  quantity: string;
  unitPrice: string;
};

type PurchaseFormState = {
  supplierId: string;
  invoiceNumber: string;
  purchaseDate: string;
  paymentMethod: "Cash" | "M-Pesa" | "Bank" | "Credit";
  paidAmount: string;
  notes: string;
  items: PurchaseItemForm[];
};

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function defaultForm(supplierId = "", productId = ""): PurchaseFormState {
  return {
    supplierId,
    invoiceNumber: `PUR-${Date.now().toString().slice(-6)}`,
    purchaseDate: todayInputDate(),
    paymentMethod: "Credit",
    paidAmount: "0",
    notes: "",
    items: [{ productId, quantity: "1", unitPrice: "" }],
  };
}

export function PurchasesPage({
  initialPurchases = [],
  initialSuppliers = [],
  initialProducts = [],
}: {
  initialPurchases?: Purchase[];
  initialSuppliers?: Supplier[];
  initialProducts?: Product[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [supplier, setSupplier] = useState("All suppliers");
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const filteredPurchases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return purchases.filter((purchase) => {
      const matchesStatus = status === "All statuses" || purchase.status === status;
      const matchesSupplier = supplier === "All suppliers" || purchase.supplier === supplier;
      const matchesQuery = !normalized || `${purchase.invoice} ${purchase.supplier} ${purchase.description}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesSupplier && matchesQuery;
    });
  }, [query, status, supplier, purchases]);
  const totals = purchases.reduce((result, purchase) => ({ total: result.total + purchase.totalAmount, paid: result.paid + purchase.paidAmount, balance: result.balance + purchase.balanceDue }), { total: 0, paid: 0, balance: 0 });
  const returnTotal = 0;

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshData() {
    const [purchasesResponse, suppliersResponse, productsResponse] = await Promise.all([
      fetch("/api/purchases", { cache: "no-store" }),
      fetch("/api/suppliers", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ]);
    const purchasesPayload = await purchasesResponse.json();
    const suppliersPayload = await suppliersResponse.json();
    const productsPayload = await productsResponse.json();
    if (!purchasesResponse.ok) throw new Error(purchasesPayload.error ?? "Failed to load purchases.");
    if (!suppliersResponse.ok) throw new Error(suppliersPayload.error ?? "Failed to load suppliers.");
    if (!productsResponse.ok) throw new Error(productsPayload.error ?? "Failed to load products.");
    setPurchases(purchasesPayload.data);
    setSuppliers(suppliersPayload.data);
    setProducts(productsPayload.data);
  }

  async function savePurchase(values: PurchaseFormState, allowOverpay = false) {
    setError("");
    const items = values.items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) }));
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const paidAmount = Number(values.paidAmount || 0);

    if (!values.supplierId) return setError("Supplier is required.");
    if (!values.invoiceNumber.trim()) return setError("Purchase invoice number is required.");
    if (items.length === 0 || items.some((item) => !item.productId)) return setError("At least one product item is required.");
    if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) return setError("Quantity must be greater than 0.");
    if (items.some((item) => !Number.isFinite(item.unitPrice) || item.unitPrice <= 0)) return setError("Purchase price must be greater than 0.");
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return setError("Paid amount cannot be negative.");
    if (paidAmount > total && !allowOverpay) {
      if (!window.confirm("Paid amount exceeds purchase total. Continue and cap paid amount to total?")) return;
      return savePurchase(values, true);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, paidAmount, items, allowOverpay }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save purchase.");
      await refreshData();
      setAddOpen(false);
      showFeedback("Purchase saved. Stock and supplier balance updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save purchase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Stock procurement</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Purchases</h2><p className="mt-1 text-sm text-[#789083]">Track stock intake, supplier invoices and outstanding payments.</p></div>
        <button onClick={() => { setError(""); setAddOpen(true); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]"><Plus size={16} /> Add purchase</button>
      </div>
      {(feedback || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</div>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={ShoppingBag} label="Total purchases" value={formatCurrency(totals.total)} note={`${purchases.length} purchase invoices`} />
        <SummaryCard icon={CircleDollarSign} label="Paid purchases" value={formatCurrency(totals.paid)} note="Settled supplier payments" />
        <SummaryCard icon={WalletCards} label="Supplier balance" value={formatCurrency(totals.balance)} note="Outstanding amount payable" danger />
        <SummaryCard icon={ArrowDownLeft} label="Purchase returns" value={formatCurrency(returnTotal)} note="0 returns recorded" gold />
      </section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-3 border-b border-[#E8F0EA] p-4 lg:grid-cols-[minmax(0,1fr)_170px_230px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search purchases" placeholder="Search invoice, supplier or purchase..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></label>
          <FilterSelect label="Filter purchase status" value={status} onChange={setStatus} options={["All statuses", "Paid", "Partial", "Unpaid"]} />
          <FilterSelect label="Filter by supplier" value={supplier} onChange={setSupplier} options={["All suppliers", ...suppliers.map((item) => item.name)]} />
        </div>
        {loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Saving purchase...</div>}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1240px] border-collapse text-left">
            <thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Invoice</th><th className="px-3 py-3.5">Supplier</th><th className="px-3 py-3.5">Purchase date</th><th className="px-3 py-3.5">Items</th><th className="px-3 py-3.5">Total amount</th><th className="px-3 py-3.5">Paid amount</th><th className="px-3 py-3.5">Balance due</th><th className="px-3 py-3.5">Payment</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead>
            <tbody>{filteredPurchases.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} onView={() => showFeedback(`Purchase ${purchase.invoice} detail placeholder. Full view is available through /api/purchases/${purchase.id}.`)} />)}</tbody>
          </table>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">{filteredPurchases.map((purchase) => <PurchaseCard key={purchase.id} purchase={purchase} />)}</div>
        {filteredPurchases.length === 0 && <div className="grid min-h-56 place-items-center p-8 text-center"><div><ReceiptText className="mx-auto text-[#9AAEA3]" size={32} /><p className="mt-3 text-sm font-black text-[#173324]">No matching purchases</p><p className="mt-1 text-xs text-[#789083]">Adjust the search, status or supplier filter.</p></div></div>}
        <footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filteredPurchases.length}</b> of <b className="text-[#173324]">{purchases.length}</b> purchases</footer>
      </section>
      {addOpen && <PurchaseDialog suppliers={suppliers} products={products} loading={loading} error={error} onClose={() => setAddOpen(false)} onSave={savePurchase} />}
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

function PurchaseRow({ purchase, onView }: { purchase: Purchase; onView: () => void }) {
  return <tr className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]"><td className="px-4 py-3"><p className="font-black text-[#173324]">{purchase.invoice}</p><p className="mt-0.5 max-w-56 truncate text-[10px] text-[#9AAEA3]">{purchase.description}</p></td><td className="px-3 py-3 font-semibold">{purchase.supplier}</td><td className="px-3 py-3">{purchase.date}</td><td className="px-3 py-3">{purchase.itemsCount}</td><td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(purchase.totalAmount)}</td><td className="px-3 py-3 text-[#0F8C42]">{formatCurrency(purchase.paidAmount)}</td><td className="px-3 py-3 font-bold text-[#EF4444]">{formatCurrency(purchase.balanceDue)}</td><td className="px-3 py-3">{purchase.paymentMethod}</td><td className="px-3 py-3"><PurchaseStatusBadge status={purchase.status} /></td><td className="px-4 py-3"><div className="flex justify-end"><button onClick={onView} aria-label={`View ${purchase.invoice}`} className="flex items-center gap-1.5 rounded-lg border border-[#DDEAE0] px-2.5 py-2 text-[10px] font-black text-[#60766B] hover:bg-[#F8FBF8]"><Eye size={13} /> View</button></div></td></tr>;
}

function PurchaseCard({ purchase }: { purchase: Purchase }) {
  return <article className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-[#173324]">{purchase.invoice}</p><p className="mt-1 text-[10px] font-semibold text-[#789083]">{purchase.supplier}</p><p className="mt-1 text-[10px] text-[#9AAEA3]">{purchase.description}</p></div><PurchaseStatusBadge status={purchase.status} /></div><div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Total</b><strong className="mt-1 block text-[#173324]">{formatCurrency(purchase.totalAmount)}</strong></span><span><b className="block text-[#789083]">Paid</b><strong className="mt-1 block text-[#0F8C42]">{formatCurrency(purchase.paidAmount)}</strong></span><span><b className="block text-[#789083]">Balance</b><strong className="mt-1 block text-[#EF4444]">{formatCurrency(purchase.balanceDue)}</strong></span></div><p className="mt-2 text-[10px] text-[#789083]">{purchase.date} - {purchase.itemsCount} items - {purchase.paymentMethod}</p></article>;
}

function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  const tone = status === "Paid" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Partial" ? "bg-[#D4A017]/12 text-[#9A7108]" : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>;
}

function PurchaseDialog({ suppliers, products, loading, error, onClose, onSave }: { suppliers: Supplier[]; products: Product[]; loading: boolean; error: string; onClose: () => void; onSave: (values: PurchaseFormState) => void }) {
  const [values, setValues] = useState<PurchaseFormState>(() => defaultForm(suppliers[0]?.id ?? "", products[0]?.id ? String(products[0].id) : ""));
  const total = values.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  function update<K extends keyof PurchaseFormState>(field: K, value: PurchaseFormState[K]) { setValues((current) => ({ ...current, [field]: value })); }
  function updateItem(index: number, patch: Partial<PurchaseItemForm>) { setValues((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })); }
  function addItem() { setValues((current) => ({ ...current, items: [...current.items, { productId: products[0]?.id ? String(products[0].id) : "", quantity: "1", unitPrice: "" }] })); }
  function removeItem(index: number) { setValues((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) })); }
  function selectProduct(index: number, productId: string) { const product = products.find((item) => String(item.id) === productId); updateItem(index, { productId, unitPrice: product ? String(product.purchasePrice) : "" }); }

  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">Add stock purchase</h3><p className="mt-0.5 text-[10px] text-[#789083]">Save supplier invoice, increase stock and update balances.</p></div><button onClick={onClose} aria-label="Close add purchase dialog" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="p-4">{error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Supplier</span><select value={values.supplierId} onChange={(event) => update("supplierId", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label><Field label="Invoice number" required value={values.invoiceNumber} onChange={(value) => update("invoiceNumber", value)} /><Field label="Purchase date" type="date" value={values.purchaseDate} onChange={(value) => update("purchaseDate", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Payment method</span><select value={values.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value as PurchaseFormState["paymentMethod"])} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Cash</option><option>M-Pesa</option><option>Bank</option><option>Credit</option></select></label></div><div className="mt-4 rounded-2xl border border-[#E8F0EA]"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-3"><p className="text-xs font-black text-[#173324]">Purchase items</p><button type="button" onClick={addItem} className="rounded-lg bg-[#16A34A]/10 px-3 py-2 text-[10px] font-black text-[#0F8C42]">Add item</button></div><div className="space-y-2 p-3">{values.items.map((item, index) => <div key={index} className="grid gap-2 rounded-xl bg-[#F8FBF8] p-2 md:grid-cols-[minmax(0,1fr)_110px_140px_36px]"><select value={item.productId} onChange={(event) => selectProduct(index, event.target.value)} className="rounded-lg border border-[#DDEAE0] bg-white px-3 py-2 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option value="">Select product</option>{products.map((product) => <option key={product.id} value={String(product.id)}>{product.name} - stock {product.stock}</option>)}</select><input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" placeholder="Qty" /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" placeholder="Price" /><button type="button" onClick={() => removeItem(index)} disabled={values.items.length === 1} className="grid h-9 w-9 place-items-center rounded-lg text-[#EF4444] disabled:text-[#CBD8CF]"><Trash2 size={14} /></button></div>)}</div></div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px]"><label className="md:col-span-1"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><input value={values.notes} onChange={(event) => update("notes", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" placeholder="Optional purchase notes" /></label><Field label="Paid amount" type="number" value={values.paidAmount} onChange={(value) => update("paidAmount", value)} /><div className="rounded-xl bg-[#12311F] p-3 text-white"><p className="text-[10px] font-black uppercase tracking-wider text-[#B8C7BD]">Purchase total</p><p className="mt-1 text-lg font-black">{formatCurrency(total)}</p></div></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button><button disabled={loading} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save purchase"}</button></div></form></article></div>;
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}
