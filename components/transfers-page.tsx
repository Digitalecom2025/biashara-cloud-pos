"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Ban, CheckCircle2, ChevronDown, Clock3, MoreHorizontal, Plus, Search, Truck, X } from "lucide-react";
import type { StockTransfer, TransferStatus, Warehouse } from "@/lib/inventory-mock-data";
import type { Product } from "@/lib/mock-data";

type TransferFormState = {
  productId: string;
  quantity: string;
  from: string;
  to: string;
  requestedBy: string;
  notes: string;
};

function defaultForm(products: Product[], warehouses: Warehouse[]): TransferFormState {
  return { productId: products[0]?.id ? String(products[0].id) : "", quantity: "1", from: warehouses[0]?.name ?? "Main Warehouse", to: warehouses[1]?.name ?? "Nairobi CBD Store", requestedBy: "Inventory team", notes: "" };
}

export function TransfersPage({ initialTransfers = [], initialProducts = [], initialWarehouses = [] }: { initialTransfers?: StockTransfer[]; initialProducts?: Product[]; initialWarehouses?: Warehouse[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [open, setOpen] = useState(false);
  const [transfers, setTransfers] = useState<StockTransfer[]>(initialTransfers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warehouses] = useState<Warehouse[]>(initialWarehouses);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => { const n = query.trim().toLowerCase(); return transfers.filter((item) => (status === "All statuses" || item.status === status) && (!n || `${item.id} ${item.product} ${item.from} ${item.to}`.toLowerCase().includes(n))); }, [query, status, transfers]);
  const count = (value: TransferStatus) => transfers.filter((item) => item.status === value).length;

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshData() {
    const [transferResponse, productResponse] = await Promise.all([fetch("/api/transfers", { cache: "no-store" }), fetch("/api/products", { cache: "no-store" })]);
    const transferPayload = await transferResponse.json();
    const productPayload = await productResponse.json();
    if (!transferResponse.ok) throw new Error(transferPayload.error ?? "Failed to load transfers.");
    if (!productResponse.ok) throw new Error(productPayload.error ?? "Failed to load products.");
    setTransfers(transferPayload.data);
    setProducts(productPayload.data);
  }

  async function saveTransfer(values: TransferFormState) {
    setError("");
    const product = products.find((item) => String(item.id) === values.productId);
    const quantity = Number(values.quantity);
    if (!values.productId) return setError("Product is required.");
    if (!Number.isFinite(quantity) || quantity <= 0) return setError("Quantity must be greater than 0.");
    if (!values.from.trim()) return setError("From location is required.");
    if (!values.to.trim()) return setError("To location is required.");
    if (values.from === values.to) return setError("From and To locations cannot be the same.");
    if (product && quantity > product.stock) return setError(`${product.name} has only ${product.stock} in stock.`);

    setLoading(true);
    try {
      const response = await fetch("/api/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, quantity }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save transfer.");
      await refreshData();
      setOpen(false);
      showFeedback("Transfer saved. Movement history updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save transfer.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-[1700px]"><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Stock movement</p><h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Transfer</h2><p className="mt-1 text-sm text-[#789083]">Move products safely between warehouses and branches.</p></div><button onClick={() => { setError(""); setOpen(true); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white"><Plus size={16} />Create transfer</button></div>
    {(feedback || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={ArrowLeftRight} label="Total transfers" value={`${transfers.length} records`} note="All warehouse movements" /><Summary icon={Clock3} label="Pending transfers" value={`${count("Pending")} records`} note="Awaiting approval" gold /><Summary icon={CheckCircle2} label="Completed transfers" value={`${count("Completed")} records`} note="Stock successfully received" /><Summary icon={Ban} label="Cancelled transfers" value={`${count("Cancelled")} records`} note="Cancelled movement requests" danger /></section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5"><div className="grid gap-3 border-b border-[#E8F0EA] p-4 lg:grid-cols-[minmax(0,1fr)_190px]"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search transfers" placeholder="Search transfer, product or warehouse..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#16A34A]" /></label><label className="relative"><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter transfer status" className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B]"><option>All statuses</option><option>Pending</option><option>In transit</option><option>Completed</option><option>Cancelled</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label></div>
      {loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Saving transfer...</div>}
      <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1320px] border-collapse text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Transfer ID</th><th className="px-3 py-3.5">Product</th><th className="px-3 py-3.5">Quantity</th><th className="px-3 py-3.5">From warehouse / branch</th><th className="px-3 py-3.5">To warehouse / branch</th><th className="px-3 py-3.5">Requested by</th><th className="px-3 py-3.5">Approved by</th><th className="px-3 py-3.5">Date</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody>{filtered.map((item) => <TransferRow key={item.id} item={item} />)}</tbody></table></div><div className="grid gap-3 p-3 lg:hidden">{filtered.map((item) => <TransferCard key={item.id} item={item} />)}</div>{filtered.length === 0 && <div className="grid min-h-52 place-items-center p-8 text-center"><p className="text-xs text-[#789083]">No matching transfers.</p></div>}<footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filtered.length}</b> of <b className="text-[#173324]">{transfers.length}</b> transfers</footer>
    </section>{open && <TransferDialog products={products} warehouses={warehouses} loading={loading} error={error} onClose={() => setOpen(false)} onSave={saveTransfer} />}
  </div>;
}

function Summary({ icon: Icon, label, value, note, danger, gold }: { icon: typeof Truck; label: string; value: string; note: string; danger?: boolean; gold?: boolean }) { const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]"; return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p><p className={`mt-1 text-lg font-black ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
function TransferRow({ item }: { item: StockTransfer }) { return <tr className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]"><td className="px-4 py-3 font-black text-[#173324]">{item.id}</td><td className="px-3 py-3 font-semibold">{item.product}</td><td className="px-3 py-3 font-black text-[#173324]">{item.quantity}</td><td className="px-3 py-3">{item.from}</td><td className="px-3 py-3">{item.to}</td><td className="px-3 py-3">{item.requestedBy}</td><td className="px-3 py-3">{item.approvedBy}</td><td className="px-3 py-3">{item.date}</td><td className="px-3 py-3"><TransferBadge status={item.status} /></td><td className="px-4 py-3 text-right"><MoreHorizontal size={16} /></td></tr>; }
function TransferCard({ item }: { item: StockTransfer }) { return <article className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex justify-between"><div><p className="text-xs font-black text-[#173324]">{item.id} - {item.product}</p><p className="mt-1 text-[10px] text-[#789083]">{item.quantity} units - {item.date}</p></div><TransferBadge status={item.status} /></div><div className="mt-3 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><p><b className="text-[#789083]">From:</b> <strong className="text-[#173324]">{item.from}</strong></p><p className="mt-1"><b className="text-[#789083]">To:</b> <strong className="text-[#173324]">{item.to}</strong></p></div></article>; }
function TransferBadge({ status }: { status: TransferStatus }) { const tone = status === "Completed" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Cancelled" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#D4A017]/12 text-[#9A7108]"; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>; }

function TransferDialog({ products, warehouses, loading, error, onClose, onSave }: { products: Product[]; warehouses: Warehouse[]; loading: boolean; error: string; onClose: () => void; onSave: (values: TransferFormState) => void }) {
  const [values, setValues] = useState<TransferFormState>(() => defaultForm(products, warehouses));
  function update<K extends keyof TransferFormState>(field: K, value: TransferFormState[K]) { setValues((current) => ({ ...current, [field]: value })); }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-2xl rounded-2xl bg-white"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">Create stock transfer</h3><p className="mt-0.5 text-[10px] text-[#789083]">Records transfer movement history without changing global stock totals.</p></div><button onClick={onClose} aria-label="Close dialog"><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="grid gap-3 p-4 sm:grid-cols-2">{error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444] sm:col-span-2">{error}</div>}<label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Product</span><select value={values.productId} onChange={(event) => update("productId", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none">{products.map((item) => <option key={item.id} value={String(item.id)}>{item.name} - stock {item.stock}</option>)}</select></label><Field label="Quantity" value={values.quantity} type="number" onChange={(value) => update("quantity", value)} /><LocationSelect label="From warehouse" value={values.from} warehouses={warehouses} onChange={(value) => update("from", value)} /><LocationSelect label="To warehouse" value={values.to} warehouses={warehouses} onChange={(value) => update("to", value)} /><Field label="Requested by" value={values.requestedBy} onChange={(value) => update("requestedBy", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Transfer note</span><input value={values.notes} onChange={(event) => update("notes", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" placeholder="Reason for transfer" /></label><button disabled={loading} className="sm:col-span-2 rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save transfer"}</button></form></article></div>;
}

function LocationSelect({ label, value, warehouses, onChange }: { label: string; value: string; warehouses: Warehouse[]; onChange: (value: string) => void }) { return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none">{warehouses.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><input type={type} min={type === "number" ? "1" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none" placeholder={label} /></label>; }
