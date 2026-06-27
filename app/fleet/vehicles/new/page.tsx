import { createVehicle } from "./actions";
import { getDrivers } from "@/lib/driver-data";

export default async function NewVehiclePage() {
  const drivers = await getDrivers();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Vehicle</h1>

        <p className="mt-2 text-muted-foreground">
          Register a new vehicle into your fleet.
        </p>
      </div>

<form action={createVehicle} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Plate Number
            </label>

            <input
            name="plateNumber"
              className="w-full rounded-lg border p-3"
              placeholder="KDA 123A"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vehicle Name
            </label>

            <input
             name="vehicleName"
              className="w-full rounded-lg border p-3"
              placeholder="Delivery Truck"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vehicle Type
            </label>

            <input
              name="vehicleType"
              className="w-full rounded-lg border p-3"
              placeholder="Truck"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Make
            </label>

            <input
            name="make"
              className="w-full rounded-lg border p-3"
              placeholder="Isuzu"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Model
            </label>

            <input
            name="model"
              className="w-full rounded-lg border p-3"
              placeholder="NQR"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Year
            </label>

            <input
              name="year"
              type="number"
              className="w-full rounded-lg border p-3"
              placeholder="2023"
            />
          </div>

          <div>
  <label className="mb-2 block text-sm font-medium">
    Assigned Driver
  </label>

  <select
    name="driverId"
    className="w-full rounded-lg border p-3"
  >
    <option value="">Select Driver</option>

    {drivers.map((driver) => (
      <option
        key={driver.id}
        value={driver.id}
      >
        {driver.fullName}
      </option>
    ))}
  </select>
</div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fuel Type
            </label>

            <select name="fuelType"
             className="w-full rounded-lg border p-3">
              <option>Diesel</option>
              <option>Petrol</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Current Mileage
            </label>

            <input
              name="mileage"
              type="number"
              className="w-full rounded-lg border p-3"
              placeholder="125000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select 
             name="status"
            className="w-full rounded-lg border p-3">
              <option>Active</option>
              <option>Maintenance</option>
              <option>Inactive</option>
            </select>
          </div>

        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Notes
          </label>

          <textarea
          name="notes"
            rows={4}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
  style={{
    background: "#16a34a",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "bold",
  }}
        >
          Save Vehicle
        </button>

      </form>
    </div>
  );
}