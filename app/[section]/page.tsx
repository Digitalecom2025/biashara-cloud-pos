import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";
import { sidebarItems } from "@/lib/navigation";

export function generateStaticParams() {
  return sidebarItems
    .filter((item) => !["/", "/products", "/sales", "/customers", "/debtors", "/purchases", "/suppliers", "/warehouse", "/stock-adjustments", "/transfer"].includes(item.href))
    .map((item) => ({ section: item.href.slice(1) }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const item = sidebarItems.find((entry) => entry.href === `/${section}`);

  if (!item || ["/products", "/sales", "/customers", "/debtors", "/purchases", "/suppliers", "/warehouse", "/stock-adjustments", "/transfer"].includes(item.href)) {
    notFound();
  }

  return <PlaceholderPage title={item.label} />;
}
