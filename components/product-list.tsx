"use client";

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
import { products } from "@/lib/mock-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductList() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");

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
  }, [category, query]);

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Inventory management</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Product list</h2>
          <p className="mt-1 text-sm text-[#789083]">Manage stock details, prices and warehouse placement.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-2.5 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            <Upload size={15} /> Import
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-2.5 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            <Download size={15} /> Export
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

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
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-2.5 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
              <Filter size={14} /> More filters
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#789083]">
            <span><b className="text-[#173324]">{filteredProducts.length}</b> products</span>
            <span className="h-4 w-px bg-[#DDEAE0]" />
            <span><b className="text-[#EF4444]">3</b> low stock</span>
          </div>
        </div>

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
                        <button aria-label={`View ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></button>
                        <button aria-label={`Edit ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></button>
                        <button aria-label={`Delete ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></button>
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
                <button aria-label={`More actions for ${product.name}`} className="text-[#789083]"><MoreHorizontal size={17} /></button>
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
              <p className="mt-3 text-sm font-black text-[#173324]">No matching products</p>
              <p className="mt-1 text-xs text-[#789083]">Adjust the search or category filter.</p>
            </div>
          </div>
        )}

        <footer className="flex flex-col justify-between gap-3 border-t border-[#E8F0EA] p-4 text-xs text-[#789083] sm:flex-row sm:items-center">
          <span>Showing <b className="text-[#173324]">{filteredProducts.length}</b> of <b className="text-[#173324]">{products.length}</b> products</span>
          <div className="flex gap-1">
            <button className="rounded-lg border border-[#DDEAE0] px-3 py-2 font-bold text-[#9AAEA3]">Previous</button>
            <button className="rounded-lg bg-[#16A34A] px-3 py-2 font-black text-white">1</button>
            <button className="rounded-lg border border-[#DDEAE0] px-3 py-2 font-bold text-[#60766B]">Next</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
