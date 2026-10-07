"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export function PaymentChart({
  data,
  label = "Net collected",
}: {
  data: { label: string; value: number }[];
  label?: string;
}) {
  return (
    <ChartContainer config={{ value: { label, color: "#709378" } }}>
      <AreaChart
        data={data}
        margin={{ left: -15, right: 12, top: 12, bottom: 0 }}
        accessibilityLayer
      >
        <defs>
          <linearGradient id="payment-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92b197" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#92b197" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="#eef0eb"
          strokeDasharray="3 4"
        />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#849080", fontSize: 10 }}
          tickMargin={12}
          minTickGap={15}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#849080", fontSize: 10 }}
          tickFormatter={(v) => `£${v}`}
          tickCount={5}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2.5}
          fill="url(#payment-fill)"
          activeDot={{ r: 5, strokeWidth: 3, stroke: "#fff" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
