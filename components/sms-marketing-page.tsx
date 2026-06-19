"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BellRing, FileText, Megaphone, MessageSquareText, Plus, Send, Users } from "lucide-react";
import { smsCustomerGroups, smsTemplates } from "@/lib/growth-mock-data";

export function SmsMarketingPage() {
  const [template, setTemplate] = useState(smsTemplates[0]);
  const [status, setStatus] = useState<{ configured: boolean; enabled: boolean; provider: string; senderId: string; message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch("/api/sms/status", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load SMS status.");
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load SMS status.");
      }
    }
    void loadStatus();
  }, []);

  return <div className="mx-auto max-w-[1700px]">
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Customer communication</p><h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">SMS Marketing</h2><p className="mt-1 text-sm text-[#789083]">Prepare promotions, account reminders and operational text alerts.</p></div><div><button disabled title={status?.message ?? "SMS provider not configured"} className="flex w-fit cursor-not-allowed items-center gap-2 rounded-xl bg-[#CBD8CF] px-4 py-3 text-xs font-black text-white"><Plus size={16} />SMS campaigns disabled</button></div></div>
    {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={MessageSquareText} label="SMS status" value={status?.configured ? "Configured" : "Not configured"} note={status?.message ?? "Checking provider status"} /><Summary icon={Send} label="Provider" value={status?.provider ?? "Checking"} note={`Sender ID: ${status?.senderId ?? "Checking"}`} /><Summary icon={Megaphone} label="Active campaigns" value="0" note="Campaigns start after provider adapter setup" gold /><Summary icon={Users} label="Reachable customers" value="0" note="Customers with valid phone numbers" /></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Users size={18} /></span><div><h3 className="font-black text-[#173324]">Customer groups</h3><p className="text-xs text-[#789083]">Audience segments for targeted communication.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">{smsCustomerGroups.map((group) => <div key={group.name} className="rounded-xl border border-[#EEF3EF] p-3"><div className="flex justify-between gap-3"><p className="text-xs font-black text-[#173324]">{group.name}</p><span className="rounded-full bg-[#16A34A]/10 px-2 py-1 text-[10px] font-black text-[#0F8C42]">{group.contacts}</span></div><p className="mt-1 text-[11px] leading-5 text-[#789083]">{group.note}</p></div>)}</div><p className="mt-4 rounded-xl bg-[#FFF9E8] p-3 text-[11px] font-bold leading-5 text-[#8A670C]">SMS sending is locked until provider credentials and an adapter are connected.</p></article>
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/12 text-[#A57809]"><FileText size={18} /></span><div><h3 className="font-black text-[#173324]">Message template preview</h3><p className="text-xs text-[#789083]">Select a common business communication template.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{smsTemplates.map((item) => <button key={item.title} onClick={() => setTemplate(item)} className={`rounded-lg px-3 py-2 text-[10px] font-black ${template.title === item.title ? "bg-[#12311F] text-white" : "border border-[#DDEAE0] text-[#60766B]"}`}>{item.title}</button>)}</div><div className="mt-4 rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Audience: {template.audience}</p><p className="mt-3 text-sm leading-6 text-[#173324]">{template.message}</p></div><div className="mt-4 flex flex-wrap gap-2"><button disabled title="SMS provider integration coming soon" className="cursor-not-allowed rounded-xl bg-[#CBD8CF] px-4 py-3 text-xs font-black text-white">Test SMS coming soon</button><button disabled title="Template persistence coming soon" className="cursor-not-allowed rounded-xl border border-[#DDEAE0] bg-[#F5FAF6] px-4 py-3 text-xs font-black text-[#9AAEA3]">Template save coming soon</button></div></article>
    </section>
    <section className="mt-5 grid gap-3 md:grid-cols-3"><Action icon={BellRing} title="Debt reminder SMS" note="Notify customers with outstanding or overdue balances." /><Action icon={Megaphone} title="Promotion SMS" note="Share branch offers with selected customer groups." /><Action icon={AlertTriangle} title="Low stock alert SMS" note="Manager alerts after SMS provider setup." /></section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white"><div className="flex items-center gap-3 border-b border-[#E8F0EA] p-4"><MessageSquareText size={18} className="text-[#16A34A]" /><div><h3 className="font-black text-[#173324]">SMS campaigns</h3><p className="text-xs text-[#789083]">Campaign history will appear after SMS provider setup.</p></div></div><div className="grid min-h-44 place-items-center p-6 text-center"><div><MessageSquareText className="mx-auto text-[#9AAEA3]" size={30} /><p className="mt-3 text-sm font-black text-[#173324]">{status?.configured ? "Provider configured, sending adapter pending" : "SMS provider not connected"}</p><p className="mt-1 text-xs text-[#789083]">{status?.configured ? "Credentials are present. Connect the provider adapter before sending live SMS." : "Campaign sending is available after SMS integration is configured."}</p></div></div></section>
  </div>;
}
function Summary({ icon: Icon, label, value, note, gold }: { icon: typeof Send; label: string; value: string; note: string; gold?: boolean }) { return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p><p className="mt-1 text-lg font-black text-[#173324]">{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
function Action({ icon: Icon, title, note }: { icon: typeof BellRing; title: string; note: string }) { return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]"><Icon size={16} /></span><h3 className="mt-3 text-xs font-black text-[#173324]">{title}</h3><p className="mt-1 text-[11px] leading-5 text-[#789083]">{note}</p></article>; }
