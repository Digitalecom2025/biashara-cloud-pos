"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Building2, Check, ChevronRight, CloudDownload, CreditCard, Image as ImageIcon, Printer, Save, Settings2, ShieldCheck, SlidersHorizontal, Smartphone, Store, Users, Crown } from "lucide-react";
import { defaultSettings, industryModes } from "@/lib/settings-options";
import { getIndustryOpsConfig } from "@/lib/industryops";

type SettingsForm = {
  name: string;
  phone: string;
  email: string;
  location: string;
  industryMode: string;
  packagePlan: string;
  businessLogoUrl: string;
  receiptTitle: string;
  receiptFooterNote: string;
  showBusinessPhone: boolean;
  showCashierName: boolean;
  showCustomerBalance: boolean;
  receiptPaperSize: string;
  defaultCurrency: string;
  defaultPaymentMethod: string;
  lowStockAlertThreshold: number;
  timezone: string;
  dateFormat: string;
  enableTax: boolean;
  enableRewards: boolean;
  enableSmsReminders: boolean;
};

type SettingsApiData = {
  business: {
    name: string;
    phone: string;
    email: string;
    location: string;
    industryMode: string;
    packagePlan: string;
  };
  settings: Omit<SettingsForm, "name" | "phone" | "email" | "location" | "industryMode" | "packagePlan">;
};

const initialForm: SettingsForm = {
  name: "LeadsStacks POS Trial",
  phone: "+254 712 345 678",
  email: "admin@leadsstacks.co.ke",
  location: "Nairobi",
  industryMode: "Retail",
  packagePlan: "Business",
  ...defaultSettings,
};

export function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(initialForm);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to load settings.");
      const json = (await response.json()) as { data: SettingsApiData };
      setForm({ ...json.data.business, ...json.data.settings });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Settings could not be loaded.");
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

  function update(next: Partial<SettingsForm>) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function saveSettings() {
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await response.json()) as { data?: SettingsApiData; error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Settings could not be saved.");
      if (json.data) setForm({ ...json.data.business, ...json.data.settings });
      setFeedback(json.message ?? "Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const industryPreview = getIndustryOpsConfig(form.industryMode);

  return (
    <div className="mx-auto max-w-[1650px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Business configuration</p>
          <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Settings</h2>
          <p className="mt-1 text-sm text-[#789083]">{loading ? "Loading saved business settings..." : "Manage business identity, checkout preferences and system defaults."}</p>
          {error && <p className="mt-2 text-xs font-bold text-[#EF4444]">{error}</p>}
        </div>
        <div>
          <button disabled={saving} onClick={saveSettings} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60"><Save size={15} />{saving ? "Saving..." : "Save settings"}</button>
          {feedback && <p className="mt-2 text-xs font-bold text-[#16A34A]">{feedback}</p>}
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel icon={Building2} title="Business profile" note="Identity shown on receipts and reports.">
            <div className="grid gap-4 sm:grid-cols-[130px_1fr]">
              <button onClick={() => setFeedback("Paste the business logo URL in the field beside this card, then save settings.")} className="grid min-h-28 place-items-center rounded-xl border border-dashed border-[#C9DACC] bg-[#F8FBF8] text-center text-[#789083]"><span><ImageIcon size={22} className="mx-auto" /><b className="mt-2 block text-[10px]">Business logo</b><span className="mt-1 block text-[9px]">Paste URL beside this card</span></span></button>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Business name" value={form.name} onChange={(name) => update({ name })} />
                <Field label="Phone number" value={form.phone} onChange={(phone) => update({ phone })} />
                <Field label="Email" value={form.email} onChange={(email) => update({ email })} />
                <Field label="Business location" value={form.location} onChange={(location) => update({ location })} />
                <Field label="Business logo URL" value={form.businessLogoUrl} onChange={(businessLogoUrl) => update({ businessLogoUrl })} />
                <Field label="Receipt footer note" value={form.receiptFooterNote} onChange={(receiptFooterNote) => update({ receiptFooterNote })} />
              </div>
            </div>
          </Panel>

          <Panel icon={SlidersHorizontal} title="IndustryOps mode" note="Choose the workflow profile that best matches your operation.">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{industryModes.map((item) => <button key={item} onClick={() => update({ industryMode: item })} className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-black ${form.industryMode === item ? "border-[#16A34A] bg-[#16A34A]/8 text-[#0F8C42]" : "border-[#DDEAE0] text-[#60766B]"}`}>{item}{form.industryMode === item && <Check size={15} />}</button>)}</div>
            <div className="mt-4 rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#8A670C]">Mode preview</p>
                  <h4 className="mt-1 text-sm font-black text-[#173324]">{industryPreview.dashboardTitle}</h4>
                  <p className="mt-1 text-xs leading-5 text-[#8A670C]">{industryPreview.demoFocus}</p>
                </div>
                {industryPreview.label === "Supermarket" && <Link href="/supermarket-demo" className="shrink-0 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">Open 4-Till View</Link>}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <PreviewList title="What changes" items={[industryPreview.productLabel, industryPreview.salesLabel, industryPreview.customerLabel, industryPreview.stockLabel]} />
                <PreviewList title="Recommended modules" items={industryPreview.recommendedModules} />
                <PreviewList title="Sample categories" items={industryPreview.sampleCategories} />
                <PreviewList title="Pain points solved" items={industryPreview.demoPainPoints} />
              </div>
            </div>
          </Panel>

          <Panel icon={Crown} title="Package / subscription" note="Current POS package and renewal controls.">
            <div className="grid gap-3 sm:grid-cols-3"><Info label="Current package" value={form.packagePlan} /><Info label="Monthly fee" value={form.packagePlan === "Premium" ? "Ksh 5,000" : form.packagePlan === "Growth" ? "Ksh 1,500" : form.packagePlan === "Lite" ? "Ksh 700" : form.packagePlan === "Custom / Enterprise" ? "Quoted" : "Ksh 3,000"} /><Info label="Manage" value="Subscriptions page" /></div>
            <div className="mt-3 flex flex-wrap gap-2"><Link href="/subscriptions" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">Manage subscription</Link></div>
          </Panel>

          <Panel icon={CreditCard} title="Payment methods" note="Default checkout payment behavior.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Default payment method" value={form.defaultPaymentMethod} onChange={(defaultPaymentMethod) => update({ defaultPaymentMethod })} options={["Cash", "M-Pesa", "Bank", "Card", "Credit / Debt"]} />
              <Field label="Default currency" value={form.defaultCurrency} onChange={(defaultCurrency) => update({ defaultCurrency })} />
            </div>
          </Panel>

          <Panel icon={Printer} title="Receipt settings" note="Receipt formatting controls.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Receipt title" value={form.receiptTitle} onChange={(receiptTitle) => update({ receiptTitle })} />
              <Field label="Receipt footer" value={form.receiptFooterNote} onChange={(receiptFooterNote) => update({ receiptFooterNote })} />
              <Select label="Receipt paper size" value={form.receiptPaperSize} onChange={(receiptPaperSize) => update({ receiptPaperSize })} options={["58mm", "80mm", "A4"]} />
              <Toggle label="Show business phone" checked={form.showBusinessPhone} onChange={(showBusinessPhone) => update({ showBusinessPhone })} />
              <Toggle label="Show cashier name" checked={form.showCashierName} onChange={(showCashierName) => update({ showCashierName })} />
              <Toggle label="Show customer balance" checked={form.showCustomerBalance} onChange={(showCustomerBalance) => update({ showCustomerBalance })} />
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel icon={Settings2} title="System preferences" note="Cloud POS defaults for daily operations.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Low stock alert threshold" type="number" value={String(form.lowStockAlertThreshold)} onChange={(value) => update({ lowStockAlertThreshold: Number(value) })} />
              <Field label="Timezone" value={form.timezone} onChange={(timezone) => update({ timezone })} />
              <Select label="Date format" value={form.dateFormat} onChange={(dateFormat) => update({ dateFormat })} options={["DD MMM YYYY", "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]} />
              <Toggle label="Enable tax" checked={form.enableTax} onChange={(enableTax) => update({ enableTax })} />
              <Toggle label="Enable rewards" checked={form.enableRewards} onChange={(enableRewards) => update({ enableRewards })} />
              <Toggle label="Enable SMS reminders" checked={form.enableSmsReminders} onChange={(enableSmsReminders) => update({ enableSmsReminders })} />
            </div>
          </Panel>

          <Panel icon={ShieldCheck} title="Administration shortcuts" note="Jump to team permissions or branch controls.">
            <div className="space-y-2"><Shortcut href="/hrm" icon={Users} title="User permissions" note="Manage roles and access rights" /><Shortcut href="/branches" icon={Store} title="Branch settings" note="Manage locations and assigned tills" /></div>
          </Panel>

          <Panel icon={CloudDownload} title="Backup and data" note="Backend export will be connected in a later phase.">
            <p className="rounded-xl bg-[#FFF9E8] p-3 text-[11px] leading-5 text-[#8A670C]">Backup/export is planned for a later production hardening step.</p>
            <button disabled title="Data archive export coming soon" className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#DDEAE0] bg-[#F5FAF6] py-3 text-xs font-black text-[#9AAEA3]"><CloudDownload size={15} />Data archive coming soon</button>
          </Panel>

          <Panel icon={Smartphone} title="Mobile App Experience" note="Installable web app foundation for business users.">
            <p className="rounded-xl bg-[#F8FBF8] p-3 text-[11px] leading-5 text-[#60766B]">
              LeadsStacks POS runs on desktop, tablet and phone. It can be installed like an app using PWA technology. Native Android/iPhone apps can be added later.
            </p>
            <p className="mt-3 rounded-xl bg-[#FFF9E8] p-3 text-[11px] leading-5 text-[#8A670C]">
              Offline sales sync is the next Hybrid POS stage.
            </p>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({ icon: Icon, title, note, children }: { icon: typeof Building2; title: string; note: string; children: ReactNode }) {
  return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Icon size={18} /></span><div><h3 className="font-black text-[#173324]">{title}</h3><p className="text-xs text-[#789083]">{note}</p></div></div><div className="mt-4">{children}</div></article>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border border-[#DDEAE0] p-3 text-xs font-bold text-[#60766B]"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#F8FBF8] p-3"><p className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className="mt-1 text-sm font-black text-[#173324]">{value}</p></div>;
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#D4A017]/25 bg-white/70 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#8A670C]">{title}</p>
      <div className="mt-2 space-y-1.5">
        {items.slice(0, 4).map((item) => <p key={item} className="text-[11px] font-bold text-[#60766B]">- {item}</p>)}
      </div>
    </div>
  );
}

function Shortcut({ href, icon: Icon, title, note }: { href: string; icon: typeof Users; title: string; note: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl border border-[#DDEAE0] p-3 hover:border-[#16A34A]/50"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]"><Icon size={16} /></span><span className="flex-1"><b className="block text-xs text-[#173324]">{title}</b><span className="mt-1 block text-[10px] text-[#789083]">{note}</span></span><ChevronRight size={15} className="text-[#789083]" /></Link>;
}
