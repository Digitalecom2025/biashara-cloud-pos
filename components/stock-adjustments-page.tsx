"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, ChevronDown, CirclePlus, ClipboardCheck, MinusCircle, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { stockAdjustments as mockStockAdjustments, warehouses as mockWarehouses, type AdjustmentStatus, type AdjustmentType, type StockAdjustment, type Warehouse } from "@/lib/inventory-mock-data";
import { products as mockProducts, type Product } from "@/lib/mock-data";

type AdjustmentFormState = {
  productId: string;
  type: AdjustmentType;
  quantity: string;
  reason: string;
  warehouse: string;
  notes: string;
  adjustedBy: string;
};

function defaultForm(products: Product[], warehouses: Warehouse[]): AdjustmentFormState {
  return { productId: products[0]?.id ? String(products[0].id) : "", type: "Add", quantity: "1", reason: "", warehouse: warehouses[0]?.name ?? "Main Warehouse", notes: "", adjustedBy: "Inventory team" };
}

export function StockAdjustmentsPage({ initialAdjustments = mockStockAdjustments, initialProducts = mockProducts, initialWarehouses = mockWarehouses }: { initialAdjustments?: StockAdjustment[]; initialProducts?: Product[]; initialWarehouses?: Warehouse[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [open, setOpen] = useState(false);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(initialAdjustments.length > 0 ? initialAdjustments : mockStockAdjustments);
  const [products, setProducts] = useState<Product[]>(initialProducts.length > 0 ? initialProducts : mockProducts);
  const [warehouses] = useState<Warehouse[]>(initialWarehouses.length > 0 ? initialWarehouses : mockWarehouses);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => { const n = query.trim().toLowerCase(); return adjustments.filter((item) => (type === "All types" || item.type === type) && (!n || `${item.id} ${item.product} ${item.reason} ${item.warehouse}`.toLowerCase().includes(n))); }, [adjustments, query, type]);
  const added = adjustments.filter((item) => item.type === "Add").reduce((s, i) => s + i.quantity, 0);
  const reduced = adjustments.filter((item) => item.type === "Reduce").reduce((s, i) => s + i.quantity, 0);
  const damaged = adjustments.filter((item) => item.type === "Damage").reduce((s, i) => s + i.quantity, 0);
  const pending = adjustments.filter((item) => item.status === "Pending").length;

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshData() {
    const [adjustmentResponse, productResponse] = await Promise.all([fetch("/api/stock-adjustments", { cache: "no-store" }), fetch("/api/products", { cache: "no-store" })]);
    const adjustmentPayload = await adjustmentResponse.json();
    const productPayload = await productResponse.json();
    if (!adjustmentResponse.ok) throw new Error(adjustmentPayload.error ?? "Failed to load adjustments.");
    if (!productResponse.ok) throw new Error(productPayload.error ?? "Failed to load products.");
    setAdjustments(adjustmentPayload.data);
    setProducts(productPayload.data);
  }

  async function saveAdjustment(values: AdjustmentFormState) {
    setError("");
    const product = products.find((item) => String(item.id) === values.productId);
    const quantity = Number(values.quantity);
    if (!values.productId) return setError("Product is required.");
    if (!Number.isFinite(quantity) || quantity <= 0) return setError("Quantity must be greater than 0.");
    if (!values.reason.trim()) return setError("Reason is required.");
    if (!values.warehouse.trim()) return setError("Warehouse is required.");
    if (product && ["Reduce", "Damage"].includes(values.type) && quantity > product.stock) return setError(`${product.name} has only ${product.stock} in stock.`);
    if (["Reduce", "Damage"].includes(values.type) && !window.confirm(`${values.type} ${quantity} units from stock?`)) return;

    setLoading(true);
    try {
      const response = await fetch("/api/stock-adjustments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, quantity }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save stock adjustment.");
      await refreshData();
      setOpen(false);
      showFeedback("Stock adjustment saved and product stock updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save stock adjustment.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-[1700px]"><Header title="Stock Adjustments" description="Record stock additions, reductions, damage and count corrections." action="Add adjustment" onAction={() => { setError(""); setOpen(true); }} />
    {(feedback || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={CirclePlus} label="Stock added" value={`${added} units`} note="Received and approved" /><Summary icon={MinusCircle} label="Stock reduced" value={`${reduced} units`} note="Operational reductions" /><Summary icon={AlertTriangle} label="Damaged stock" value={`${damaged} units`} note="Reported wastage" danger /><Summary icon={ClipboardCheck} label="Pending review" value={`${pending} records`} note="Awaiting approval" gold /></section>
    <Register filters={<><SearchBox value={query} onChange={setQuery} placeholder="Search adjustment, product or reason..." label="Search adjustments" /><Filter value={type} onChange={setType} label="Filter adjustment type" options={["All types", "Add", "Reduce", "Damage", "Correction"]} /></>} footer={`Showing ${filtered.length} of ${adjustments.length} adjustments`}>
      {loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Saving stock adjustment...</div>}
      <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1220px] border-collapse text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Adjustment ID</th><th className="px-3 py-3.5">Product</th><th className="px-3 py-3.5">Type</th><th className="px-3 py-3.5">Quantity</th><th className="px-3 py-3.5">Reason</th><th className="px-3 py-3.5">Warehouse</th><th className="px-3 py-3.5">Adjusted by</th><th className="px-3 py-3.5">Date / time</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody>{filtered.map((item) => <AdjustmentRow key={item.id} item={item} />)}</tbody></table></div><div className="grid gap-3 p-3 lg:hidden">{filtered.map((item) => <AdjustmentCard key={item.id} item={item} />)}</div>
      {filtered.length === 0 && <div className="grid min-h-52 place-items-center p-8 text-center"><p className="text-xs text-[#789083]">No matching stock adjustments.</p></div>}
    </Register>{open && <AdjustmentDialog products={products} warehouses={warehouses} loading={loading} error={error} onClose={() => setOpen(false)} onSave={saveAdjustment} />}
  </div>;
}

function Header({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) { return <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Inventory control</p><h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">{title}</h2><p className="mt-1 text-sm text-[#789083]">{description}</p></div><button onClick={onAction} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]"><Plus size={16} />{action}</button></div>; }
function Summary({ icon: Icon, label, value, note, danger, gold }: { icon: typeof Boxes; label: string; value: string; note: string; danger?: boolean; gold?: boolean }) { const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]"; return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
function Register({ filters, footer, children }: { filters: React.ReactNode; footer: string; children: React.ReactNode }) { return <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5"><div className="grid gap-3 border-b border-[#E8F0EA] p-4 lg:grid-cols-[minmax(0,1fr)_190px]">{filters}</div>{children}<footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">{footer}</footer></section>; }
function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) { return <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} placeholder={placeholder} className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#16A34A]" /></label>; }
function Filter({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: string[] }) { return <label className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] outline-none">{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label>; }
function AdjustmentRow({ item }: { item: StockAdjustment }) { return <tr className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]"><td className="px-4 py-3 font-black text-[#173324]">{item.id}</td><td className="px-3 py-3 font-semibold">{item.product}</td><td className="px-3 py-3"><TypeBadge type={item.type} /></td><td className="px-3 py-3 font-black text-[#173324]">{item.quantity}</td><td className="px-3 py-3">{item.reason}</td><td className="px-3 py-3">{item.warehouse}</td><td className="px-3 py-3">{item.adjustedBy}</td><td className="px-3 py-3">{item.date}</td><td className="px-3 py-3"><Approval status={item.status} /></td><td className="px-4 py-3 text-right"><MoreHorizontal size={16} /></td></tr>; }
function AdjustmentCard({ item }: { item: StockAdjustment }) { return <article className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex justify-between"><div><p className="text-xs font-black text-[#173324]">{item.id} - {item.product}</p><p className="mt-1 text-[10px] text-[#789083]">{item.warehouse} - {item.date}</p></div><Approval status={item.status} /></div><div className="mt-3 flex items-center justify-between rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><TypeBadge type={item.type} /></span><b className="text-[#173324]">{item.quantity} units</b><span className="text-[#789083]">{item.adjustedBy}</span></div><p className="mt-2 text-[10px] text-[#789083]">{item.reason}</p></article>; }
function TypeBadge({ type }: { type: AdjustmentType }) { const tone = type === "Add" ? "bg-[#16A34A]/10 text-[#0F8C42]" : type === "Damage" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#D4A017]/12 text-[#9A7108]"; return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{type}</span>; }
function Approval({ status }: { status: AdjustmentStatus }) { const tone = status === "Approved" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#D4A017]/12 text-[#9A7108]"; return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>; }

function AdjustmentDialog({ products, warehouses, loading, error, onClose, onSave }: { products: Product[]; warehouses: Warehouse[]; loading: boolean; error: string; onClose: () => void; onSave: (values: AdjustmentFormState) => void }) {
  const [values, setValues] = useState<AdjustmentFormState>(() => defaultForm(products, warehouses));
  function update<K extends keyof AdjustmentFormState>(field: K, value: AdjustmentFormState[K]) { setValues((current) => ({ ...current, [field]: value })); }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-2xl rounded-2xl bg-white"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">Add stock adjustment</h3><p className="mt-0.5 text-[10px] text-[#789083]">This updates product stock and records a stock movement.</p></div><button onClick={onClose} aria-label="Close dialog"><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="p-4">{error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}<div className="grid gap-3 sm:grid-cols-2"><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Product</span><select value={values.productId} onChange={(event) => update("productId", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]">{products.map((product) => <option key={product.id} value={String(product.id)}>{product.name} - stock {product.stock}</option>)}</select></label><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Adjustment type</span><select value={values.type} onChange={(event) => update("type", event.target.value as AdjustmentType)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]"><option>Add</option><option>Reduce</option><option>Damage</option><option>Correction</option></select></label><Field label="Quantity" type="number" value={values.quantity} onChange={(value) => update("quantity", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Warehouse</span><select value={values.warehouse} onChange={(event) => update("warehouse", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]">{warehouses.map((warehouse) => <option key={warehouse.id}>{warehouse.name}</option>)}</select></label><Field label="Adjusted by" value={values.adjustedBy} onChange={(value) => update("adjustedBy", value)} /><label className="sm:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Reason</span><input value={values.reason} onChange={(event) => update("reason", event.target.value)} placeholder="Enter adjustment reason" className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" /></label><label className="sm:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><input value={values.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Optional notes" className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" /></label></div><button disabled={loading} className="mt-4 w-full rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save adjustment"}</button></form></article></div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><input type={type} min={type === "number" ? "1" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" /></label>; }
