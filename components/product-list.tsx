"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import type { Product } from "@/lib/mock-data";
import { exportToCsv } from "@/lib/export";

type ProductFormState = {
  name: string;
  description: string;
  code: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: string;
  salePrice: string;
  stock: string;
  reorderLevel: string;
  warehouse: string;
  rack: string;
  shelf: string;
  imageUrl: string;
  status: string;
};

type ProductDialogState =
  | { mode: "add"; product?: undefined }
  | { mode: "edit"; product: Product };

const defaultForm: ProductFormState = {
  name: "",
  description: "",
  code: "",
  sku: "",
  barcode: "",
  category: "General",
  brand: "",
  unit: "Piece",
  purchasePrice: "",
  salePrice: "",
  stock: "0",
  reorderLevel: "0",
  warehouse: "Main Warehouse",
  rack: "",
  shelf: "",
  imageUrl: "",
  status: "active",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductList({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialog, setDialog] = useState<ProductDialogState | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const categories = ["All categories", ...Array.from(new Set(products.map((product) => product.category)))];
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "All categories" || product.category === category;
      const matchesQuery =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.code.toLowerCase().includes(normalized) ||
        product.warehouse.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, products]);

  const lowStockCount = products.filter((product) => product.stock < (product.reorderLevel ?? 10)).length;

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshProducts() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed to load products.");
    setProducts(payload.data);
  }

  function openAddDialog() {
    setError("");
    setDialog({ mode: "add" });
  }

  function openEditDialog(product: Product) {
    setError("");
    setDialog({ mode: "edit", product });
  }

  async function saveProduct(values: ProductFormState) {
    setError("");
    const purchasePrice = Number(values.purchasePrice);
    const salePrice = Number(values.salePrice);
    const stock = Number(values.stock);

    if (!values.name.trim()) return setError("Product name is required.");
    if (!values.code.trim()) return setError("Product code is required.");
    if (!Number.isFinite(purchasePrice)) return setError("Purchase price is required.");
    if (!Number.isFinite(salePrice)) return setError("Sale price is required.");
    if (!Number.isFinite(stock) || stock < 0) return setError("Stock cannot be negative.");
    if (salePrice < purchasePrice && !window.confirm("Sale price is lower than purchase price. Continue anyway?")) return;

    const body = {
      ...values,
      purchasePrice,
      salePrice,
      stock,
      reorderLevel: Number(values.reorderLevel || 0),
    };

    setLoading(true);
    try {
      const isEdit = dialog?.mode === "edit";
      const url = isEdit ? `/api/products/${dialog.product.id}` : "/api/products";
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save product.");
      await refreshProducts();
      setDialog(null);
      showFeedback(isEdit ? "Product updated successfully." : "Product added successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateProduct(product: Product) {
    if (!window.confirm(`Deactivate ${product.name}? It will be removed from the visible product list.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to deactivate product.");
      await refreshProducts();
      showFeedback("Product deactivated successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to deactivate product.");
    } finally {
      setLoading(false);
    }
  }

  function exportProducts() {
    const ok = exportToCsv("leadsstacks-products.csv", filteredProducts.map((product) => ({
      name: product.name,
      code: product.code,
      category: product.category,
      warehouse: product.warehouse,
      unit: product.unit,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stock: product.stock,
      reorderLevel: product.reorderLevel ?? 0,
      rack: product.rack,
      shelf: product.shelf,
      status: product.status ?? "active",
    })));
    showFeedback(ok ? "Product CSV exported." : "No products to export.");
  }

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Inventory management</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Product list</h2>
          <p className="mt-1 text-sm text-[#789083]">Manage stock details, prices and warehouse placement.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled title="Bulk import coming soon" className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#DDEAE0] bg-[#F5FAF6] px-3.5 py-2.5 text-xs font-bold text-[#9AAEA3]">
            <Upload size={15} /> Import coming soon
          </button>
          <button onClick={exportProducts} className="flex items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-2.5 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            <Download size={15} /> Export
          </button>
          <button onClick={openAddDialog} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      {(feedback || error) && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>
          {error || feedback}
        </div>
      )}

      <section className="rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 xl:flex-row xl:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <label className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search products"
                placeholder="Search product, code or warehouse..."
                className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]"
              />
            </label>
            <label className="relative">
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-full min-w-44 appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] outline-none focus:border-[#16A34A]"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} />
            </label>
            <button disabled title="Advanced filters coming soon" className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#DDEAE0] bg-[#F5FAF6] px-3.5 py-2.5 text-xs font-bold text-[#9AAEA3]">
              <Filter size={14} /> More filters soon
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#789083]">
            <span><b className="text-[#173324]">{filteredProducts.length}</b> products</span>
            <span className="h-4 w-px bg-[#DDEAE0]" />
            <span><b className="text-[#EF4444]">{lowStockCount}</b> low stock</span>
          </div>
        </div>

        {loading && (
          <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">
            Updating products...
          </div>
        )}

        <div className="hidden overflow-hidden lg:block">
          <div className="table-scroll overflow-x-auto">
            <table className="w-full min-w-[1450px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-3 py-3.5">Code</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Warehouse</th>
                  <th className="px-3 py-3.5">Unit</th>
                  <th className="px-3 py-3.5">Purchase price</th>
                  <th className="px-3 py-3.5">Sale price</th>
                  <th className="px-3 py-3.5">Stock</th>
                  <th className="px-3 py-3.5">Rack</th>
                  <th className="px-3 py-3.5">Shelf</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${product.tone}`}>
                          {product.emoji}
                        </span>
                        <span className="max-w-[220px] font-bold leading-4 text-[#173324]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#789083]">{product.code}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-[#16A34A]/8 px-2.5 py-1 text-[10px] font-bold text-[#0F8C42]">{product.category}</span></td>
                    <td className="px-3 py-3 font-semibold">{product.warehouse}</td>
                    <td className="px-3 py-3">{product.unit}</td>
                    <td className="px-3 py-3 font-semibold">{formatCurrency(product.purchasePrice)}</td>
                    <td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(product.salePrice)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${product.stock < 10 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#16A34A]/10 text-[#0F8C42]"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3">{product.rack}</td>
                    <td className="px-3 py-3">{product.shelf}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></Link>
                        <button onClick={() => openEditDialog(product)} aria-label={`Edit ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></button>
                        <button onClick={() => deactivateProduct(product)} aria-label={`Deactivate ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {filteredProducts.map((product) => (
            <article key={product.id} className="rounded-xl border border-[#E8F0EA] p-3">
              <div className="flex items-start gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${product.tone}`}>{product.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black leading-4 text-[#173324]">{product.name}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#789083]">{product.code} · {product.category}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditDialog(product)} aria-label={`Edit ${product.name}`} className="text-[#789083]"><Pencil size={15} /></button>
                  <button onClick={() => deactivateProduct(product)} aria-label={`Deactivate ${product.name}`} className="text-[#EF4444]"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]">
                <span><b className="block text-[#789083]">Sale price</b><strong className="mt-1 block text-[#173324]">{formatCurrency(product.salePrice)}</strong></span>
                <span><b className="block text-[#789083]">Stock</b><strong className={`mt-1 block ${product.stock < 10 ? "text-[#EF4444]" : "text-[#0F8C42]"}`}>{product.stock} {product.unit}</strong></span>
                <span><b className="block text-[#789083]">Location</b><strong className="mt-1 block text-[#173324]">{product.rack} · {product.shelf}</strong></span>
              </div>
              <p className="mt-2 text-[10px] text-[#789083]">{product.warehouse}</p>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <PackagePlus className="mx-auto text-[#9AAEA3]" size={32} />
              <p className="mt-3 text-sm font-black text-[#173324]">{products.length === 0 ? "No products yet" : "No matching products"}</p>
              <p className="mt-1 text-xs text-[#789083]">{products.length === 0 ? "Add your first product to start selling." : "Adjust the search or category filter."}</p>
            </div>
          </div>
        )}

        <footer className="flex flex-col justify-between gap-3 border-t border-[#E8F0EA] p-4 text-xs text-[#789083] sm:flex-row sm:items-center">
          <span>Showing <b className="text-[#173324]">{filteredProducts.length}</b> of <b className="text-[#173324]">{products.length}</b> products</span>
          <div className="flex gap-1">
            <button disabled title="Pagination is not needed until more products are loaded" className="cursor-not-allowed rounded-lg border border-[#DDEAE0] px-3 py-2 font-bold text-[#9AAEA3]">Previous</button>
            <button className="rounded-lg bg-[#16A34A] px-3 py-2 font-black text-white">1</button>
            <button disabled title="Pagination is not needed until more products are loaded" className="cursor-not-allowed rounded-lg border border-[#DDEAE0] px-3 py-2 font-bold text-[#9AAEA3]">Next</button>
          </div>
        </footer>
      </section>

      {dialog && <ProductDialog state={dialog} loading={loading} error={error} onClose={() => setDialog(null)} onSave={saveProduct} />}
    </div>
  );
}

function formFromProduct(product?: Product): ProductFormState {
  if (!product) return defaultForm;
  const status = product.status?.toLowerCase() === "inactive" ? "inactive" : "active";
  return {
    name: product.name,
    description: product.description ?? "",
    code: product.code,
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    category: product.category,
    brand: product.brand ?? "",
    unit: product.unit,
    purchasePrice: String(product.purchasePrice),
    salePrice: String(product.salePrice),
    stock: String(product.stock),
    reorderLevel: String(product.reorderLevel ?? 0),
    warehouse: product.warehouse,
    rack: product.rack === "-" ? "" : product.rack,
    shelf: product.shelf === "-" ? "" : product.shelf,
    imageUrl: product.imageUrl ?? "",
    status,
  };
}

function ProductDialog({ state, loading, error, onClose, onSave }: { state: ProductDialogState; loading: boolean; error: string; onClose: () => void; onSave: (values: ProductFormState) => void }) {
  const [values, setValues] = useState<ProductFormState>(() => formFromProduct(state.product));
  const title = state.mode === "add" ? "Add product" : `Edit ${state.product.name}`;

  function update(field: keyof ProductFormState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(values);
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4">
      <article className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E8F0EA] p-4">
          <div>
            <h3 className="text-sm font-black text-[#173324]">{title}</h3>
            <p className="mt-1 text-[11px] text-[#789083]">Products are saved to the business database.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#789083] hover:bg-[#F5FAF6]" aria-label="Close product form">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-4">
          {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Product name" required value={values.name} onChange={(value) => update("name", value)} />
            <Field label="Product code" required value={values.code} onChange={(value) => update("code", value)} />
            <Field label="SKU" value={values.sku} onChange={(value) => update("sku", value)} />
            <Field label="Barcode" value={values.barcode} onChange={(value) => update("barcode", value)} />
            <Field label="Category" value={values.category} onChange={(value) => update("category", value)} />
            <Field label="Brand" value={values.brand} onChange={(value) => update("brand", value)} />
            <Field label="Unit" value={values.unit} onChange={(value) => update("unit", value)} />
            <Field label="Purchase price" required type="number" value={values.purchasePrice} onChange={(value) => update("purchasePrice", value)} />
            <Field label="Sale price" required type="number" value={values.salePrice} onChange={(value) => update("salePrice", value)} />
            <Field label="Opening stock" type="number" value={values.stock} onChange={(value) => update("stock", value)} />
            <Field label="Reorder level" type="number" value={values.reorderLevel} onChange={(value) => update("reorderLevel", value)} />
            <Field label="Warehouse" value={values.warehouse} onChange={(value) => update("warehouse", value)} />
            <Field label="Rack" value={values.rack} onChange={(value) => update("rack", value)} />
            <Field label="Shelf" value={values.shelf} onChange={(value) => update("shelf", value)} />
            <Field label="Image URL" value={values.imageUrl} onChange={(value) => update("imageUrl", value)} />
            <label>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span>
              <select value={values.status} onChange={(event) => update("status", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="md:col-span-2 xl:col-span-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Description</span>
              <textarea value={values.description} onChange={(event) => update("description", event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" placeholder="Describe the product..." />
            </label>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button>
            <button disabled={loading} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save product"}</button>
          </div>
        </form>
      </article>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span>
      <input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" />
    </label>
  );
}
