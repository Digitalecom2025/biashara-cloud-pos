"use client";

import Link from "next/link";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-132px)] max-w-3xl place-items-center">
      <section className="w-full rounded-3xl border border-[#DDEAE0] bg-white p-6 text-center shadow-sm shadow-[#12311F]/5 md:p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#07120D] text-[#22C55E]">
          <CloudOff size={30} />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#16A34A]">Biashara Cloud POS</p>
        <h1 className="mt-2 text-2xl font-black text-[#10271B] md:text-3xl">You&apos;re offline</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#60766B]">
          You&apos;re offline. Biashara POS will allow offline sales in the next Hybrid Sync stage. Reconnect to continue full cloud features.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-2 text-xs font-black text-[#8A670C]">
          <Wifi size={14} /> Offline Mode
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => window.location.reload()} className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">
            <span className="inline-flex items-center gap-2"><RefreshCw size={14} /> Retry connection</span>
          </button>
          <Link href="/" className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">Back to dashboard</Link>
        </div>
      </section>
    </div>
  );
}
