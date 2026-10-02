type Props = {
  status: string;
};

export default function StatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Completed: "bg-green-100 text-green-700",

    Pending: "bg-yellow-100 text-yellow-700",

    "In Progress": "bg-blue-100 text-blue-700",

    Inactive: "bg-gray-100 text-gray-700",

    Cancelled: "bg-red-100 text-red-700",

    Overdue: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}