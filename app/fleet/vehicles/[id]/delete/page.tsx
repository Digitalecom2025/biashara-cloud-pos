import Link from "next/link";
import { notFound } from "next/navigation";

import { getVehicle } from "@/lib/fleet-data";
import { deleteVehicle } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeleteVehiclePage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  async function action() {
    "use server";
    await deleteVehicle(id);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-2xl border border-[#DDEAE0] bg-white p-6 shadow-sm shadow-[#12311F]/5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EF4444]">Delete vehicle</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B]">Delete {vehicle.plateNumber}?</h2>
        <p className="mt-2 text-sm text-[#789083]">This permanently removes the vehicle record. Related fuel, trip or maintenance records can prevent deletion.</p>

        <div className="mt-6 rounded-xl bg-[#F8FBF8] p-4 text-xs text-[#60766B]">
          <p><b className="text-[#173324]">Vehicle:</b> {vehicle.vehicleName}</p>
          <p className="mt-2"><b className="text-[#173324]">Driver:</b> {vehicle.driver?.fullName ?? "Unassigned"}</p>
          <p className="mt-2"><b className="text-[#173324]">Status:</b> {vehicle.status}</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={`/fleet/vehicles/${id}`} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link>
          <form action={action}>
            <button className="w-full rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626] sm:w-auto">Delete permanently</button>
          </form>
        </div>
      </section>
    </div>
  );
}
