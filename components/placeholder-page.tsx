import Link from "next/link";
import { ArrowRight, Construction, Sparkles } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-[1500px]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">LeadsStacks POS</p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">{title}</h2>
      <p className="mt-1 text-sm text-[#789083]">This module is ready for the next build phase.</p>

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
        <div className="relative grid min-h-[420px] place-items-center overflow-hidden p-8 text-center">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#16A34A]/8" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#D4A017]/8" />
          <div className="relative max-w-lg">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#12311F] text-[#22C55E] shadow-lg shadow-[#12311F]/15">
              <Construction size={28} />
            </span>
            <p className="mt-5 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">
              <Sparkles size={13} /> Planned module
            </p>
            <h3 className="mt-2 text-xl font-black text-[#173324]">{title} workspace</h3>
            <p className="mt-3 text-sm leading-6 text-[#789083]">
              Navigation is connected and the page shell is in place. Detailed workflows, forms and data will be added after the core UI foundation.
            </p>
            <Link href="/" className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">
              Return to dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
