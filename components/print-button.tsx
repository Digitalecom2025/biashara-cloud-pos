"use client";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-[#0B2416] print:hidden"
    >
      {label}
    </button>
  );
}

