import {
  customers,
  orders,
  appointments,
  payments,
  campaigns,
  communications,
} from "@/data/mock";
import { DEMO_REFERENCE_DATE, TIME_ZONE } from "./config";
import type { HistoryEvent, Payment, Platform } from "@/types";
export const platforms: Platform[] = [
  "Shopify",
  "Klaviyo",
  "TidyCal",
  "SumUp",
  "Atoa",
];
export const platformUrls: Record<Platform, string> = {
  Shopify: "https://www.shopify.com/uk",
  Klaviyo: "https://www.klaviyo.com/",
  TidyCal: "https://tidycal.com/",
  SumUp: "https://www.sumup.com/en-gb/",
  Atoa: "https://paywithatoa.co.uk/",
};
export const money = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    pence / 100,
  );
export const date = (value: string, withTime = false) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: TIME_ZONE,
  }).format(new Date(value));
export const time = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
export const dayKey = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
export const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("");
export const getCustomer = (id: string) => customers.find((c) => c.id === id)!;
export const getPayment = (id: string) => payments.find((p) => p.id === id)!;
export const inRange = (d: string, start?: string, end = DEMO_REFERENCE_DATE) =>
  d <= end && (!start || d >= start);
export function rangeStart(days: number) {
  return new Date(
    new Date(DEMO_REFERENCE_DATE).getTime() - days * 86400000,
  ).toISOString();
}
export function netCollected(
  ledger: Payment[] = payments,
  start?: string,
  end = DEMO_REFERENCE_DATE,
) {
  return ledger.reduce(
    (sum, p) =>
      sum +
      ((p.status === "Successful" || p.status === "Refunded") &&
      inRange(p.date, start, end)
        ? p.amount
        : 0) -
      (p.refund && inRange(p.refund.date, start, end) ? p.refund.amount : 0),
    0,
  );
}
export function customerSources(id: string): Platform[] {
  return platforms.filter((p) =>
    p === "Shopify"
      ? orders.some((x) => x.customerId === id)
      : p === "TidyCal"
        ? appointments.some((x) => x.customerId === id)
        : p === "Klaviyo"
          ? communications.some((x) => x.customerId === id)
          : payments.some((x) => x.customerId === id && x.provider === p),
  );
}
export function searchCustomers(query: string) {
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  return customers.filter(
    (c) =>
      !q ||
      [c.name, c.email, c.id].some((v) => v.toLowerCase().includes(q)) ||
      (digits.length > 0 &&
        /^[+\d\s().-]+$/.test(q) &&
        c.phone.replace(/\D/g, "").includes(digits.replace(/^0/, ""))),
  );
}
export function nextAppointment(id?: string) {
  return appointments
    .filter(
      (a) =>
        (!id || a.customerId === id) &&
        a.status === "Upcoming" &&
        a.date > DEMO_REFERENCE_DATE,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}
export const history: HistoryEvent[] = [
  ...orders.map((o) => ({
    id: `event-${o.id}`,
    customerId: o.customerId,
    date: o.date,
    platform: "Shopify" as const,
    type: "Purchase" as const,
    title: "Placed an order",
    detail: `${o.id} · ${o.items.map((i) => i.name).join(", ")} · ${money(o.amount)}`,
    relatedId: o.id,
  })),
  ...appointments.flatMap((a) => [
    {
      id: `book-${a.id}`,
      customerId: a.customerId,
      date: a.bookedAt,
      platform: "TidyCal" as const,
      type: "Booking" as const,
      title: "Booked an appointment",
      detail: `${a.description} · ${a.id} · scheduled ${date(a.date, true)}`,
      relatedId: a.id,
    },
    ...(a.status === "Completed"
      ? [
          {
            id: `complete-${a.id}`,
            customerId: a.customerId,
            date: a.date,
            platform: "TidyCal" as const,
            type: "Completion" as const,
            title: "Appointment completed",
            detail: `${a.description} · ${a.id}`,
            relatedId: a.id,
          },
        ]
      : []),
    ...(a.cancelledAt
      ? [
          {
            id: `cancel-${a.id}`,
            customerId: a.customerId,
            date: a.cancelledAt,
            platform: "TidyCal" as const,
            type: "Cancellation" as const,
            title: "Appointment cancelled",
            detail: `${a.description} · ${a.id}`,
            relatedId: a.id,
          },
        ]
      : []),
  ]),
  ...payments.flatMap((p) => [
    {
      id: `event-${p.id}`,
      customerId: p.customerId,
      date: p.date,
      platform: p.provider,
      type: "Payment" as const,
      title:
        p.status === "Refunded" || p.status === "Successful"
          ? "Payment received"
          : `Payment ${p.status.toLowerCase()}`,
      detail: `${money(p.amount)} · ${p.method} · ${p.relatedId}`,
      relatedId: p.id,
    },
    ...(p.refund
      ? [
          {
            id: p.refund.reference,
            customerId: p.customerId,
            date: p.refund.date,
            platform: p.provider,
            type: "Refund" as const,
            title: "Payment refunded",
            detail: `${money(p.refund.amount)} · ${p.refund.reference} · ${p.relatedId}`,
            relatedId: p.id,
          },
        ]
      : []),
  ]),
  ...communications.flatMap((c) => {
    const campaign = campaigns.find((x) => x.id === c.campaignId)!;
    return [
      {
        id: `sent-${c.id}`,
        customerId: c.customerId,
        date: c.sentAt,
        platform: "Klaviyo" as const,
        type: "Email" as const,
        title: "Email sent",
        detail: campaign.subject,
        relatedId: c.id,
      },
      ...(c.deliveredAt
        ? [
            {
              id: `delivered-${c.id}`,
              customerId: c.customerId,
              date: c.deliveredAt,
              platform: "Klaviyo" as const,
              type: "Email" as const,
              title: "Email delivered",
              detail: campaign.subject,
              relatedId: c.id,
            },
          ]
        : [
            {
              id: `bounced-${c.id}`,
              customerId: c.customerId,
              date: c.sentAt,
              platform: "Klaviyo" as const,
              type: "Email" as const,
              title: "Email bounced",
              detail: campaign.subject,
              relatedId: c.id,
            },
          ]),
      ...(c.openedAt
        ? [
            {
              id: `open-${c.id}`,
              customerId: c.customerId,
              date: c.openedAt,
              platform: "Klaviyo" as const,
              type: "Email" as const,
              title: "Email opened",
              detail: campaign.subject,
              relatedId: c.id,
            },
          ]
        : []),
      ...(c.clickedAt
        ? [
            {
              id: `click-${c.id}`,
              customerId: c.customerId,
              date: c.clickedAt,
              platform: "Klaviyo" as const,
              type: "Email" as const,
              title: "Email link clicked",
              detail: campaign.subject,
              relatedId: c.id,
            },
          ]
        : []),
    ];
  }),
]
  .filter((e) => e.date <= DEMO_REFERENCE_DATE)
  .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
export const latestActivity = (id: string) =>
  history.find((h) => h.customerId === id)?.date;
export function trend(
  days: number,
  ledger: Payment[] = payments,
  orderRecords?: typeof orders,
) {
  const start = new Date(rangeStart(days));
  const bucket = Math.ceil(days / 7);
  return Array.from({ length: Math.ceil(days / bucket) }, (_, i) => {
    const from = new Date(
      start.getTime() + i * bucket * 86400000,
    ).toISOString();
    const to = new Date(
      Math.min(
        start.getTime() + (i + 1) * bucket * 86400000 - 1,
        new Date(DEMO_REFERENCE_DATE).getTime(),
      ),
    ).toISOString();
    return {
      label: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: TIME_ZONE,
      }).format(new Date(from)),
      value:
        (orderRecords
          ? orderRecords
              .filter((o) => inRange(o.date, from, to))
              .reduce((s, o) => s + o.amount, 0)
          : netCollected(ledger, from, to)) / 100,
    };
  });
}
