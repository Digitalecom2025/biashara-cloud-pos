import Card from "./Card";

export default function LoadingCard() {
  return (
    <Card className="animate-pulse p-6">
      <div className="h-4 w-32 rounded bg-gray-200"></div>

      <div className="mt-4 h-8 w-24 rounded bg-gray-200"></div>

      <div className="mt-6 h-3 w-full rounded bg-gray-100"></div>
    </Card>
  );
}