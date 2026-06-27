export default function FuelSummary() {
  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,.08)",
      }}
    >
      <h3>Fuel Summary</h3>

      <p>Total Fuel Cost: <strong>KES 24,500</strong></p>

      <p>Average Cost / Trip: <strong>KES 3,500</strong></p>

      <p>Fuel Entries: <strong>7</strong></p>
    </div>
  );
}