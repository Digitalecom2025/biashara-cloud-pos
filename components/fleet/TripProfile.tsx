type Props = {
  label: string;
  value: string;
};

export default function TripProfile({
  label,
  value,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b py-3">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-medium text-right">
        {value}
      </span>
    </div>
  );
}