import Link from "next/link";

import { createDriver } from "./actions";

export default function NewDriverPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Add Driver
          </h1>

          <p className="mt-2 text-muted-foreground">
            Register a new fleet driver.
          </p>
        </div>

        <Link
          href="/fleet/drivers"
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          ← Back
        </Link>
      </div>

      {/* Form */}

      <form action={createDriver} className="space-y-6">

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block font-medium">
              Full Name
            </label>

            <input
              name="fullName"
              className="w-full rounded-lg border p-3"
              placeholder="John Kamau"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Phone Number
            </label>

            <input
              name="phoneNumber"
              className="w-full rounded-lg border p-3"
              placeholder="+254712345678"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Email
            </label>

            <input
              name="email"
              type="email"
              className="w-full rounded-lg border p-3"
              placeholder="driver@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              National ID
            </label>

            <input
              name="nationalId"
              className="w-full rounded-lg border p-3"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Driving Licence
            </label>

            <input
              name="licenseNumber"
              className="w-full rounded-lg border p-3"
              placeholder="DL123456"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Licence Expiry
            </label>

            <input
              name="licenseExpiry"
              type="date"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Emergency Contact
            </label>

            <input
              name="emergencyContact"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Emergency Phone
            </label>

            <input
              name="emergencyPhone"
              className="w-full rounded-lg border p-3"
            />
          </div>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Address
          </label>

          <textarea
            name="address"
            rows={3}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
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
  className="inline-flex items-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow hover:bg-green-700"
        >
          Save Driver
        </button>

      </form>
    </div>
  );
}