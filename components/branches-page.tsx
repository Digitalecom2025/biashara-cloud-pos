"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronDown, CircleDollarSign, MapPin, Pencil, Phone, Plus, Search, Store, Trash2, Users, WalletCards, X } from "lucide-react";
import type { Branch, BranchStatus } from "@/lib/organization-mock-data";

type BranchFormState = {
  name: string;
  location: string;
  phone: string;
  managerName: string;
  status: "active" | "inactive";
  notes: string;
};

type BranchDialogState =
  | { mode: "add"; branch?: undefined }
  | { mode: "edit"; branch: Branch };

const defaultForm: BranchFormState = { name: "", location: "", phone: "", managerName: "", status: "active", notes: "" };

function formatCurrency(value: number) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value); }

export function BranchesPage({ initialBranches = [] }: { initialBranches?: Branch[] }) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selectedId, setSelectedId] = useState(branches[0]?.id ?? "");
  const [dialog, setDialog] = useState<BranchDialogState | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const selected = branches.find((branch) => branch.id === selectedId) ?? branches[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return branches.filter((branch) => {
      const matchesStatus = status === "All statuses" || branch.status === status;
      const matchesQuery = !normalized || `${branch.name} ${branch.location} ${branch.phone} ${branch.manager}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [branches, query, status]);
  const active = branches.filter((branch) => branch.status === "Active").length;
  const tills = branches.reduce((sum, branch) => sum + branch.tills, 0);
  const sales = branches.reduce((sum, branch) => sum + branch.salesToday, 0);
  const users = branches.reduce((sum, branch) => sum + branch.users, 0);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshBranches() {
    const response = await fetch("/api/branches", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed to load branches.");
    setBranches(payload.data);
    if (!payload.data.some((branch: Branch) => branch.id === selectedId)) setSelectedId(payload.data[0]?.id ?? "");
  }

  async function saveBranch(values: BranchFormState) {
    setError("");
    if (!values.name.trim()) return setError("Branch name is required.");
    if (!values.location.trim()) return setError("Location is required.");
    if (values.phone.trim() && values.phone.trim().length < 4) return setError("Phone number is too short.");

    const isEdit = dialog?.mode === "edit";
    const url = isEdit ? `/api/branches/${dialog.branch.id}` : "/api/branches";
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save branch.");
      await refreshBranches();
      setSelectedId(payload.data.id);
      setDialog(null);
      showFeedback(isEdit ? "Branch updated successfully." : "Branch added successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save branch.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateBranch(branch: Branch) {
    if (!window.confirm(`Deactivate ${branch.name}? It will be hidden from the branch list.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/branches/${branch.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to deactivate branch.");
      await refreshBranches();
      showFeedback("Branch deactivated successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to deactivate branch.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-[1700px]">
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Business locations</p><h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Branches</h2><p className="mt-1 text-sm text-[#789083]">Manage outlets, tills, staff allocation and branch performance.</p></div><button onClick={() => { setError(""); setDialog({ mode: "add" }); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15"><Plus size={16} />Add branch</button></div>
    {(feedback || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={Store} label="Total branches" value={`${branches.length} locations`} note="Across your business" /><Summary icon={Building2} label="Active branches" value={`${active} online`} note="Ready for transactions" /><Summary icon={Users} label="Users assigned" value={`${users} users`} note={`${tills} tills configured`} /><Summary icon={CircleDollarSign} label="Branch sales today" value={formatCurrency(sales)} note="Combined outlet revenue" /></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]"><article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5"><div className="flex flex-col gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row"><SearchBox value={query} onChange={setQuery} /><Filter value={status} onChange={setStatus} /></div>{loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Updating branches...</div>}<div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1280px] border-collapse text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Branch</th><th className="px-3 py-3.5">Location</th><th className="px-3 py-3.5">Manager</th><th className="px-3 py-3.5">Phone</th><th className="px-3 py-3.5">Tills</th><th className="px-3 py-3.5">Users</th><th className="px-3 py-3.5">Stock value</th><th className="px-3 py-3.5">Sales today</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody>{filtered.map((branch) => <BranchRow key={branch.id} branch={branch} selected={selectedId === branch.id} onSelect={() => setSelectedId(branch.id)} onEdit={() => { setError(""); setDialog({ mode: "edit", branch }); }} onDeactivate={() => deactivateBranch(branch)} />)}</tbody></table></div><div className="grid gap-3 p-3 lg:hidden">{filtered.map((branch) => <BranchCard key={branch.id} branch={branch} selected={selectedId === branch.id} onSelect={() => setSelectedId(branch.id)} onEdit={() => { setError(""); setDialog({ mode: "edit", branch }); }} onDeactivate={() => deactivateBranch(branch)} />)}</div>{filtered.length === 0 && <div className="grid min-h-52 place-items-center p-8 text-center text-xs text-[#789083]">{branches.length === 0 ? "No branches yet. Add your first branch or use your default branch." : "No matching branches."}</div>}<footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b className="text-[#173324]">{filtered.length}</b> of <b className="text-[#173324]">{branches.length}</b> branches</footer></article>{selected ? <BranchProfile branch={selected} onFeedback={showFeedback} /> : <aside className="grid min-h-72 place-items-center rounded-2xl border border-[#DDEAE0] bg-white p-6 text-center text-xs text-[#789083]">No branch selected.</aside>}</section>
    {dialog && <BranchDialog state={dialog} loading={loading} error={error} onClose={() => setDialog(null)} onSave={saveBranch} />}
  </div>;
}

function formFromBranch(branch?: Branch): BranchFormState {
  if (!branch) return defaultForm;
  return { name: branch.name, location: branch.location, phone: branch.phone, managerName: branch.manager, status: branch.status === "Inactive" ? "inactive" : "active", notes: "" };
}

function BranchDialog({ state, loading, error, onClose, onSave }: { state: BranchDialogState; loading: boolean; error: string; onClose: () => void; onSave: (values: BranchFormState) => void }) {
  const [values, setValues] = useState<BranchFormState>(() => formFromBranch(state.branch));
  const title = state.mode === "add" ? "Add branch" : `Edit ${state.branch.name}`;
  function update<K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) { setValues((current) => ({ ...current, [field]: value })); }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-2xl rounded-2xl bg-white"><div className="flex items-center justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="text-[10px] text-[#789083]">Branch data is saved to the business database.</p></div><button onClick={onClose} aria-label="Close branch form"><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="grid gap-3 p-4 sm:grid-cols-2">{error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444] sm:col-span-2">{error}</div>}<Field label="Branch name" required value={values.name} onChange={(value) => update("name", value)} /><Field label="Location" required value={values.location} onChange={(value) => update("location", value)} /><Field label="Phone" value={values.phone} onChange={(value) => update("phone", value)} /><Field label="Manager name" value={values.managerName} onChange={(value) => update("managerName", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select value={values.status} onChange={(event) => update("status", event.target.value as "active" | "inactive")} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><Field label="Notes" value={values.notes} onChange={(value) => update("notes", value)} /><button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] py-3 text-xs font-black text-[#60766B]">Cancel</button><button disabled={loading} className="rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save branch"}</button></form></article></div>;
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs outline-none focus:border-[#16A34A]" placeholder={`Enter ${label.toLowerCase()}`} /></label>; }
function Summary({ icon: Icon, label, value, note }: { icon: typeof Store; label: string; value: string; note: string }) { return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p><p className="mt-1 text-lg font-black text-[#173324]">{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={value} onChange={(e) => onChange(e.target.value)} aria-label="Search branches" placeholder="Search branch, location, phone or manager..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#16A34A]" /></label>; }
function Filter({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <label className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Filter branch status" className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B] sm:min-w-40"><option>All statuses</option><option>Active</option><option>Inactive</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label>; }
function BranchRow({ branch, selected, onSelect, onEdit, onDeactivate }: { branch: Branch; selected: boolean; onSelect: () => void; onEdit: () => void; onDeactivate: () => void }) { return <tr onClick={onSelect} className={`cursor-pointer border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB] ${selected ? "bg-[#16A34A]/[0.035]" : ""}`}><td className="px-4 py-3 font-black text-[#173324]">{branch.name}</td><td className="px-3 py-3">{branch.location}</td><td className="px-3 py-3 font-semibold">{branch.manager}</td><td className="px-3 py-3">{branch.phone}</td><td className="px-3 py-3">{branch.tills}</td><td className="px-3 py-3">{branch.users}</td><td className="px-3 py-3 font-black text-[#173324]">{formatCurrency(branch.stockValue)}</td><td className="px-3 py-3 font-black text-[#0F8C42]">{formatCurrency(branch.salesToday)}</td><td className="px-3 py-3"><Status status={branch.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={(event) => { event.stopPropagation(); onEdit(); }} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]" aria-label={`Edit ${branch.name}`}><Pencil size={14} /></button><button onClick={(event) => { event.stopPropagation(); onDeactivate(); }} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]" aria-label={`Deactivate ${branch.name}`}><Trash2 size={14} /></button></div></td></tr>; }
function BranchCard({ branch, selected, onSelect, onEdit, onDeactivate }: { branch: Branch; selected: boolean; onSelect: () => void; onEdit: () => void; onDeactivate: () => void }) { return <article className={`rounded-xl border p-3 text-left ${selected ? "border-[#16A34A]/60 bg-[#16A34A]/[0.035]" : "border-[#E8F0EA]"}`}><button onClick={onSelect} className="w-full text-left"><div className="flex justify-between gap-2"><div><p className="text-xs font-black text-[#173324]">{branch.name}</p><p className="mt-1 text-[10px] text-[#789083]">{branch.location}</p></div><Status status={branch.status} /></div><div className="mt-3 grid grid-cols-3 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><span><b className="block text-[#789083]">Tills</b><strong>{branch.tills}</strong></span><span><b className="block text-[#789083]">Stock</b><strong>{formatCurrency(branch.stockValue)}</strong></span><span><b className="block text-[#789083]">Sales</b><strong className="text-[#0F8C42]">{formatCurrency(branch.salesToday)}</strong></span></div></button><div className="mt-3 flex justify-end gap-2"><button onClick={onEdit} className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-[10px] font-black text-[#60766B]">Edit</button><button onClick={onDeactivate} className="rounded-lg bg-[#EF4444]/10 px-3 py-2 text-[10px] font-black text-[#EF4444]">Deactivate</button></div></article>; }
function Status({ status }: { status: BranchStatus }) { const tone = status === "Active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Maintenance" ? "bg-[#D4A017]/12 text-[#9A7108]" : "bg-[#789083]/10 text-[#60766B]"; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>; }
function BranchProfile({ branch, onFeedback }: { branch: Branch; onFeedback: (message: string) => void }) { return <aside className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white xl:sticky xl:top-[96px]"><div className="bg-[#12311F] p-5 text-white"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-sm font-black text-[#22C55E]">{branch.initials}</span><h3 className="mt-4 text-lg font-black">{branch.name}</h3><p className="mt-1 text-[11px] text-[#B8C7BD]">{branch.focus}</p></div><div className="space-y-3 p-4 text-xs text-[#60766B]"><p className="flex gap-2"><MapPin size={14} className="text-[#16A34A]" />{branch.location}</p><p className="flex gap-2"><Phone size={14} className="text-[#16A34A]" />{branch.phone || "No phone added"}</p><p className="flex gap-2"><Users size={14} className="text-[#16A34A]" />Manager: {branch.manager}</p></div><div className="grid grid-cols-2 gap-px bg-[#E8F0EA]"><ProfileStat label="Stock value" value={formatCurrency(branch.stockValue)} icon={WalletCards} /><ProfileStat label="Sales today" value={formatCurrency(branch.salesToday)} icon={CircleDollarSign} /></div><div className="p-4"><button onClick={() => onFeedback("Branch overview placeholder. Detailed branch dashboard will be connected later.")} className="w-full rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white">View branch overview</button></div></aside>; }
function ProfileStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Store }) { return <div className="bg-[#F8FBF8] p-3"><Icon size={14} className="text-[#16A34A]" /><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#789083]">{label}</p><p className="mt-1 text-xs font-black text-[#173324]">{value}</p></div>; }
