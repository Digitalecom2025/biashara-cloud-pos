"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

type ChartData = {
  name: string;
  value: number;
};

type Props = {
  title: string;
  data: ChartData[];
};

export default function FleetChart({ title, data }: Props) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-black text-[#173324]">{title}</h2>
          <p className="mt-0.5 text-xs text-[#789083]">Monthly trip volume from recorded fleet trips.</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
          <BarChart3 size={18} />
        </span>
      </div>

      <div className="mt-4 h-80">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-6 text-center">
            <div>
              <BarChart3 className="mx-auto text-[#9AAEA3]" size={32} />
              <p className="mt-3 text-sm font-black text-[#173324]">No trip trend yet</p>
              <p className="mt-1 text-xs text-[#789083]">Record trips to build the monthly activity chart.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#E8F0EA" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#789083", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#789083", fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
