"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  deleteOfflineSale,
  getOfflineDeviceId,
  getOfflineSales,
  getOfflineSalesSummary,
  getSimulateOfflineMode,
  OFFLINE_MODE_EVENT,
  OFFLINE_SALES_EVENT,
  type OfflineSaleRecord,
  setSimulateOfflineMode,
} from "@/lib/offline-sales";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: string) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function statusLabel(status: OfflineSaleRecord["status"]) {
  const labels = {
    pending_sync: "Pending Sync",
    syncing: "Syncing",
    synced: "Synced",
    failed: "Failed",
  };
  return labels[status];
}

export function SyncCenterPage() {
  const [sales, setSales] = useState<OfflineSaleRecord[]>([]);
  const [deviceId, setDeviceId] = useState("--");
  const [online, setOnline] = useState(true);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedSale, setSelectedSale] = useState<OfflineSaleRecord | null>(null);

  const summary = useMemo(() => {
    return {
      pending: sales.filter((sale) => sale.status === "pending_sync" || sale.status === "syncing").length,
      synced: sales.filter((sale) => sale.status === "synced").length,
      failed: sales.filter((sale) => sale.status === "failed").length,
      lastSyncAttempt: sales.find((sale) => sale.syncAttempts > 0)?.updatedAt,
    };
  }, [sales]);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const records = await getOfflineSales();
      await getOfflineSalesSummary();
      setSales(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load offline sales queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleMode = () => setSimulateOffline(getSimulateOfflineMode());
    const handleSales = () => {
      void loadQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener(OFFLINE_MODE_EVENT, handleMode);
    window.addEventListener(OFFLINE_SALES_EVENT, handleSales);

    const timer = window.setTimeout(() => {
      setOnline(navigator.onLine);
      setDeviceId(getOfflineDeviceId());
      setSimulateOffline(getSimulateOfflineMode());
      void loadQueue();
    }, 0);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(OFFLINE_MODE_EVENT, handleMode);
      window.removeEventListener(OFFLINE_SALES_EVENT, handleSales);
      window.clearTimeout(timer);
    };
  }, [loadQueue]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  function toggleDemoOffline(enabled: boolean) {
    setSimulateOfflineMode(enabled);
    setSimulateOffline(enabled);
    showFeedback(enabled ? "Demo Offline Mode enabled. Sales will be saved to this device." : "Demo Offline Mode disabled. Sales will use the online database again.");
  }

  async function deleteFailedSale(sale: OfflineSaleRecord) {
    if (sale.status !== "failed") {
      showFeedback("Only failed local sales can be deleted in this MVP.");
      return;
    }
    if (!window.confirm(`Delete failed local sale ${sale.localInvoiceNumber}?`)) return;
    await deleteOfflineSale(sale.localId);
    await loadQueue();
    showFeedback("Failed local sale deleted.");
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Hybrid POS foundation</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Sync Center</h2>
          <p className="mt-1 max-w-3xl text-sm text-[#789083]">Track offline sales saved on this device. Sync to cloud will be connected in the next Hybrid POS stage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black ${online ? "border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]" : "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]"}`}>
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
            {online ? "Online" : "Offline Mode"}
          </span>
          {simulateOffline && <span className="rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-3 py-2.5 text-xs font-black text-[#8A670C]">Demo Offline Mode</span>}
          <button onClick={loadQueue} className="inline-flex items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">
            <RefreshCw size={15} /> Refresh queue
          </button>
        </div>
      </div>

      {(feedback || error) && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#D4A017]/35 bg-[#FFF9E8] text-[#8A670C]"}`}>
          {error || feedback}
        </div>
      )}

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Pending offline sales" value={summary.pending} note="Saved on this device" icon={Clock3} tone="gold" />
        <SummaryCard label="Synced sales" value={summary.synced} note="Will update after sync engine" icon={CheckCircle2} tone="green" />
        <SummaryCard label="Failed sync" value={summary.failed} note="Needs manual review" icon={AlertTriangle} tone="red" />
        <SummaryCard label="Last sync attempt" value={formatDateTime(summary.lastSyncAttempt)} note="No real sync yet" icon={RotateCcw} tone="neutral" />
        <SummaryCard label="Device queue" value={sales.length} note="Total local records" icon={Smartphone} tone="neutral" />
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <article className="rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#A57809]">Presentation control</p>
              <h3 className="mt-1 text-lg font-black text-[#173324]">Simulate Offline Mode</h3>
              <p className="mt-2 text-xs leading-5 text-[#8A670C]">Turn this on to make the Sales/POS checkout save completed sales into IndexedDB instead of calling the cloud sales API.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#D4A017]/35 bg-white px-4 py-3">
              <input checked={simulateOffline} onChange={(event) => toggleDemoOffline(event.target.checked)} type="checkbox" className="h-4 w-4 accent-[#16A34A]" />
              <span className="text-xs font-black text-[#173324]">{simulateOffline ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#789083]">Device ID</p>
          <p className="mt-2 break-all rounded-xl bg-[#F8FBF8] p-3 text-xs font-bold text-[#173324]">{deviceId}</p>
          <p className="mt-3 text-xs leading-5 text-[#789083]">This stable local ID is stored in the browser and will help prevent duplicate synced sales in the next stage.</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-black text-[#173324]">Offline sales queue</h3>
            <p className="mt-0.5 text-xs text-[#789083]">Local sales stored in this browser using IndexedDB.</p>
          </div>
          <button onClick={() => showFeedback("Sync engine comes next. This MVP only stores the offline queue safely.")} className="rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]">
            Sync engine comes next
          </button>
        </div>

        {loading ? (
          <div className="grid min-h-52 place-items-center p-8 text-center text-xs font-bold text-[#789083]">Loading offline sales queue...</div>
        ) : sales.length === 0 ? (
          <div className="grid min-h-60 place-items-center p-8 text-center">
            <div>
              <Clock3 className="mx-auto text-[#9AAEA3]" size={34} />
              <p className="mt-3 text-sm font-black text-[#173324]">No offline sales yet</p>
              <p className="mt-1 text-xs text-[#789083]">Enable Demo Offline Mode, complete a sale, then return here to see it queued.</p>
            </div>
          </div>
        ) : (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full min-w-[1160px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
                  <th className="px-4 py-3.5">Local invoice</th>
                  <th className="px-3 py-3.5">Customer</th>
                  <th className="px-3 py-3.5">Payment</th>
                  <th className="px-3 py-3.5">Total</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Created at</th>
                  <th className="px-3 py-3.5">Sync attempts</th>
                  <th className="px-3 py-3.5">Last error</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.localId} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                    <td className="px-4 py-3 font-black text-[#173324]">{sale.localInvoiceNumber}</td>
                    <td className="px-3 py-3 font-semibold">{sale.customerName}</td>
                    <td className="px-3 py-3">{sale.paymentMethod}</td>
                    <td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(sale.total)}</td>
                    <td className="px-3 py-3"><QueueStatusBadge status={sale.status} /></td>
                    <td className="px-3 py-3">{formatDateTime(sale.createdAt)}</td>
                    <td className="px-3 py-3">{sale.syncAttempts}</td>
                    <td className="max-w-[220px] truncate px-3 py-3">{sale.lastError ?? "--"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedSale(sale)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDEAE0] px-2.5 py-2 text-[10px] font-black text-[#60766B] hover:bg-[#F8FBF8]">
                          <Eye size={13} /> View
                        </button>
                        <button onClick={() => showFeedback("Retry sync placeholder. Real sync will be implemented in the next Hybrid POS stage.")} className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDEAE0] px-2.5 py-2 text-[10px] font-black text-[#60766B] hover:bg-[#F8FBF8]">
                          <RotateCcw size={13} /> Retry
                        </button>
                        <button onClick={() => void deleteFailedSale(sale)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#EF4444]/20 px-2.5 py-2 text-[10px] font-black text-[#EF4444] hover:bg-[#EF4444]/10">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSale && <SaleDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}

function SummaryCard({ label, value, note, icon: Icon, tone }: { label: string; value: string | number; note: string; icon: typeof Clock3; tone: "green" | "gold" | "red" | "neutral" }) {
  const tones = {
    green: "bg-[#16A34A]/10 text-[#0F8C42]",
    gold: "bg-[#D4A017]/12 text-[#9A7108]",
    red: "bg-[#EF4444]/10 text-[#EF4444]",
    neutral: "bg-[#F8FBF8] text-[#60766B]",
  };
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p>
      <p className="mt-1 text-lg font-black tracking-tight text-[#173324]">{value}</p>
      <p className="mt-1 text-[11px] text-[#789083]">{note}</p>
    </article>
  );
}

function QueueStatusBadge({ status }: { status: OfflineSaleRecord["status"] }) {
  const tone = status === "synced" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "failed" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#D4A017]/12 text-[#9A7108]";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{statusLabel(status)}</span>;
}

function SaleDetailsModal({ sale, onClose }: { sale: OfflineSaleRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4">
      <article className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8F0EA] p-4">
          <div>
            <h3 className="text-sm font-black text-[#173324]">Offline sale details</h3>
            <p className="text-[10px] text-[#789083]">{sale.localInvoiceNumber}</p>
          </div>
          <button onClick={onClose} aria-label="Close sale details" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]"><X size={16} /></button>
        </div>
        <div className="p-5">
          <div className="grid gap-2 rounded-xl border border-[#E8F0EA] bg-[#F8FBF8] p-3 text-[11px] text-[#60766B]">
            <p className="flex justify-between gap-3"><span>Customer</span><b className="text-right text-[#173324]">{sale.customerName}</b></p>
            <p className="flex justify-between gap-3"><span>Payment</span><b className="text-right text-[#173324]">{sale.paymentMethod}</b></p>
            <p className="flex justify-between gap-3"><span>Status</span><b className="text-right text-[#8A670C]">{statusLabel(sale.status)}</b></p>
            <p className="flex justify-between gap-3"><span>Created</span><b className="text-right text-[#173324]">{formatDateTime(sale.createdAt)}</b></p>
          </div>
          <div className="mt-4 space-y-2">
            {sale.items.map((item) => (
              <div key={`${item.productId}-${item.quantity}`} className="flex justify-between gap-4 rounded-xl border border-[#E8F0EA] p-3 text-xs">
                <span className="text-[#60766B]">{item.quantity} x {item.productName}</span>
                <b className="shrink-0 text-[#173324]">{formatCurrency(item.total)}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-dashed border-[#DDEAE0] pt-3 text-[11px]">
            <p className="flex justify-between text-sm font-black text-[#173324]"><span>Total</span><span>{formatCurrency(sale.total)}</span></p>
            <p className="flex justify-between text-[#0F8C42]"><span>Paid</span><b>{formatCurrency(sale.paid)}</b></p>
            <p className="flex justify-between text-[#EF4444]"><span>Due</span><b>{formatCurrency(sale.due)}</b></p>
          </div>
        </div>
      </article>
    </div>
  );
}
