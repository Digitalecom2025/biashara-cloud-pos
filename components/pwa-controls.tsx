"use client";

import { useEffect, useState } from "react";
import { Download, Wifi, WifiOff } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaControls() {
  const [online, setOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState("");

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallMessage("");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

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
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("load", registerServiceWorker);
      window.clearTimeout(onlineTimer);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setInstallMessage("To install, open browser menu and choose Add to Home Screen.");
      window.setTimeout(() => setInstallMessage(""), 3500);
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[9px] font-black uppercase tracking-wider sm:px-3 sm:text-[10px] ${online ? "border-[#16A34A]/25 bg-[#16A34A]/10 text-[#0F8C42]" : "border-[#D4A017]/35 bg-[#FFF9E8] text-[#8A670C]"}`}>
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        {online ? "Online" : "Offline Mode"}
      </span>
      <button onClick={installApp} className="hidden items-center gap-1.5 rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#60766B] hover:bg-[#F8FBF8] lg:inline-flex">
        <Download size={13} /> Install App
      </button>
      {installMessage && <span className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] p-3 text-[11px] font-bold leading-5 text-[#8A670C] shadow-lg">{installMessage}</span>}
    </div>
  );
}
