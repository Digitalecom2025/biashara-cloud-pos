"use client";

import { useEffect, useState } from "react";

const LEADSSTACKS_CACHE_PREFIXES = ["leadsstacks-", "leadsstacks-pos-shell-"];

/** Runs globally so an old localhost worker cannot survive into a dev session. */
export function PwaServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      if (!("serviceWorker" in navigator)) return;

      const register = () => navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      if (document.readyState === "complete") void register();
      else window.addEventListener("load", register, { once: true });

      return () => window.removeEventListener("load", register);
    }

    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister())),
    );

    if ("caches" in window) {
      void caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => LEADSSTACKS_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
            .map((key) => caches.delete(key)),
        ),
      );
    }
  }, []);

  return null;
}

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

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearTimeout(onlineTimer);
    };
  }, []);

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase tracking-wider sm:px-3 sm:text-[10px] ${online ? "border-[#16A34A]/25 bg-[#16A34A]/10 text-[#0F8C42]" : "border-[#D4A017]/35 bg-[#FFF9E8] text-[#8A670C]"}`}>
        <span className={`h-2 w-2 rounded-full ${online ? "bg-[#16A34A]" : "bg-[#D4A017]"}`} />
        {online ? "Online" : "Offline"}
      </span>
    </div>
  );
}
