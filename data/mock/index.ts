import { APPOINTMENT_FEE_PENCE, relativeDate } from "@/lib/config";
import type {
  Customer,
  Order,
  Appointment,
  Payment,
  Campaign,
  Communication,
} from "@/types";
// Fictional, deterministic fixtures. Never real platform records or identity matching.
const names = [
  "Emily Hart",
  "Oliver Bennett",
  "Amelia Clarke",
  "Noah Wilson",
  "Isla Morgan",
  "George Ellis",
  "Sophie Turner",
  "Arthur Reed",
  "Ava Thompson",
  "Leo Brooks",
  "Grace Parker",
  "Freddie James",
  "Lily Walker",
  "Oscar Hayes",
  "Mia Fletcher",
  "Henry Cole",
  "Evie Spencer",
  "Theo Mason",
  "Rosie Bell",
  "Archie Lewis",
  "Florence Shaw",
  "Alfie Wood",
  "Matilda Green",
  "Ethan Scott",
];
export const customers: Customer[] = names.map((name, i) => ({
  id: `cust_${String(i + 1).padStart(3, "0")}`,
  name,
  email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
  phone: `+44 7700 900${String(i + 1).padStart(3, "0")}`,
  location: [
    "Willow Bay, UK",
    "Meadowbridge, UK",
    "Fernleigh, UK",
    "Oakmere, UK",
  ][i % 4],
  since: relativeDate(-240 + i * 3),
}));
const products = [
  { name: "Everyday cotton tote", unitPrice: 2400 },
  { name: "Softcover journal", unitPrice: 1800 },
  { name: "Ceramic keepsake dish", unitPrice: 3200 },
  { name: "Linen pouch", unitPrice: 1600 },
  { name: "Botanical print set", unitPrice: 2800 },
  { name: "Gift stationery set", unitPrice: 2200 },
];
export const orders: Order[] = Array.from({ length: 48 }, (_, i) => {
  const items = [
    { ...products[i % products.length], quantity: i % 5 === 0 ? 2 : 1 },
    ...(i % 3 === 0
      ? [{ ...products[(i + 2) % products.length], quantity: 1 }]
      : []),
  ];
  return {
    id: `ORD-${1041 + i}`,
    customerId: customers[i % 20].id,
    date: relativeDate(-85 + Math.floor(i * 1.78), 9 + (i % 7)),
    items,
    amount: items.reduce((s, p) => s + p.unitPrice * p.quantity, 0),
    fulfilment:
      i % 13 === 0 ? "Cancelled" : i > 44 ? "Unfulfilled" : "Fulfilled",
    paymentId: `PAY-${2001 + i}`,
  };
});
export const appointments: Appointment[] = Array.from(
  { length: 36 },
  (_, i) => {
    const customerIndex = i < 24 ? (i === 4 ? 20 : i % 16) : i % 16;
    const days = i < 24 ? -65 + i * 2 : 1 + (i - 24) * 2;
    const cancelled = i % 9 === 0;
    return {
      id: `APT-${301 + i}`,
      customerId: customers[customerIndex].id,
      date: relativeDate(days, 9 + (i % 7)),
      bookedAt: relativeDate(days - 12, 8),
      description: [
        "Personal consultation",
        "Product discovery session",
        "Gift consultation",
      ][i % 3],
      status: cancelled ? "Cancelled" : days > 0 ? "Upcoming" : "Completed",
      ...(cancelled
        ? { cancelledAt: relativeDate(Math.min(days - 3, -1), 12) }
        : {}),
      fee: APPOINTMENT_FEE_PENCE,
      paymentId: `PAY-${2101 + i}`,
    };
  },
);
// Include appointment-only customers with genuinely sparse histories.
appointments[1].customerId = customers[21].id;
appointments[2].customerId = customers[22].id;
appointments[3].customerId = customers[23].id;
export const payments: Payment[] = [
  ...orders.map((o, i): Payment => {
    const status =
      i % 13 === 0
        ? "Refunded"
        : i % 11 === 0
          ? "Failed"
          : i % 10 === 0 && i !== 20
            ? "Pending"
            : "Successful";
    return {
      id: o.paymentId,
      customerId: o.customerId,
      date: o.date,
      provider: i % 2 === 0 ? "SumUp" : "Atoa",
      relatedId: o.id,
      relatedType: "order",
      amount: o.amount,
      method: i % 2 === 0 ? "Card" : "Bank transfer",
      status,
      ...(status === "Refunded"
        ? {
            refund: {
              amount: o.amount,
              date: relativeDate(-83 + Math.floor(i * 1.78), 14),
              reference: `REF-${401 + i}`,
            },
          }
        : {}),
    };
  }),
  ...appointments.map((a, i): Payment => {
    const status =
      i === 9
        ? "Refunded"
        : i % 7 === 0
          ? "Failed"
          : (i % 4 === 0 || i % 5 === 0) && i !== 16 && i !== 32
            ? "Pending"
            : "Successful";
    const date = new Date(a.bookedAt);
    date.setUTCMinutes(10);
    return {
      id: a.paymentId,
      customerId: a.customerId,
      date: date.toISOString(),
      provider: i % 2 === 0 ? "Atoa" : "SumUp",
      relatedId: a.id,
      relatedType: "appointment",
      amount: APPOINTMENT_FEE_PENCE,
      method: i % 2 === 0 ? "Bank transfer" : "Card",
      status,
      ...(status === "Refunded"
        ? {
            refund: {
              amount: APPOINTMENT_FEE_PENCE,
              date: a.cancelledAt!,
              reference: `REF-${501 + i}`,
            },
          }
        : {}),
    };
  }),
];
// Future booking/payment creation is shifted before the demo date; the appointment stays in the future.
appointments.forEach((a, i) => {
  if (a.bookedAt > relativeDate(0, 8)) {
    a.bookedAt = relativeDate(-1 - (i % 4), 8);
    const p = payments.find((p) => p.id === a.paymentId)!;
    p.date = a.bookedAt;
  }
});
export const campaigns: Campaign[] = [
  {
    id: "CAM-01",
    name: "A warm welcome",
    subject: "Welcome to our demo store",
    status: "Sent",
    stage: "Welcome",
    body: "Thank you for exploring our demo store. We hope you enjoy the thoughtful everyday pieces in our collection. This is a fictional message preview for the presentation demo.",
  },
  {
    id: "CAM-02",
    name: "Everyday favourites",
    subject: "Small things, thoughtfully chosen",
    status: "Sent",
    stage: "Discovery",
    body: "Discover our fictional edit of journals, keepsakes and everyday essentials. This sample email is here to demonstrate a complete customer communication history.",
  },
  {
    id: "CAM-03",
    name: "Your consultation follow-up",
    subject: "Thank you for spending time with us",
    status: "Sent",
    stage: "Follow-up",
    body: "We hope you enjoyed your recent visit. Thank you for taking a little time for yourself. No message was sent: this is a read-only fictional preview.",
  },
  {
    id: "CAM-04",
    name: "A thoughtful thank you",
    subject: "A note of appreciation",
    status: "Sent",
    stage: "After purchase",
    body: "Thank you for your recent purchase. We hope your new everyday favourite brings you joy. All products and customer details shown here are sample data.",
  },
  {
    id: "CAM-05",
    name: "The September edit",
    subject: "A new season of little discoveries",
    status: "Sent",
    stage: "Seasonal",
    body: "A considered collection for the changing season. Explore a few fictional favourites in this sample campaign. No account is connected and nothing will be sent.",
  },
  {
    id: "CAM-06",
    name: "Looking ahead to October",
    subject: "Something thoughtful is on its way",
    status: "Draft",
    stage: "Seasonal",
    body: "A draft for our next fictional seasonal collection. Draft campaigns have no recipients, deliveries, opens or clicks.",
  },
];
export const communications: Communication[] = Array.from(
  { length: 60 },
  (_, i) => {
    const c = i % 5;
    const sentAt = relativeDate(-70 + c * 13 + Math.floor(i / 5), 11);
    const add = (mins: number) =>
      new Date(new Date(sentAt).getTime() + mins * 60000).toISOString();
    const delivered = i % 17 !== 0;
    const opened = delivered && i % 3 !== 0;
    const clicked = opened && i % 4 === 0;
    return {
      id: `MSG-${601 + i}`,
      customerId: customers[i % 16].id,
      campaignId: campaigns[c].id,
      sentAt,
      status: delivered ? "Delivered" : "Bounced",
      stage: campaigns[c].stage,
      ...(delivered ? { deliveredAt: add(1) } : {}),
      ...(opened ? { openedAt: add(60) } : {}),
      ...(clicked ? { clickedAt: add(65) } : {}),
    };
  },
);
