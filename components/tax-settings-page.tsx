"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Calculator, FileText, Landmark, ReceiptText, Save, Settings2, ShieldCheck } from "lucide-react";
import { taxRecords } from "@/lib/finance-mock-data";
import type { TaxSettings } from "@/lib/finance-data";

const defaultSettings: TaxSettings = {
  vatEnabled: true,
  vatRate: 16,
  mode: "inclusive",
  invoicePrefix: "TAX-INV-",
  etimsStatus: "Not connected",
  businessPin: "",
};

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

export function TaxSettingsPage() {
  const [settings, setSettings] = useState<TaxSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const collected = taxRecords.reduce((sum, item) => sum + item.vatCollected, 0);
  const invoices = taxRecords.reduce((sum, item) => sum + item.invoices, 0);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tax-settings");
      if (!response.ok) throw new Error("Failed to load tax settings.");
      const json = (await response.json()) as { data: TaxSettings };
      setSettings(json.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Tax settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSettings();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const response = await fetch("/api/tax-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await response.json()) as { data?: TaxSettings; error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Tax settings could not be saved.");
      if (json.data) setSettings(json.data);
      setFeedback(json.message ?? "Tax settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Tax settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Compliance settings</p>
        <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Tax Settings</h2>
        <p className="mt-1 text-sm text-[#789083]">Configure VAT, invoice numbering and tax integration placeholders.</p>
        {(feedback || error) && <p className={`mt-2 text-xs font-bold ${error ? "text-[#EF4444]" : "text-[#16A34A]"}`}>{error || feedback}</p>}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={Calculator} label="VAT rate" value={`${settings.vatRate}%`} note={settings.vatEnabled ? `${settings.mode} pricing` : "VAT disabled"} />
        <Summary icon={ReceiptText} label="Tax invoices" value={`${invoices}`} note={`${settings.invoicePrefix} numbering placeholder`} />
        <Summary icon={Landmark} label="VAT collected" value={money(collected)} note="Mock tax ledger total" />
        <Summary icon={ShieldCheck} label="eTIMS status" value={settings.etimsStatus} note="Integration placeholder" gold />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={saveSettings} className="rounded-2xl border border-[#DDEAE0] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Settings2 size={18} /></span>
            <div><h3 className="font-black text-[#173324]">Tax configuration</h3><p className="text-xs text-[#789083]">{loading ? "Loading saved settings..." : "Settings persist to the business account."}</p></div>
          </div>
          <div className="mt-5 space-y-3">
            <Toggle label="VAT enabled" note="Apply VAT calculations during checkout later" checked={settings.vatEnabled} onChange={(vatEnabled) => setSettings((current) => ({ ...current, vatEnabled }))} />
            <Field label="VAT rate" type="number" value={String(settings.vatRate)} onChange={(vatRate) => setSettings((current) => ({ ...current, vatRate: Number(vatRate) }))} />
            <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Tax pricing mode</span><select value={settings.mode} onChange={(event) => setSettings((current) => ({ ...current, mode: event.target.value as TaxSettings["mode"] }))} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option value="inclusive">Tax inclusive</option><option value="exclusive">Tax exclusive</option></select></label>
            <Field label="Tax invoice prefix" value={settings.invoicePrefix} onChange={(invoicePrefix) => setSettings((current) => ({ ...current, invoicePrefix }))} />
            <Field label="Next invoice number placeholder" value="0002849" onChange={() => undefined} disabled />
            <Field label="Business PIN optional" value={settings.businessPin} onChange={(businessPin) => setSettings((current) => ({ ...current, businessPin }))} />
            <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">eTIMS integration status</span><select value={settings.etimsStatus} onChange={(event) => setSettings((current) => ({ ...current, etimsStatus: event.target.value }))} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Not connected</option><option>Pending setup</option><option>Connected</option></select></label>
            <div className="rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] p-3">
              <p className="text-xs font-black text-[#8A670C]">eTIMS integration placeholder</p>
              <p className="mt-1 text-[11px] leading-5 text-[#9A7108]">API credentials and fiscal submission will be connected in a later backend phase.</p>
            </div>
            <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white disabled:opacity-60"><Save size={15} />{saving ? "Saving..." : "Save tax settings"}</button>
          </div>
        </form>

        <article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
          <div className="flex items-center gap-3 border-b border-[#E8F0EA] p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><FileText size={18} /></span>
            <div><h3 className="font-black text-[#173324]">Tax records</h3><p className="text-xs text-[#789083]">VAT summary by reporting period.</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Record", "Period", "Taxable sales", "VAT collected", "Invoices", "Status"].map((h) => <th key={h} className="px-4 py-3.5">{h}</th>)}</tr></thead>
              <tbody>{taxRecords.map((r) => <tr key={r.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{r.id}</td><td className="px-4 py-3">{r.period}</td><td className="px-4 py-3">{money(r.taxableSales)}</td><td className="px-4 py-3 font-black text-[#173324]">{money(r.vatCollected)}</td><td className="px-4 py-3">{r.invoices}</td><td className="px-4 py-3"><span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-black text-[#0F8C42]">{r.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function Summary({ icon: Icon, label, value, note, gold }: { icon: typeof ReceiptText; label: string; value: string; note: string; gold?: boolean }) {
  return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className="mt-1 text-lg font-black text-[#173324]">{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>;
}

function Toggle({ label, note, checked, onChange }: { label: string; note: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border border-[#DDEAE0] p-3"><span><b className="block text-xs text-[#173324]">{label}</b><span className="mt-1 block text-[10px] text-[#789083]">{note}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function Field({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><input disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A] disabled:bg-[#F8FBF8] disabled:text-[#789083]" /></label>;
}
