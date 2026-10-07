"use client";
import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import {
  CustomerLink,
  PlatformBadge,
  StatusBadge,
} from "@/components/ui/shared";
import { date, money, getCustomer, getPayment } from "@/lib/data";
import { campaigns } from "@/data/mock";
import type { Order, Appointment, Payment, Communication } from "@/types";
const select = (
  value: string,
  set: (v: string) => void,
  values: string[],
  label: string,
) => (
  <select
    aria-label={label}
    value={value}
    onChange={(e) => set(e.target.value)}
  >
    <option value="all">All {label.toLowerCase()}</option>
    {values.map((v) => (
      <option key={v}>{v}</option>
    ))}
  </select>
);
export function OrdersTable({
  data,
  onDetail,
  showCustomer = true,
}: {
  data: Order[];
  onDetail: (id: string) => void;
  showCustomer?: boolean;
}) {
  const [status, setStatus] = useState("all");
  const [fulfilment, setFulfilment] = useState("all");
  const columns: TableColumn<Order>[] = [
    {
      key: "id",
      label: "Order",
      value: (o) => o.id,
      render: (o) => (
        <button className="record-link" onClick={() => onDetail(o.id)}>
          {o.id}
        </button>
      ),
    },
    ...(showCustomer
      ? [
          {
            key: "customer",
            label: "Customer",
            value: (o: Order) => getCustomer(o.customerId).name,
            render: (o: Order) => <CustomerLink id={o.customerId} />,
          },
        ]
      : []),
    {
      key: "items",
      label: "Products",
      value: (o) => o.items.map((i) => i.name).join(" "),
      render: (o) => (
        <div className="product-cell">
          {o.items.map((i) => (
            <span key={i.name}>
              {i.name} <small>×{i.quantity}</small>
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "date",
      label: "Order date",
      value: (o) => o.date,
      render: (o) => date(o.date),
    },
    {
      key: "amount",
      label: "Value",
      value: (o) => o.amount,
      render: (o) => money(o.amount),
      money: true,
    },
    {
      key: "payment",
      label: "Payment",
      value: (o) => getPayment(o.paymentId).status,
      render: (o) => <StatusBadge status={getPayment(o.paymentId).status} />,
    },
    {
      key: "fulfilment",
      label: "Fulfilment",
      value: (o) => o.fulfilment,
      render: (o) => <StatusBadge status={o.fulfilment} />,
    },
    {
      key: "source",
      label: "Source",
      value: () => "Shopify",
      render: () => <PlatformBadge platform="Shopify" />,
    },
  ];
  return (
    <DataTable
      key={`${status}-${fulfilment}`}
      data={data.filter(
        (o) =>
          (status === "all" || getPayment(o.paymentId).status === status) &&
          (fulfilment === "all" || o.fulfilment === fulfilment),
      )}
      columns={columns}
      searchText={(o) =>
        `${o.id} ${getCustomer(o.customerId).name} ${o.items.map((i) => i.name).join(" ")}`
      }
      label="Orders"
      searchPlaceholder="Search orders, customers or products…"
      filters={
        <>
          {select(
            status,
            setStatus,
            ["Successful", "Pending", "Failed", "Refunded"],
            "Payment statuses",
          )}
          {select(
            fulfilment,
            setFulfilment,
            ["Fulfilled", "Unfulfilled", "Cancelled"],
            "Fulfilment statuses",
          )}
        </>
      }
    />
  );
}
export function AppointmentsTable({
  data,
  onDetail,
  showCustomer = true,
}: {
  data: Appointment[];
  onDetail: (id: string) => void;
  showCustomer?: boolean;
}) {
  const [status, setStatus] = useState("all");
  const columns: TableColumn<Appointment>[] = [
    {
      key: "id",
      label: "Booking",
      value: (a) => a.id,
      render: (a) => (
        <button className="record-link" onClick={() => onDetail(a.id)}>
          {a.id}
        </button>
      ),
    },
    ...(showCustomer
      ? [
          {
            key: "customer",
            label: "Customer",
            value: (a: Appointment) => getCustomer(a.customerId).name,
            render: (a: Appointment) => <CustomerLink id={a.customerId} />,
          },
        ]
      : []),
    {
      key: "date",
      label: "Date & time",
      value: (a) => a.date,
      render: (a) => <span className="nowrap">{date(a.date, true)}</span>,
    },
    { key: "description", label: "Appointment", value: (a) => a.description },
    {
      key: "status",
      label: "Booking status",
      value: (a) => a.status,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "fee",
      label: "Fee",
      value: (a) => a.fee,
      render: (a) => money(a.fee),
      money: true,
    },
    {
      key: "payment",
      label: "Payment",
      value: (a) => getPayment(a.paymentId).status,
      render: (a) => (
        <>
          <StatusBadge status={getPayment(a.paymentId).status} />
          <button
            className="sub-record-link"
            onClick={() => onDetail(a.paymentId)}
          >
            {a.paymentId}
          </button>
        </>
      ),
    },
  ];
  return (
    <DataTable
      key={status}
      data={data.filter((a) => status === "all" || a.status === status)}
      columns={columns}
      searchText={(a) =>
        `${a.id} ${getCustomer(a.customerId).name} ${a.description}`
      }
      label="Appointments"
      searchPlaceholder="Search appointments…"
      filters={select(
        status,
        setStatus,
        ["Upcoming", "Completed", "Cancelled"],
        "Booking statuses",
      )}
    />
  );
}
export function PaymentsTable({
  data,
  onDetail,
  showCustomer = true,
}: {
  data: Payment[];
  onDetail: (id: string) => void;
  showCustomer?: boolean;
}) {
  const [status, setStatus] = useState("all");
  const columns: TableColumn<Payment>[] = [
    {
      key: "id",
      label: "Transaction",
      value: (p) => p.id,
      render: (p) => (
        <button className="record-link" onClick={() => onDetail(p.id)}>
          {p.id}
        </button>
      ),
    },
    ...(showCustomer
      ? [
          {
            key: "customer",
            label: "Customer",
            value: (p: Payment) => getCustomer(p.customerId).name,
            render: (p: Payment) => <CustomerLink id={p.customerId} />,
          },
        ]
      : []),
    {
      key: "date",
      label: "Date",
      value: (p) => p.date,
      render: (p) => date(p.date),
    },
    {
      key: "provider",
      label: "Provider",
      value: (p) => p.provider,
      render: (p) => <PlatformBadge platform={p.provider} />,
    },
    {
      key: "related",
      label: "Related record",
      value: (p) => p.relatedId,
      render: (p) => (
        <button className="record-link" onClick={() => onDetail(p.relatedId)}>
          {p.relatedId}
        </button>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      value: (p) => p.amount,
      render: (p) => (
        <>
          {money(p.amount)}
          {p.refund && <small>{money(p.refund.amount)} refunded</small>}
        </>
      ),
      money: true,
    },
    { key: "method", label: "Method", value: (p) => p.method },
    {
      key: "status",
      label: "Status",
      value: (p) => p.status,
      render: (p) => <StatusBadge status={p.status} />,
    },
  ];
  return (
    <DataTable
      key={status}
      data={data.filter((p) => status === "all" || p.status === status)}
      columns={columns}
      searchText={(p) =>
        `${p.id} ${p.relatedId} ${getCustomer(p.customerId).name} ${p.method}`
      }
      label="Transactions"
      searchPlaceholder="Search transactions or customers…"
      filters={select(
        status,
        setStatus,
        ["Successful", "Pending", "Failed", "Refunded"],
        "Payment statuses",
      )}
    />
  );
}
export function CommunicationsTable({
  data,
  onDetail,
  showCustomer = true,
}: {
  data: Communication[];
  onDetail: (id: string) => void;
  showCustomer?: boolean;
}) {
  const [status, setStatus] = useState("all");
  const columns: TableColumn<Communication>[] = [
    {
      key: "campaign",
      label: "Campaign / subject",
      value: (c) => campaigns.find((x) => x.id === c.campaignId)!.name,
      render: (c) => {
        const a = campaigns.find((x) => x.id === c.campaignId)!;
        return (
          <button
            className="record-link message-cell"
            onClick={() => onDetail(c.id)}
          >
            {a.name}
            <small>{a.subject}</small>
          </button>
        );
      },
    },
    ...(showCustomer
      ? [
          {
            key: "customer",
            label: "Customer",
            value: (c: Communication) => getCustomer(c.customerId).name,
            render: (c: Communication) => <CustomerLink id={c.customerId} />,
          },
        ]
      : []),
    {
      key: "sent",
      label: "Sent",
      value: (c) => c.sentAt,
      render: (c) => date(c.sentAt),
    },
    {
      key: "delivery",
      label: "Delivery",
      value: (c) => c.status,
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "opened",
      label: "Opened",
      value: (c) => c.openedAt || "",
      render: (c) => (c.openedAt ? date(c.openedAt, true) : "Not opened"),
    },
    {
      key: "clicked",
      label: "Clicked",
      value: (c) => c.clickedAt || "",
      render: (c) => (c.clickedAt ? date(c.clickedAt, true) : "No click"),
    },
    { key: "stage", label: "Follow-up stage", value: (c) => c.stage },
  ];
  return (
    <DataTable
      key={status}
      data={data.filter((c) => status === "all" || c.status === status)}
      columns={columns}
      searchText={(c) =>
        `${campaigns.find((x) => x.id === c.campaignId)!.name} ${getCustomer(c.customerId).name} ${c.id} ${c.stage}`
      }
      label="Messages"
      searchPlaceholder="Search campaigns or customers…"
      filters={select(
        status,
        setStatus,
        ["Delivered", "Bounced"],
        "Delivery statuses",
      )}
    />
  );
}
