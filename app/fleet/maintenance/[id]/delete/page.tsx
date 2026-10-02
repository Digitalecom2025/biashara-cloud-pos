import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaintenanceRecord } from "@/lib/maintenance-data";
import { deleteMaintenance } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DeleteMaintenancePage({
  params,
}: Props) {
  const { id } = await params;

  const record = await getMaintenanceRecord(id);

  if (!record) {
    notFound();
  }

  async function deleteAction() {
    "use server";
    await deleteMaintenance(id);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">

      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-red-600">
          Delete Maintenance Record
        </h1>

        <p className="mt-3 text-gray-600">
          This action cannot be undone.
        </p>

        <div className="mt-8 space-y-3 rounded-lg bg-gray-50 p-5">

          <div>
            <strong>Vehicle:</strong>{" "}
            {record.vehicle.plateNumber} - {record.vehicle.vehicleName}
          </div>

          <div>
            <strong>Driver:</strong>{" "}
            {record.driver?.fullName ?? "Unassigned"}
          </div>

          <div>
            <strong>Service:</strong>{" "}
            {record.serviceType}
          </div>

          <div>
            <strong>Cost:</strong>{" "}
            KES {record.cost.toLocaleString()}
          </div>

        </div>

        <div className="mt-8 flex gap-4">

          <form action={deleteAction}>

            <button type="submit" className="rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626]">
              Delete Permanently
            </button>

          </form>

          <Link
            href={`/fleet/maintenance/${id}`}
            className="rounded-lg border px-5 py-3 hover:bg-gray-100"
          >
            Cancel
          </Link>

        </div>

      </div>

    </div>
  );
}
