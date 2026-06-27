type Driver = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  nationalId: string | null;
  licenseNumber: string;
  licenseExpiry: Date | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
};

type DriverProfileProps = {
  driver: Driver;
};

export default function DriverProfile({
  driver,
}: DriverProfileProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-6 space-y-6">

      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">
          {driver.fullName}
        </h1>

        <p className="text-gray-500 mt-1">
          Fleet Driver Profile
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <InfoCard
          label="Phone Number"
          value={driver.phoneNumber}
        />

        <InfoCard
          label="Email"
          value={driver.email}
        />

        <InfoCard
          label="National ID"
          value={driver.nationalId}
        />

        <InfoCard
          label="Driving Licence"
          value={driver.licenseNumber}
        />

        <InfoCard
          label="Licence Expiry"
          value={
            driver.licenseExpiry
              ? new Date(driver.licenseExpiry).toLocaleDateString()
              : "-"
          }
        />

        <InfoCard
          label="Status"
          value={driver.status}
        />

        <InfoCard
          label="Emergency Contact"
          value={driver.emergencyContact}
        />

        <InfoCard
          label="Emergency Phone"
          value={driver.emergencyPhone}
        />

      </div>

      <div>

        <h2 className="font-semibold mb-2">
          Address
        </h2>

        <div className="rounded-lg border p-4">
          {driver.address || "-"}
        </div>

      </div>

      <div>

        <h2 className="font-semibold mb-2">
          Notes
        </h2>

        <div className="rounded-lg border p-4">
          {driver.notes || "-"}
        </div>

      </div>

    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg border p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value || "-"}
      </p>

    </div>
  );
}