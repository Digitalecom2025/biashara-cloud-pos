import Link from "next/link";
import { InfoCard, MetricGrid, ProfileHeader, TransactionTable, formatCurrency, StatusBadge } from "@/components/profile-ui";
import type { ProductProfileData } from "@/lib/profile-data";

export function ProductProfilePage({ product }: { product: ProductProfileData }) {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ProfileHeader
        eyebrow="Product profile"
        title={product.name}
        subtitle={`${product.businessName} - ${product.category}`}
        backHref="/products"
        backLabel="Back to products"
        actions={
          <>
            <Link href="/products" className="rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Edit product</Link>
            <Link href="/stock-adjustments" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">Adjust stock</Link>
            <Link href="/transfer" className="rounded-xl border border-[#D4A017]/40 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C]">Transfer stock</Link>
          </>
        }
      />
      <MetricGrid metrics={product.metrics} />
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <InfoCard title="Product details" rows={[
          ["Code", product.code],
          ["SKU", product.sku],
          ["Barcode", product.barcode],
          ["Brand", product.brand],
          ["Unit", product.unit],
          ["Status", product.status],
        ]} />
        <InfoCard title="Stock location and pricing" rows={[
          ["Purchase price", formatCurrency(product.purchasePrice)],
          ["Sale price", formatCurrency(product.salePrice)],
          ["Warehouse", product.warehouse],
          ["Rack", product.rack],
          ["Shelf", product.shelf],
          ["Reorder level", `${product.reorderLevel}`],
        ]} />
      </section>
      <section className="mt-5 rounded-2xl border border-[#DDEAE0] bg-white p-5">
        <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-[#173324]">Stock status</h3><p className="mt-1 text-xs text-[#789083]">{product.description || "No product description added."}</p></div><StatusBadge status={product.status} /></div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <TransactionTable title="Sale history" empty="No sales recorded for this product yet." rows={product.saleHistory} />
        <TransactionTable title="Purchase history" empty="No purchases recorded for this product yet." rows={product.purchaseHistory} />
      </section>
      <section className="mt-5">
        <TransactionTable title="Stock movement history" empty="No stock movements recorded for this product yet." rows={product.stockMovements} />
      </section>
    </div>
  );
}

