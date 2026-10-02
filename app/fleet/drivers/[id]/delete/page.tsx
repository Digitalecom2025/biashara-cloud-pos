import Link from "next/link";
import { notFound } from "next/navigation";

import { getDriver } from "@/lib/driver-data";
import { deleteDriver } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeleteDriverPage({ params }: Props) {
  const { id } = await params;
  const driver = await getDriver(id);
  if (!driver) notFound();

  async function action() {
    "use server";
    await deleteDriver(id);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-2xl border border-[#DDEAE0] bg-white p-6 shadow-sm shadow-[#12311F]/5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EF4444]">Delete driver</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B]">Delete {driver.fullName}?</h2>
        <p className="mt-2 text-sm text-[#789083]">This permanently removes the driver record. Related vehicle assignments or trips can prevent deletion.</p>
        <div className="mt-6 rounded-xl bg-[#F8FBF8] p-4 text-xs text-[#60766B]">
          <p><b className="text-[#173324]">Licence:</b> {driver.licenseNumber}</p>
          <p className="mt-2"><b className="text-[#173324]">Phone:</b> {driver.phoneNumber ?? "-"}</p>
          <p className="mt-2"><b className="text-[#173324]">Status:</b> {driver.status}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={`/fleet/drivers/${id}`} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link>
          <form action={action}><button className="w-full rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626] sm:w-auto">Delete permanently</button></form>
        </div>
      </section>
    </div>
  );
}
