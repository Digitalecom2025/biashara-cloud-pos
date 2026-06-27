import { notFound } from "next/navigation";

import DriverProfile from "@/components/fleet/DriverProfile";
import { getDriver } from "@/lib/driver-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DriverProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const driver = await getDriver(id);

  if (!driver) {
    notFound();
  }

  return (
    <div className="p-6">
      <DriverProfile driver={driver} />
    </div>
  );
}