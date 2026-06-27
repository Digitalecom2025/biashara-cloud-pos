export default function RecentTrips() {
  const trips = [
    {
      vehicle: "KDA 123A",
      from: "Nairobi",
      to: "Thika",
      driver: "John Kamau",
      status: "Completed",
    },
    {
      vehicle: "KDL 456B",
      from: "Nairobi",
      to: "Kitui",
      driver: "Peter Mwangi",
      status: "On Route",
    },
  ];

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,.08)",
      }}
    >
      <h3>Recent Trips</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 15,
        }}
      >
        <thead>
          <tr>
            <th align="left">Vehicle</th>
            <th align="left">From</th>
            <th align="left">To</th>
            <th align="left">Driver</th>
            <th align="left">Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip, index) => (
            <tr key={index}>
              <td>{trip.vehicle}</td>
              <td>{trip.from}</td>
              <td>{trip.to}</td>
              <td>{trip.driver}</td>
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}