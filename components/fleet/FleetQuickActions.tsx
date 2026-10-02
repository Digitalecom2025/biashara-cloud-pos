import Link from "next/link";
import {
  BarChart3,
  Fuel,
  Route,
  ShieldCheck,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const actions: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    title: "Vehicles",
    description: "Fleet assets and assignments",
    href: "/fleet/vehicles",
    icon: Truck,
    tone: "bg-[#16A34A]/10 text-[#16A34A]",
  },
  {
    title: "Drivers",
    description: "Licences and contacts",
    href: "/fleet/drivers",
    icon: UserRound,
    tone: "bg-[#D4A017]/12 text-[#A57809]",
  },
  {
    title: "Trips",
    description: "Routes and odometer logs",
    href: "/fleet/trips",
    icon: Route,
    tone: "bg-[#16A34A]/10 text-[#0F8C42]",
  },
  {
    title: "Fuel",
    description: "Purchases and consumption",
    href: "/fleet/fuel",
    icon: Fuel,
    tone: "bg-[#D4A017]/12 text-[#9A7108]",
  },
  {
    title: "Maintenance",
    description: "Services and due alerts",
    href: "/fleet/maintenance",
    icon: ShieldCheck,
    tone: "bg-[#EF4444]/10 text-[#EF4444]",
  },
  {
    title: "Reports",
    description: "Performance analytics",
    href: "/fleet/reports",
    icon: BarChart3,
    tone: "bg-[#12311F]/10 text-[#12311F]",
  },
];

export default function FleetQuickActions() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5 transition hover:border-[#16A34A]/35 hover:bg-[#FBFDFB]"
        >
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${action.tone}`}>
            <action.icon size={18} />
          </span>
          <h3 className="mt-4 text-sm font-black text-[#173324]">{action.title}</h3>
          <p className="mt-1 text-[11px] leading-4 text-[#789083]">{action.description}</p>
        </Link>
      ))}
    </section>
  );
}
