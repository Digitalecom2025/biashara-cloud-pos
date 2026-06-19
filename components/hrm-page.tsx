"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, CircleUserRound, Crown, Pencil, Plus, Search, ShieldCheck, Trash2, UserRoundCheck, Users, X } from "lucide-react";
import { permissions, roles, type Branch, type StaffStatus, type StaffUser } from "@/lib/organization-mock-data";

type UserFormState = {
  name: string;
  email: string;
  phone: string;
  role: string;
  branchId: string;
  till: string;
  status: "active" | "inactive";
};

type UserDialogState =
  | { mode: "add"; user?: undefined }
  | { mode: "edit"; user: StaffUser };

const roleOptions = ["Business Owner", "Branch Manager", "Cashier", "Stock Clerk", "Accountant", "Waiter", "Support Staff"];
const defaultForm: UserFormState = { name: "", email: "", phone: "", role: "Cashier", branchId: "", till: "", status: "active" };

export function HrmPage({ initialUsers = [], initialBranches = [] }: { initialUsers?: StaffUser[]; initialBranches?: Branch[] }) {
  const [tab, setTab] = useState<"staff" | "roles">("staff");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All roles");
  const [branch, setBranch] = useState("All branches");
  const [status, setStatus] = useState("All statuses");
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(initialUsers);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [dialog, setDialog] = useState<UserDialogState | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return staffUsers.filter((user) => {
      const matchesRole = role === "All roles" || user.role === role;
      const matchesBranch = branch === "All branches" || user.branch === branch;
      const matchesStatus = status === "All statuses" || user.status === status;
      const matchesQuery = !normalized || `${user.name} ${user.email} ${user.phone} ${user.role} ${user.branch}`.toLowerCase().includes(normalized);
      return matchesRole && matchesBranch && matchesStatus && matchesQuery;
    });
  }, [branch, query, role, staffUsers, status]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function refreshData() {
    const [usersResponse, branchesResponse] = await Promise.all([fetch("/api/users", { cache: "no-store" }), fetch("/api/branches", { cache: "no-store" })]);
    const usersPayload = await usersResponse.json();
    const branchesPayload = await branchesResponse.json();
    if (!usersResponse.ok) throw new Error(usersPayload.error ?? "Failed to load users.");
    if (!branchesResponse.ok) throw new Error(branchesPayload.error ?? "Failed to load branches.");
    setStaffUsers(usersPayload.data);
    setBranches(branchesPayload.data);
  }

  async function saveUser(values: UserFormState) {
    setError("");
    if (!values.name.trim()) return setError("Full name is required.");
    if (!values.email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return setError("Email format is invalid.");
    if (!values.role.trim()) return setError("Role is required.");
    if (values.phone.trim() && values.phone.trim().length < 4) return setError("Phone number is too short.");

    const isEdit = dialog?.mode === "edit";
    const url = isEdit ? `/api/users/${dialog.user.id}` : "/api/users";
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save user.");
      await refreshData();
      setDialog(null);
      showFeedback(isEdit ? "User updated successfully." : "User added successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save user.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateUser(user: StaffUser) {
    if (!window.confirm(`Deactivate ${user.name}? They will be hidden from the active staff list.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to deactivate user.");
      await refreshData();
      showFeedback("User deactivated successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to deactivate user.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-[1700px]"><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">People and access</p><h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">HRM</h2><p className="mt-1 text-sm text-[#789083]">Manage staff accounts, assigned tills and role permissions.</p></div><button onClick={() => { setError(""); setDialog({ mode: "add" }); }} className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white"><Plus size={16} />Add user</button></div>
    {(feedback || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={Users} label="Total staff" value={`${staffUsers.length} users`} note="Configured employee accounts" /><Summary icon={UserRoundCheck} label="Active users" value={`${staffUsers.filter((u) => u.status === "Active").length} online`} note="Enabled for business access" /><Summary icon={CircleUserRound} label="Cashiers" value={`${staffUsers.filter((u) => u.role === "Cashier").length} cashier`} note="Assigned checkout operators" /><Summary icon={Crown} label="Managers" value={`${staffUsers.filter((u) => u.role === "Branch Manager").length} manager`} note="Branch-level oversight" /></section>
    <div className="mt-5 flex w-fit gap-1 rounded-xl border border-[#DDEAE0] bg-white p-1"><button onClick={() => setTab("staff")} className={`rounded-lg px-4 py-2.5 text-xs font-black ${tab === "staff" ? "bg-[#12311F] text-white" : "text-[#60766B]"}`}>Staff users</button><button onClick={() => setTab("roles")} className={`rounded-lg px-4 py-2.5 text-xs font-black ${tab === "roles" ? "bg-[#12311F] text-white" : "text-[#60766B]"}`}>Roles & permissions</button></div>
    {tab === "staff" ? <StaffRegister query={query} setQuery={setQuery} role={role} setRole={setRole} branch={branch} setBranch={setBranch} status={status} setStatus={setStatus} users={filtered} branches={branches} totalUsers={staffUsers.length} loading={loading} onEdit={(user) => { setError(""); setDialog({ mode: "edit", user }); }} onDeactivate={deactivateUser} /> : <RolesMatrix />}
    {dialog && <UserDialog state={dialog} branches={branches} loading={loading} error={error} onClose={() => setDialog(null)} onSave={saveUser} />}
  </div>;
}

function formFromUser(user: StaffUser | undefined, branches: Branch[]): UserFormState {
  if (!user) return { ...defaultForm, branchId: branches[0]?.id ?? "" };
  const matchingBranch = branches.find((branch) => branch.name === user.branch || branch.id === user.branchId);
  return { name: user.name, email: user.email, phone: user.phone, role: user.role, branchId: user.branchId ?? matchingBranch?.id ?? "", till: user.till === "Not assigned" ? "" : user.till, status: user.status === "Inactive" ? "inactive" : "active" };
}

function UserDialog({ state, branches, loading, error, onClose, onSave }: { state: UserDialogState; branches: Branch[]; loading: boolean; error: string; onClose: () => void; onSave: (values: UserFormState) => void }) {
  const [values, setValues] = useState<UserFormState>(() => formFromUser(state.user, branches));
  const title = state.mode === "add" ? "Add staff user" : `Edit ${state.user.name}`;
  function update<K extends keyof UserFormState>(field: K, value: UserFormState[K]) { setValues((current) => ({ ...current, [field]: value })); }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07120D]/65 p-4"><article className="w-full max-w-2xl rounded-2xl bg-white"><div className="flex justify-between border-b border-[#E8F0EA] p-4"><div><h3 className="text-sm font-black text-[#173324]">{title}</h3><p className="text-[10px] text-[#789083]">User management data only. Password/auth will be added later.</p></div><button onClick={onClose} aria-label="Close user form"><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="grid gap-3 p-4 sm:grid-cols-2">{error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444] sm:col-span-2">{error}</div>}<Field label="Full name" required value={values.name} onChange={(value) => update("name", value)} /><Field label="Email" required value={values.email} onChange={(value) => update("email", value)} /><Field label="Phone" value={values.phone} onChange={(value) => update("phone", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Role *</span><select value={values.role} onChange={(event) => update("role", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs">{roleOptions.map((role) => <option key={role}>{role}</option>)}</select></label><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Assigned branch</span><select value={values.branchId} onChange={(event) => update("branchId", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs"><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><Field label="Assigned till/counter" value={values.till} onChange={(value) => update("till", value)} /><label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select value={values.status} onChange={(event) => update("status", event.target.value as "active" | "inactive")} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><div className="hidden sm:block" /><button type="button" onClick={onClose} className="rounded-xl border border-[#DDEAE0] py-3 text-xs font-black text-[#60766B]">Cancel</button><button disabled={loading} className="rounded-xl bg-[#16A34A] py-3 text-xs font-black text-white disabled:opacity-60">{loading ? "Saving..." : "Save user"}</button></form></article></div>;
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs" placeholder={`Enter ${label.toLowerCase()}`} /></label>; }
function Summary({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: string; note: string }) { return <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Icon size={18} /></span><p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p><p className="mt-1 text-lg font-black text-[#173324]">{value}</p><p className="mt-1 text-[11px] text-[#789083]">{note}</p></article>; }
function StaffRegister({ query, setQuery, role, setRole, branch, setBranch, status, setStatus, users, branches, totalUsers, loading, onEdit, onDeactivate }: { query: string; setQuery: (v: string) => void; role: string; setRole: (v: string) => void; branch: string; setBranch: (v: string) => void; status: string; setStatus: (v: string) => void; users: StaffUser[]; branches: Branch[]; totalUsers: number; loading: boolean; onEdit: (user: StaffUser) => void; onDeactivate: (user: StaffUser) => void }) { return <section className="mt-3 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white"><div className="grid gap-3 border-b border-[#E8F0EA] p-4 xl:grid-cols-[minmax(0,1fr)_180px_210px_160px]"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search staff" placeholder="Search staff, email, phone, role or branch..." className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none" /></label><Select label="Filter staff role" value={role} onChange={setRole} options={["All roles", ...roleOptions]} /><Select label="Filter staff branch" value={branch} onChange={setBranch} options={["All branches", ...branches.map((item) => item.name)]} /><Select label="Filter staff status" value={status} onChange={setStatus} options={["All statuses", "Active", "Inactive", "Suspended"]} /></div>{loading && <div className="border-b border-[#E8F0EA] bg-[#FFF9E8] px-4 py-2 text-xs font-bold text-[#8A670C]">Updating staff users...</div>}<div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1240px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]"><th className="px-4 py-3.5">Staff</th><th className="px-3 py-3.5">Email</th><th className="px-3 py-3.5">Phone</th><th className="px-3 py-3.5">Role</th><th className="px-3 py-3.5">Assigned branch</th><th className="px-3 py-3.5">Assigned till</th><th className="px-3 py-3.5">Last login</th><th className="px-3 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody>{users.map((user) => <StaffRow key={user.id} user={user} onEdit={() => onEdit(user)} onDeactivate={() => onDeactivate(user)} />)}</tbody></table></div><div className="grid gap-3 p-3 lg:hidden">{users.map((user) => <StaffCard key={user.id} user={user} onEdit={() => onEdit(user)} onDeactivate={() => onDeactivate(user)} />)}</div>{users.length === 0 && <div className="grid min-h-52 place-items-center p-8 text-center text-xs text-[#789083]">No matching staff users.</div>}<footer className="border-t border-[#E8F0EA] p-4 text-xs text-[#789083]">Showing <b>{users.length}</b> of <b>{totalUsers}</b> staff users</footer></section>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) { return <label className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="w-full appearance-none rounded-xl border border-[#DDEAE0] bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-[#60766B]">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#789083]" size={14} /></label>; }
function StaffRow({ user, onEdit, onDeactivate }: { user: StaffUser; onEdit: () => void; onDeactivate: () => void }) { return <tr className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar user={user} /><b className="text-[#173324]">{user.name}</b></div></td><td className="px-3 py-3">{user.email}</td><td className="px-3 py-3">{user.phone}</td><td className="px-3 py-3"><RoleBadge role={user.role} /></td><td className="px-3 py-3">{user.branch}</td><td className="px-3 py-3">{user.till}</td><td className="px-3 py-3">{user.lastLogin}</td><td className="px-3 py-3"><Status status={user.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]" aria-label={`Edit ${user.name}`}><Pencil size={14} /></button><button onClick={onDeactivate} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]" aria-label={`Deactivate ${user.name}`}><Trash2 size={14} /></button></div></td></tr>; }
function StaffCard({ user, onEdit, onDeactivate }: { user: StaffUser; onEdit: () => void; onDeactivate: () => void }) { return <article className="rounded-xl border border-[#E8F0EA] p-3"><div className="flex gap-3"><Avatar user={user} /><div className="min-w-0 flex-1"><p className="text-xs font-black text-[#173324]">{user.name}</p><p className="truncate text-[10px] text-[#789083]">{user.email}</p></div><Status status={user.status} /></div><div className="mt-3 rounded-lg bg-[#F8FBF8] p-2.5 text-[10px]"><p><RoleBadge role={user.role} /> <span className="ml-2 text-[#789083]">{user.branch}</span></p><p className="mt-2 text-[#789083]">{user.till} - Last login {user.lastLogin}</p></div><div className="mt-3 flex justify-end gap-2"><button onClick={onEdit} className="rounded-lg border border-[#DDEAE0] px-3 py-2 text-[10px] font-black text-[#60766B]">Edit</button><button onClick={onDeactivate} className="rounded-lg bg-[#EF4444]/10 px-3 py-2 text-[10px] font-black text-[#EF4444]">Deactivate</button></div></article>; }
function Avatar({ user }: { user: StaffUser }) { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#12311F] text-[10px] font-black text-white">{user.initials}</span>; }
function RoleBadge({ role }: { role: string }) { return <span className="rounded-full bg-[#D4A017]/12 px-2.5 py-1 text-[10px] font-black text-[#9A7108]">{role}</span>; }
function Status({ status }: { status: StaffStatus }) { const tone = status === "Active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : status === "Suspended" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#789083]/10 text-[#60766B]"; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{status}</span>; }

function RolesMatrix() {
  const [selectedRole, setSelectedRole] = useState(roles[0]?.name ?? "Business Owner");
  const role = roles.find((item) => item.name === selectedRole) ?? roles[0];
  return <section className="mt-3 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]"><article className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white"><div className="flex items-center gap-3 border-b border-[#E8F0EA] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><ShieldCheck size={18} /></span><div><h3 className="font-black text-[#173324]">User roles & permissions</h3><p className="text-xs text-[#789083]">Default access templates for your POS team.</p></div></div><div className="table-scroll overflow-x-auto"><table className="min-w-[1660px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]"><th className="sticky left-0 z-10 min-w-56 bg-[#F8FBF8] px-4 py-3.5">Role</th>{permissions.map((permission) => <th key={permission} className="min-w-28 px-2 py-3.5 text-center">{permission}</th>)}</tr></thead><tbody>{roles.map((role) => <tr key={role.name} onClick={() => setSelectedRole(role.name)} className="cursor-pointer border-t border-[#EEF3EF] hover:bg-[#FBFDFB]"><td className="sticky left-0 bg-white px-4 py-3"><p className="text-xs font-black text-[#173324]">{role.name}</p><p className="mt-0.5 text-[10px] text-[#789083]">{role.users} user - {role.description}</p></td>{permissions.map((permission) => <td key={permission} className="px-2 py-3 text-center">{role.permissions.includes(permission) ? <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-[#16A34A]/10 text-[#16A34A]"><Check size={13} /></span> : <span className="text-[#CBD8CF]">-</span>}</td>)}</tr>)}</tbody></table></div></article><aside className="rounded-2xl border border-[#DDEAE0] bg-white p-4 xl:sticky xl:top-[96px]"><p className="text-[10px] font-black uppercase tracking-wider text-[#16A34A]">Role details</p><h3 className="mt-1 text-lg font-black text-[#173324]">{role.name}</h3><p className="mt-1 text-xs text-[#789083]">{role.description}</p><div className="mt-4 space-y-2">{role.permissions.map((permission) => <p key={permission} className="flex items-center gap-2 text-xs font-bold text-[#60766B]"><Check size={13} className="text-[#16A34A]" /> {permission}</p>)}</div><button disabled title="Custom permission editing coming soon" className="mt-4 w-full cursor-not-allowed rounded-xl border border-[#DDEAE0] bg-[#F5FAF6] py-3 text-xs font-black text-[#9AAEA3]">Edit permissions coming soon</button></aside></section>;
}
