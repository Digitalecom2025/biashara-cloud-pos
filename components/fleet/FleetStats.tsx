"use client";

type FleetStatsProps = {
  totalVehicles?: number;
  activeTrips?: number;
  fuelCost?: number;
  maintenanceDue?: number;
};

export default function FleetStats({
  totalVehicles = 2,
  activeTrips = 1,
  fuelCost = 24500,
  maintenanceDue = 1,
}: FleetStatsProps) {
  const cards = [
    {
      title: "Vehicles",
      value: totalVehicles,
      color: "#16a34a",
    },
    {
      title: "Active Trips",
      value: activeTrips,
      color: "#2563eb",
    },
    {
      title: "Fuel This Month",
      value: `KES ${fuelCost.toLocaleString()}`,
      color: "#ea580c",
    },
    {
      title: "Maintenance Due",
      value: maintenanceDue,
      color: "#dc2626",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: 20,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            borderLeft: `6px solid ${card.color}`,
            boxShadow: "0 1px 5px rgba(0,0,0,.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: 14,
            }}
          >
            {card.title}
          </p>

          <h2
            style={{
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}