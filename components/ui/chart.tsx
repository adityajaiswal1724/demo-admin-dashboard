"use client";
import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
export type ChartConfig = Record<string, { label: string; color: string }>;
const ChartContext = React.createContext<ChartConfig>({});
export function ChartContainer({
  config,
  children,
}: {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  return (
    <ChartContext.Provider value={config}>
      <div
        className="chart-container"
        style={
          Object.fromEntries(
            Object.entries(config).map(([key, value]) => [
              `--color-${key}`,
              value.color,
            ]),
          ) as React.CSSProperties
        }
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 235 }}
        >
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}
export const ChartTooltip = Tooltip;
export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly { value?: number | string; dataKey?: number | string }[];
  label?: string | number;
}) {
  const config = React.useContext(ChartContext);
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((p, i) => (
        <div key={i}>
          {config[String(p.dataKey)]?.label}:{" "}
          <b>
            {new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: "GBP",
            }).format(Number(p.value))}
          </b>
        </div>
      ))}
    </div>
  );
}
