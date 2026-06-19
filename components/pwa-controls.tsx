"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function PwaControls() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const onlineTimer = window.setTimeout(() => {
      setOnline(navigator.onLine);
    }, 0);

    const registerServiceWorker = () => navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    if ("serviceWorker" in navigator) {
      if (document.readyState === "complete") {
        void registerServiceWorker();
      } else {
        window.addEventListener("load", registerServiceWorker);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("load", registerServiceWorker);
      window.clearTimeout(onlineTimer);
    };
  }, []);

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase tracking-wider sm:px-3 sm:text-[10px] ${online ? "border-[#16A34A]/25 bg-[#16A34A]/10 text-[#0F8C42]" : "border-[#D4A017]/35 bg-[#FFF9E8] text-[#8A670C]"}`}>
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        {online ? "Online" : "Offline Mode"}
      </span>
    </div>
  );
}
