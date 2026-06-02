"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Minus,
  PackageSearch,
  Plus,
  Printer,
  ReceiptText,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { customers, recentSales, salesProducts, type SalesProduct } from "@/lib/sales-mock-data";

type PaymentMethod = "Cash" | "M-Pesa" | "Bank" | "Credit / Debt";
type CartItem = SalesProduct & { quantity: number };
type Receipt = {
  invoice: string;
  customer: string;
  payment: PaymentMethod;
  items: CartItem[];
  total: number;
  paid: number;
  due: number;
};

const paymentMethods = [
  { label: "Cash" as const, icon: Banknote },
  { label: "M-Pesa" as const, icon: Smartphone },
  { label: "Bank" as const, icon: Building2 },
  { label: "Credit / Debt" as const, icon: CreditCard },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SalesRegister() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("walk-in");
  const [customerQuery, setCustomerQuery] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("M-Pesa");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const categories = ["All", ...Array.from(new Set(salesProducts.map((product) => product.category)))];
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone}`.toLowerCase().includes(customerQuery.trim().toLowerCase()),
  );
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return salesProducts.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = !normalized || `${product.name} ${product.code}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: SalesProduct) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity: 1 }];
      if (existing.quantity >= product.stock) return current;
      return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    });
  }

  function changeQuantity(productId: number, adjustment: number) {
    setCart((current) =>
      current
        .map((item) => item.id === productId
          ? { ...item, quantity: Math.min(item.stock, item.quantity + adjustment) }
          : item)
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function completeSale() {
    if (cart.length === 0) return;
    const due = payment === "Credit / Debt" ? subtotal : 0;
    setReceipt({
      invoice: "INV-2849",
      customer: selectedCustomer.name,
      payment,
      items: cart,
      total: subtotal,
      paid: subtotal - due,
      due,
    });
    setCart([]);
  }

  return (
    <div className="mx-auto max-w-[1750px]">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Sales workspace</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">POS checkout</h2>
          <p className="mt-1 text-sm text-[#789083]">Create a sale, collect payment and issue a receipt.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-xs font-bold text-[#60766B]">Branch: Nairobi CBD</span>
          <span className="rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-xs font-bold text-[#60766B]">Till: Main Counter</span>
        </div>
      </div>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
          <div className="border-b border-[#E8F0EA] p-4">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search sales products"
                placeholder="Search product name or code..."
                className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-xs outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]"
              />
            </label>
            <div className="table-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-bold ${
                    category === item ? "bg-[#12311F] text-white" : "border border-[#DDEAE0] bg-white text-[#60766B] hover:bg-[#F5FAF6]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.id === product.id);
              return (
                <article key={product.id} className="rounded-xl border border-[#E8F0EA] p-3 hover:border-[#16A34A]/50 hover:shadow-md hover:shadow-[#12311F]/5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid h-12 w-12 place-items-center rounded-xl text-xl ${product.tone}`}>{product.emoji}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${product.stock < 10 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#16A34A]/10 text-[#0F8C42]"}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                  <p className="mt-3 min-h-8 text-xs font-black leading-4 text-[#173324]">{product.name}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#9AAEA3]">{product.code} · {product.unit}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <strong className="text-sm text-[#173324]">{formatCurrency(product.price)}</strong>
                    <button
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                      className={`grid h-9 w-9 place-items-center rounded-lg ${
                        inCart ? "bg-[#12311F] text-[#22C55E]" : "bg-[#16A34A] text-white hover:bg-[#12883E]"
                      }`}
                    >
                      {inCart ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="grid min-h-52 place-items-center p-8 text-center">
              <div>
                <PackageSearch className="mx-auto text-[#9AAEA3]" size={30} />
                <p className="mt-3 text-sm font-black text-[#173324]">No matching products</p>
                <p className="mt-1 text-xs text-[#789083]">Try another product or category.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5 xl:sticky xl:top-[96px]">
          <div className="flex items-center justify-between border-b border-[#E8F0EA] bg-[#12311F] px-4 py-4 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-[#22C55E]" />
              <h3 className="text-sm font-black">Current order</h3>
            </div>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-[#B8C7BD]">{itemCount} items</span>
          </div>

          <div className="max-h-[290px] overflow-y-auto p-3">
            {cart.length === 0 ? (
              <div className="grid min-h-40 place-items-center text-center">
                <div>
                  <ShoppingBag className="mx-auto text-[#CBD8CF]" size={30} />
                  <p className="mt-2 text-xs font-black text-[#60766B]">Your cart is empty</p>
                  <p className="mt-1 text-[11px] text-[#9AAEA3]">Add products to start a sale.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[#E8F0EA] p-2.5">
                    <div className="flex items-start gap-2">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base ${item.tone}`}>{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-black text-[#173324]">{item.name}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#789083]">{formatCurrency(item.price)} each</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="text-[#9AAEA3] hover:text-[#EF4444]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-[#DDEAE0]">
                        <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${item.name}`} className="grid h-7 w-7 place-items-center text-[#60766B] hover:bg-[#F5FAF6]"><Minus size={12} /></button>
                        <span className="min-w-7 text-center text-[11px] font-black text-[#173324]">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${item.name}`} className="grid h-7 w-7 place-items-center text-[#60766B] hover:bg-[#F5FAF6]"><Plus size={12} /></button>
                      </div>
                      <strong className="text-xs text-[#173324]">{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#E8F0EA] p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-[#173324]">Customer</p>
              <button className="flex items-center gap-1 text-[10px] font-black text-[#16A34A]"><UserPlus size={13} /> Add customer</button>
            </div>
            <label className="relative mt-2 block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAEA3]" size={14} />
              <input
                value={customerQuery}
                onChange={(event) => setCustomerQuery(event.target.value)}
                aria-label="Search customers"
                placeholder="Search/select customer..."
                className="w-full rounded-lg border border-[#DDEAE0] bg-[#F8FBF8] py-2 pl-8 pr-3 text-[11px] outline-none focus:border-[#16A34A]"
              />
            </label>
            <div className="table-scroll mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-2 text-left ${
                    customer.id === selectedCustomerId ? "bg-[#16A34A]/10 text-[#0F8C42]" : "border border-[#E8F0EA] text-[#789083]"
                  }`}
                >
                  <span className="block text-[10px] font-black">{customer.name}</span>
                  <span className="mt-0.5 block text-[9px]">{customer.phone}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E8F0EA] p-3">
            <p className="text-xs font-black text-[#173324]">Payment method</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {paymentMethods.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setPayment(label)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-[10px] font-black ${
                    payment === label ? "bg-[#12311F] text-white" : "border border-[#DDEAE0] text-[#60766B] hover:bg-[#F8FBF8]"
                  }`}
                >
                  <Icon size={14} className={payment === label ? "text-[#22C55E]" : "text-[#789083]"} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E8F0EA] bg-[#F8FBF8] p-4">
            <div className="flex items-center justify-between text-xs text-[#789083]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#789083]"><span>Tax</span><span>KES 0</span></div>
            <div className="mt-3 flex items-center justify-between border-t border-[#DDEAE0] pt-3">
              <span className="text-sm font-black text-[#173324]">Total</span>
              <span className="text-xl font-black tracking-tight text-[#173324]">{formatCurrency(subtotal)}</span>
            </div>
            <button
              onClick={completeSale}
              disabled={cart.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF] disabled:shadow-none"
            >
              <CircleDollarSign size={17} /> Complete sale
            </button>
          </div>
        </aside>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-black text-[#173324]">Recent sales</h3>
            <p className="mt-0.5 text-xs text-[#789083]">Completed transactions from today&apos;s register.</p>
          </div>
          <button className="flex w-fit items-center gap-2 rounded-lg border border-[#DDEAE0] px-3 py-2 text-[11px] font-bold text-[#60766B]">
            View all sales <ChevronDown size={14} />
          </button>
        </div>
        <div className="table-scroll overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
                <th className="px-4 py-3.5">Invoice</th>
                <th className="px-3 py-3.5">Customer</th>
                <th className="px-3 py-3.5">Payment method</th>
                <th className="px-3 py-3.5">Total</th>
                <th className="px-3 py-3.5">Paid</th>
                <th className="px-3 py-3.5">Due</th>
                <th className="px-3 py-3.5">Cashier</th>
                <th className="px-3 py-3.5">Date / time</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.invoice} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                  <td className="px-4 py-3 font-black text-[#173324]">{sale.invoice}</td>
                  <td className="px-3 py-3 font-semibold">{sale.customer}</td>
                  <td className="px-3 py-3">{sale.payment}</td>
                  <td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(sale.total)}</td>
                  <td className="px-3 py-3 text-[#0F8C42]">{formatCurrency(sale.paid)}</td>
                  <td className="px-3 py-3 text-[#EF4444]">{formatCurrency(sale.due)}</td>
                  <td className="px-3 py-3">{sale.cashier}</td>
                  <td className="px-3 py-3">{sale.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={sale.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: "Paid" | "Partial" | "Due" }) {
  const tone = status === "Paid"
    ? "bg-[#16A34A]/10 text-[#0F8C42]"
    : status === "Partial"
      ? "bg-[#D4A017]/12 text-[#9A7108]"
      : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>;
}

function ReceiptModal({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4">
      <article className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8F0EA] p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><ReceiptText size={17} /></span>
            <div>
              <h3 className="text-sm font-black text-[#173324]">Sale completed</h3>
              <p className="text-[10px] text-[#789083]">Receipt summary · {receipt.invoice}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close receipt" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><X size={16} /></button>
        </div>
        <div className="p-5">
          <div className="text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#12311F] text-sm font-black text-white">B</span>
            <p className="mt-2 text-sm font-black text-[#173324]">BIASHARA CLOUD POS</p>
            <p className="mt-0.5 text-[10px] text-[#789083]">Nairobi CBD · Till: Main Counter</p>
          </div>
          <div className="mt-4 space-y-1 border-y border-dashed border-[#DDEAE0] py-3 text-[11px] text-[#60766B]">
            <p className="flex justify-between"><span>Invoice</span><b className="text-[#173324]">{receipt.invoice}</b></p>
            <p className="flex justify-between"><span>Customer</span><b className="text-[#173324]">{receipt.customer}</b></p>
            <p className="flex justify-between"><span>Cashier</span><b className="text-[#173324]">James Mwangi</b></p>
            <p className="flex justify-between"><span>Payment</span><b className="text-[#173324]">{receipt.payment}</b></p>
          </div>
          <div className="space-y-2 py-3">
            {receipt.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-[11px]">
                <span className="text-[#60766B]">{item.quantity} × {item.name}</span>
                <b className="shrink-0 text-[#173324]">{formatCurrency(item.quantity * item.price)}</b>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-dashed border-[#DDEAE0] pt-3 text-[11px]">
            <p className="flex justify-between text-sm font-black text-[#173324]"><span>Total</span><span>{formatCurrency(receipt.total)}</span></p>
            <p className="flex justify-between text-[#0F8C42]"><span>Paid</span><b>{formatCurrency(receipt.paid)}</b></p>
            <p className="flex justify-between text-[#EF4444]"><span>Due</span><b>{formatCurrency(receipt.due)}</b></p>
          </div>
          <p className="mt-4 text-center text-[10px] font-bold text-[#789083]">Thank you for shopping with us.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[#DDEAE0] py-3 text-xs font-black text-[#60766B]"><Printer size={15} /> Print receipt</button>
            <button onClick={onClose} className="rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white hover:bg-[#12883E]">New sale</button>
          </div>
        </div>
      </article>
    </div>
  );
}
