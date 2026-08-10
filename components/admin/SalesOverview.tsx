"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNaira } from "@/lib/format";
import type { PaidOrderPoint } from "@/lib/orders";

const RANGES = [
  "today",
  "this_week",
  "this_month",
  "this_year",
  "last_30",
  "last_90",
  "all_time",
] as const;
type Range = (typeof RANGES)[number];

const RANGE_LABELS: Record<Range, string> = {
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  this_year: "This Year",
  last_30: "Last 30 Days",
  last_90: "Last 90 Days",
  all_time: "All Time",
};

// Local-time day boundaries throughout (not UTC) — this runs client-side in
// the admin's own browser, so "Today" etc should mean their local day, and
// the daily series buckets must use the same boundary or the two would
// silently disagree at the edges of a day.
function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
  const d = startOfLocalDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeStart(range: Range): Date | null {
  const today = startOfLocalDay(new Date());

  switch (range) {
    case "today":
      return today;
    case "this_week": {
      // Monday-start week.
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const diffFromMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffFromMonday);
      return monday;
    }
    case "this_month":
      return new Date(today.getFullYear(), today.getMonth(), 1);
    case "this_year":
      return new Date(today.getFullYear(), 0, 1);
    case "last_30": {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return d;
    }
    case "last_90": {
      const d = new Date(today);
      d.setDate(d.getDate() - 89);
      return d;
    }
    case "all_time":
      return null;
  }
}

function formatTickDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatCompactNaira(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value}`;
}

function tabClass(active: boolean) {
  return `px-3 py-1.5 font-sans text-xs uppercase tracking-[0.15em] transition ${
    active
      ? "bg-espresso text-ivory"
      : "border border-charcoal/20 text-charcoal/70 hover:border-bronze"
  }`;
}

export default function SalesOverview({ orders }: { orders: PaidOrderPoint[] }) {
  const [range, setRange] = useState<Range>("last_30");

  const { totalRevenue, totalOrders, series } = useMemo(() => {
    const start = rangeStart(range);
    const filtered = start
      ? orders.filter((order) => new Date(order.created_at) >= start)
      : orders;

    const totalRevenue = filtered.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filtered.length;

    const revenueByDay = new Map<string, number>();
    for (const order of filtered) {
      const key = dayKey(new Date(order.created_at));
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.total);
    }

    // Fill every day in the range (not just days with a sale) so the chart
    // shows real gaps instead of silently skipping them.
    const seriesStart =
      start ??
      (filtered.length > 0
        ? startOfLocalDay(new Date(filtered[0].created_at))
        : startOfLocalDay(new Date()));
    const seriesEnd = startOfLocalDay(new Date());

    const series: { date: string; revenue: number }[] = [];
    for (
      let cursor = new Date(seriesStart);
      cursor <= seriesEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = dayKey(cursor);
      series.push({ date: key, revenue: revenueByDay.get(key) ?? 0 });
    }

    return { totalRevenue, totalOrders, series };
  }, [orders, range]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={tabClass(range === r)}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-blush bg-ivory p-6">
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
            Total Revenue
          </p>
          <p className="mt-2 font-heading text-3xl text-espresso">
            {formatNaira(totalRevenue)}
          </p>
        </div>
        <div className="border border-blush bg-ivory p-6">
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-bronze">
            Total Orders
          </p>
          <p className="mt-2 font-heading text-3xl text-espresso">{totalOrders}</p>
        </div>
      </div>

      <div className="border border-blush bg-ivory p-6">
        <p className="mb-4 font-sans text-xs uppercase tracking-[0.15em] text-bronze">
          Daily Revenue
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesOverviewFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9c6b3f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#9c6b3f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e7d3c8" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatTickDate}
                tick={{ fill: "#2b2b2b", fontSize: 11 }}
                axisLine={{ stroke: "#e7d3c8" }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={formatCompactNaira}
                tick={{ fill: "#2b2b2b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value) => [formatNaira(Number(value)), "Revenue"]}
                labelFormatter={(label) =>
                  typeof label === "string" ? formatTickDate(label) : ""
                }
                contentStyle={{
                  backgroundColor: "#3a2f2a",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "var(--font-sans)",
                }}
                labelStyle={{ color: "#f7f3ee" }}
                itemStyle={{ color: "#f7f3ee" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#9c6b3f"
                strokeWidth={2}
                fill="url(#salesOverviewFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
