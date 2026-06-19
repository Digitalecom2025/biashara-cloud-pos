"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Award, Gift, Medal, Pencil, Plus, RotateCcw, Sparkles, Star, Trash2, Users, X } from "lucide-react";

type RewardRule = {
  id: string;
  name: string;
  type: string;
  thresholdAmount: number;
  rewardDescription: string;
  startDate: string;
  endDate: string;
  status: string;
};

type RuleFormState = {
  name: string;
  type: string;
  thresholdAmount: string;
  rewardDescription: string;
  startDate: string;
  endDate: string;
  status: string;
};

type RuleDialogState =
  | { mode: "add"; rule?: undefined }
  | { mode: "edit"; rule: RewardRule };

const ruleTypes = ["Spend amount", "Number of purchases", "Product/category based"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultForm(): RuleFormState {
  return {
    name: "",
    type: "Spend amount",
    thresholdAmount: "0",
    rewardDescription: "",
    startDate: today(),
    endDate: "",
    status: "active",
  };
}

export function RewardsPage() {
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [dialog, setDialog] = useState<RuleDialogState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const activeRules = useMemo(() => rules.filter((rule) => rule.status === "active").length, [rules]);

  async function loadRules() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reward-rules", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load reward rules.");
      setRules(data.rules ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reward rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialRules() {
      try {
        const response = await fetch("/api/reward-rules", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load reward rules.");
        if (active) setRules(data.rules ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load reward rules.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialRules();
    return () => {
      active = false;
    };
  }, []);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 3500);
  }

  async function saveRule(values: RuleFormState) {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: values.name,
        type: values.type,
        thresholdAmount: Number(values.thresholdAmount || 0),
        rewardDescription: values.rewardDescription,
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
      };
      const endpoint = dialog?.mode === "edit" ? `/api/reward-rules/${dialog.rule.id}` : "/api/reward-rules";
      const response = await fetch(endpoint, {
        method: dialog?.mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save reward rule.");
      setDialog(null);
      await loadRules();
      showFeedback(data.message || "Reward rule saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save reward rule.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRule(rule: RewardRule) {
    if (!window.confirm(`Delete reward rule "${rule.name}"?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/reward-rules/${rule.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete reward rule.");
      await loadRules();
      showFeedback(data.message || "Reward rule deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete reward rule.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(rule: RewardRule) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/reward-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: rule.status === "active" ? "inactive" : "active" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update reward rule.");
      await loadRules();
      showFeedback(data.message || "Reward rule updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update reward rule.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto max-w-[1650px]">
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Customer retention</p><h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Rewards</h2><p className="mt-1 text-sm text-[#789083]">Create loyalty and reward rules for repeat customers.</p></div><div><button onClick={() => { setError(""); setDialog({ mode: "add" }); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]"><Plus size={16} />Add reward rule</button>{feedback && <p className="mt-2 text-xs font-bold text-[#16A34A]">{feedback}</p>}</div></div>
    {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}
    {loading && <div className="mb-4 rounded-xl border border-[#D4A017]/20 bg-[#FFF9E8] px-4 py-3 text-xs font-bold text-[#8A670C]">Loading reward rules...</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={Users} label="Loyalty customers" value="0" note="Balances will appear after checkout rewards are applied" /><Summary icon={Sparkles} label="Active rules" value={`${activeRules}`} note="Rules currently enabled" /><Summary icon={RotateCcw} label="Inactive rules" value={`${rules.length - activeRules}`} note="Rules paused or disabled" gold /><Summary icon={Gift} label="SMS reward notices" value="Disabled" note="SMS notifications need provider setup" /></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/12 text-[#A57809]"><Medal size={18} /></span><div><h3 className="font-black text-[#173324]">Reward setup note</h3><p className="text-xs text-[#789083]">Rules are saved now. Automatic reward application can be connected to checkout later.</p></div></div><div className="mt-4 space-y-3"><p className="rounded-xl bg-[#F8FBF8] p-3 text-xs font-bold leading-5 text-[#60766B]">SMS reward notifications will be enabled after SMS provider setup.</p><p className="rounded-xl bg-[#FFF9E8] p-3 text-xs font-bold leading-5 text-[#8A670C]">No SMS is sent from this page until provider credentials are connected.</p></div></article>
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Award size={18} /></span><div><h3 className="font-black text-[#173324]">Reward rules</h3><p className="text-xs text-[#789083]">Create, edit, disable or delete reward controls.</p></div></div><div className="mt-4 space-y-3">{rules.length === 0 ? <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-[#DDEAE0] p-5 text-center text-xs text-[#789083]">No reward rules yet. Add your first reward rule.</div> : rules.map((rule) => <div key={rule.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[#EEF3EF] p-3 sm:flex-row sm:items-center"><div><p className="text-xs font-black text-[#173324]">{rule.name}</p><p className="mt-1 text-[11px] text-[#789083]">{rule.type} - threshold {rule.thresholdAmount.toLocaleString()} - {rule.rewardDescription}</p><p className="mt-1 text-[10px] text-[#9AAEA3]">Starts {rule.startDate}{rule.endDate ? ` - ends ${rule.endDate}` : ""}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => toggleRule(rule)} disabled={saving} className={`rounded-full px-2.5 py-1 text-[10px] font-black ${rule.status === "active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : "bg-[#D4A017]/12 text-[#8A670C]"}`}>{rule.status === "active" ? "Active" : "Inactive"}</button><button onClick={() => setDialog({ mode: "edit", rule })} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]" aria-label={`Edit ${rule.name}`}><Pencil size={14} /></button><button onClick={() => deleteRule(rule)} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]" aria-label={`Delete ${rule.name}`}><Trash2 size={14} /></button></div></div>)}</div></article>
    </section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white"><div className="flex items-center gap-3 border-b border-[#E8F0EA] p-4"><Star size={18} className="text-[#D4A017]" /><div><h3 className="font-black text-[#173324]">Customer rewards</h3><p className="text-xs text-[#789083]">Reward balances will appear after checkout reward application is enabled.</p></div></div><div className="grid min-h-44 place-items-center p-6 text-center"><div><Star className="mx-auto text-[#9AAEA3]" size={30} /><p className="mt-3 text-sm font-black text-[#173324]">No customer reward balances yet</p><p className="mt-1 text-xs text-[#789083]">Create rules now. Reward earning and redemption can be connected to sales checkout next.</p></div></div></section>
    {dialog && <RewardRuleDialog state={dialog} saving={saving} error={error} onClose={() => setDialog(null)} onSave={saveRule} />}
  </div>;
}

function RewardRuleDialog({ state, saving, error, onClose, onSave }: { state: RuleDialogState; saving: boolean; error: string; onClose: () => void; onSave: (values: RuleFormState) => void }) {
  const [values, setValues] = useState<RuleFormState>(state.mode === "edit" ? {
    name: state.rule.name,
    type: state.rule.type,
    thresholdAmount: String(state.rule.thresholdAmount),
    rewardDescription: state.rule.rewardDescription,
    startDate: state.rule.startDate,
    endDate: state.rule.endDate,
    status: state.rule.status,
  } : defaultForm());

  function update<K extends keyof RuleFormState>(field: K, value: RuleFormState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(values);
  }

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">{state.mode === "edit" ? "Edit reward rule" : "Add reward rule"}</h3><p className="mt-1 text-[11px] text-[#789083]">Reward rules are saved to this business account.</p></div><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#F5FAF6]" aria-label="Close reward rule form"><X size={16} /></button></div><form onSubmit={submit} className="p-4">{error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}<div className="grid gap-3 md:grid-cols-2"><Field label="Rule name" required value={values.name} onChange={(value) => update("name", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Rule type</span><select value={values.type} onChange={(event) => update("type", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{ruleTypes.map((type) => <option key={type}>{type}</option>)}</select></label><Field label="Threshold amount" type="number" required value={values.thresholdAmount} onChange={(value) => update("thresholdAmount", value)} /><Field label="Reward description" required value={values.rewardDescription} onChange={(value) => update("rewardDescription", value)} /><Field label="Start date" type="date" required value={values.startDate} onChange={(value) => update("startDate", value)} /><Field label="End date" type="date" value={values.endDate} onChange={(value) => update("endDate", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select value={values.status} onChange={(event) => update("status", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Cancel</button><button disabled={saving} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save reward rule"}</button></div></form></article></div>;
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}

function Summary({ icon: Icon, label, value, note, gold }: { icon: typeof Gift; label: string; value: string; note: string; gold?: boolean }) { return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className="mt-1 text-lg font-black text-[#173324]">{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
