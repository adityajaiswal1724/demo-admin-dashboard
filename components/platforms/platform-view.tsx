"use client";
import { useState } from "react";
import {
  ShoppingBag,
  Wallet,
  Package,
  CalendarDays,
  CheckCheck,
  Clock,
  Mail,
  MousePointerClick,
  Eye,
  Send,
  ArrowLeft,
  ArrowRight,
  List,
  Calendar,
  RotateCcw,
} from "lucide-react";
import {
  orders,
  appointments,
  payments,
  campaigns,
  communications,
} from "@/data/mock";
import {
  date,
  time,
  dayKey,
  money,
  netCollected,
  getCustomer,
  trend,
} from "@/lib/data";
import {
  APPOINTMENT_FEE_PENCE,
  DEMO_REFERENCE_DATE,
  TIME_ZONE,
} from "@/lib/config";
import {
  StatCard,
  SectionHeader,
  StatusBadge,
  ExternalButton,
  CustomerLink,
  EmptyState,
  platformIcons,
} from "@/components/ui/shared";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  OrdersTable,
  AppointmentsTable,
  PaymentsTable,
  CommunicationsTable,
} from "@/components/customers/record-tables";
import { RecordDetails } from "@/components/customers/record-details";
import { PaymentChart } from "@/components/charts/payment-chart";
import type { Campaign, Platform } from "@/types";
const descriptions: Record<Platform, string> = {
  Shopify: "Thoughtful purchases, from first discovery to familiar favourites.",
  Klaviyo:
    "Every conversation, and the little moments of engagement that follow.",
  TidyCal: "Time with your customers, all in one thoughtfully organised diary.",
  SumUp: "A clear view of customer payments collected through SumUp.",
  Atoa: "A clear view of customer payments collected through Atoa.",
};
export function PlatformView({ platform }: { platform: Platform }) {
  const [detail, setDetail] = useState<string | null>(null);
  const Icon = platformIcons[platform];
  return (
    <>
      <div className="page-heading platform-heading">
        <div className="row">
          <span className={`platform-hero-icon ${platform.toLowerCase()}`}>
            <Icon size={26} />
          </span>
          <div>
            <div className="row">
              <h1>{platform}</h1>
              <span className="badge">Demo data</span>
            </div>
            <p>{descriptions[platform]}</p>
          </div>
        </div>
        <ExternalButton platform={platform} label="Open website" />
      </div>
      {platform === "Shopify" ? (
        <Shopify onDetail={setDetail} />
      ) : platform === "Klaviyo" ? (
        <Klaviyo onDetail={setDetail} />
      ) : platform === "TidyCal" ? (
        <TidyCal onDetail={setDetail} />
      ) : (
        <PaymentProvider provider={platform} onDetail={setDetail} />
      )}
      <p className="page-footnote">
        Prepared local sample data · No {platform} account is connected ·
        External links open the public platform website only.
      </p>
      <RecordDetails recordId={detail} onClose={() => setDetail(null)} />
    </>
  );
}
function Shopify({ onDetail }: { onDetail: (id: string) => void }) {
  const [days, setDays] = useState(90);
  const products = orders
    .flatMap((o) => o.items)
    .reduce<Record<string, { quantity: number; value: number }>>((r, i) => {
      r[i.name] ??= { quantity: 0, value: 0 };
      r[i.name].quantity += i.quantity;
      r[i.name].value += i.quantity * i.unitPrice;
      return r;
    }, {});
  return (
    <>
      <div className="stats-grid">
        <StatCard
          label="Customer orders"
          value={orders.length}
          note="All-time recorded orders"
          icon={ShoppingBag}
        />
        <StatCard
          label="Total order value"
          value={money(orders.reduce((s, o) => s + o.amount, 0))}
          note="All orders · not payment collections"
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          label="Products purchased"
          value={orders.reduce(
            (s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0),
            0,
          )}
          note="Total units across all orders"
          icon={Package}
          tone="beige"
        />
        <StatCard
          label="Fulfilled orders"
          value={orders.filter((o) => o.fulfilment === "Fulfilled").length}
          note="All-time fulfilment status"
          icon={CheckCheck}
          tone="lavender"
        />
      </div>
      <div className="platform-split">
        <section className="card">
          <SectionHeader
            title="Order value over time"
            subtitle="Recorded sales value, including unpaid and refunded orders."
          >
            <select
              aria-label="Sales chart date range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </SectionHeader>
          <PaymentChart data={trend(days, [], orders)} label="Order value" />
          <div className="chart-caption">
            Sales and collected payments are separate measurements.
          </div>
        </section>
        <section className="card">
          <SectionHeader
            title="Customer favourites"
            subtitle="Products purchased · all time"
          />
          <div className="product-summary">
            {Object.entries(products)
              .sort((a, b) => b[1].quantity - a[1].quantity)
              .map(([name, p], i) => (
                <div className="product-summary-row" key={name}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>{p.quantity} units purchased</small>
                  </div>
                  <strong>{money(p.value)}</strong>
                </div>
              ))}
          </div>
        </section>
      </div>
      <section className="card section-gap">
        <SectionHeader
          title="All orders"
          subtitle="Explore customer purchases and their linked payments."
        />
        <OrdersTable data={orders} onDetail={onDetail} />
      </section>
    </>
  );
}
function PaymentProvider({
  provider,
  onDetail,
}: {
  provider: "SumUp" | "Atoa";
  onDetail: (id: string) => void;
}) {
  const data = payments.filter((p) => p.provider === provider);
  return (
    <>
      <div className="stats-grid">
        <StatCard
          label="Net collected"
          value={money(netCollected(data))}
          note="All time · successful, less refunds"
          icon={Wallet}
        />
        <StatCard
          label="Successful payments"
          value={data.filter((p) => p.status === "Successful").length}
          note="Currently successful transactions"
          icon={CheckCheck}
          tone="blue"
        />
        <StatCard
          label="Awaiting payment"
          value={data.filter((p) => p.status === "Pending").length}
          note={`${money(data.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0))} pending · excluded from collections`}
          icon={Clock}
          tone="beige"
        />
        <StatCard
          label="Explicit refunds"
          value={money(data.reduce((s, p) => s + (p.refund?.amount || 0), 0))}
          note={`${data.filter((p) => p.refund).length} refunded transactions · all time`}
          icon={RotateCcw}
          tone="lavender"
        />
      </div>
      <div className="ledger-note">
        <Wallet size={19} />
        <div>
          <strong>One ledger. A consistent picture.</strong>
          <p>
            This is the {provider} view of the shared payment records. Collected
            totals exclude pending and failed payments and subtract explicit
            refunds.
          </p>
        </div>
      </div>
      <section className="card">
        <SectionHeader
          title={`${provider} transactions`}
          subtitle={`${data.length} records · ${data.filter((p) => p.status === "Failed").length} failed · all time`}
        />
        <PaymentsTable data={data} onDetail={onDetail} />
      </section>
    </>
  );
}
function Klaviyo({ onDetail }: { onDetail: (id: string) => void }) {
  const [status, setStatus] = useState("all");
  const sent = communications.length,
    delivered = communications.filter((c) => c.deliveredAt).length,
    opened = communications.filter((c) => c.openedAt).length,
    clicked = communications.filter((c) => c.clickedAt).length;
  const metrics = (id: string) =>
    communications.filter((c) => c.campaignId === id);
  const columns: TableColumn<Campaign>[] = [
    {
      key: "campaign",
      label: "Campaign",
      value: (c) => c.name,
      render: (c) => (
        <button
          className="record-link message-cell"
          onClick={() => onDetail(c.id)}
        >
          {c.name}
          <small>{c.subject}</small>
        </button>
      ),
    },
    {
      key: "status",
      label: "Status",
      value: (c) => c.status,
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "recipients",
      label: "Recipients",
      value: (c) => metrics(c.id).length,
    },
    {
      key: "delivered",
      label: "Delivered",
      value: (c) => metrics(c.id).filter((m) => m.deliveredAt).length,
    },
    {
      key: "opened",
      label: "Opened",
      value: (c) => metrics(c.id).filter((m) => m.openedAt).length,
    },
    {
      key: "clicked",
      label: "Clicked",
      value: (c) => metrics(c.id).filter((m) => m.clickedAt).length,
    },
    { key: "stage", label: "Follow-up stage", value: (c) => c.stage },
  ];
  return (
    <>
      <div className="stats-grid">
        <StatCard
          label="Messages sent"
          value={sent}
          note={`${campaigns.filter((c) => c.status === "Sent").length} sent campaigns · all time`}
          icon={Send}
        />
        <StatCard
          label="Delivered"
          value={delivered}
          note={`${sent - delivered} bounced · sample email events`}
          icon={Mail}
          tone="blue"
        />
        <StatCard
          label="Unique opens"
          value={opened}
          note={`${((opened / delivered) * 100).toFixed(1)}% of delivered messages`}
          icon={Eye}
          tone="lavender"
        />
        <StatCard
          label="Unique clicks"
          value={clicked}
          note={`${((clicked / delivered) * 100).toFixed(1)}% of delivered messages`}
          icon={MousePointerClick}
          tone="beige"
        />
      </div>
      <Tabs defaultValue="campaigns">
        <TabsList aria-label="Klaviyo sections">
          <TabsTrigger value="campaigns">
            Campaigns <span>{campaigns.length}</span>
          </TabsTrigger>
          <TabsTrigger value="activity">Customer communications</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns">
          <section className="card">
            <SectionHeader
              title="A considered conversation"
              subtitle="Fictional campaigns and engagement calculated from message records."
            />
            <DataTable
              key={status}
              data={campaigns.filter(
                (c) => status === "all" || c.status === status,
              )}
              columns={columns}
              searchText={(c) => `${c.name} ${c.subject} ${c.stage}`}
              label="Campaigns"
              searchPlaceholder="Search campaigns…"
              filters={
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-label="Campaign status"
                >
                  <option value="all">All statuses</option>
                  <option>Sent</option>
                  <option>Draft</option>
                </select>
              }
            />
          </section>
          <div className="communication-note">
            <Mail size={20} />
            <div>
              <h3>Every number has a story behind it.</h3>
              <p>
                Open the customer communications tab to explore the individual
                messages behind these totals. Drafts have no recipient activity.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <section className="card">
            <SectionHeader
              title="Customer communication activity"
              subtitle="View delivery, open and click timestamps and read-only message previews."
            />
            <CommunicationsTable data={communications} onDetail={onDetail} />
          </section>
        </TabsContent>
      </Tabs>
    </>
  );
}
function TidyCal({ onDetail }: { onDetail: (id: string) => void }) {
  const [view, setView] = useState("list");
  const [month, setMonth] = useState(0);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const base = new Date(DEMO_REFERENCE_DATE);
  const start = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + month, 1),
  );
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  );
  const data = appointments.filter(
    (a) =>
      a.date >= start.toISOString() &&
      a.date <= new Date(end.getTime() + 86400000 - 1).toISOString() &&
      (status === "all" || a.status === status) &&
      `${getCustomer(a.customerId).name} ${a.id} ${a.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const grouped = data.reduce<Record<string, typeof appointments>>(
    (groups, a) => {
      (groups[dayKey(a.date)] ??= []).push(a);
      return groups;
    },
    {},
  );
  return (
    <>
      <div className="stats-grid">
        <StatCard
          label="Upcoming appointments"
          value={appointments.filter((a) => a.status === "Upcoming").length}
          note={`All future bookings after ${date(DEMO_REFERENCE_DATE)}`}
          icon={CalendarDays}
        />
        <StatCard
          label="Completed"
          value={appointments.filter((a) => a.status === "Completed").length}
          note="Past completed appointments"
          icon={CheckCheck}
          tone="blue"
        />
        <StatCard
          label="Cancelled"
          value={appointments.filter((a) => a.status === "Cancelled").length}
          note="Booking status · refunds are separate"
          icon={Clock}
          tone="lavender"
        />
        <StatCard
          label="Appointment fee"
          value={money(APPOINTMENT_FEE_PENCE)}
          note="Fixed fee for every appointment"
          icon={Wallet}
          tone="beige"
        />
      </div>
      <section className="card">
        <SectionHeader
          title="The appointment diary"
          subtitle="All times shown in Europe/London."
        >
          <div
            className="view-toggle"
            role="group"
            aria-label="Appointment presentation"
          >
            <button
              className={view === "list" ? "selected" : ""}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={14} />
              List
            </button>
            <button
              className={view === "agenda" ? "selected" : ""}
              aria-pressed={view === "agenda"}
              onClick={() => setView("agenda")}
            >
              <Calendar size={14} />
              Agenda
            </button>
          </div>
        </SectionHeader>
        {view === "list" ? (
          <AppointmentsTable data={appointments} onDetail={onDetail} />
        ) : (
          <>
            <div className="agenda-toolbar">
              <div className="row">
                <button
                  className="icon-button"
                  aria-label="Previous month"
                  onClick={() => setMonth(month - 1)}
                >
                  <ArrowLeft size={17} />
                </button>
                <h3>
                  {new Intl.DateTimeFormat("en-GB", {
                    month: "long",
                    year: "numeric",
                    timeZone: TIME_ZONE,
                  }).format(start)}
                </h3>
                <button
                  className="icon-button"
                  aria-label="Next month"
                  onClick={() => setMonth(month + 1)}
                >
                  <ArrowRight size={17} />
                </button>
                <button className="button" onClick={() => setMonth(0)}>
                  Demo month
                </button>
              </div>
              <div className="agenda-filters">
                <input
                  aria-label="Search agenda"
                  placeholder="Search appointments…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Agenda booking status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option>Upcoming</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="agenda">
              {Object.keys(grouped)
                .sort()
                .map((key) => (
                  <div className="agenda-day" key={key}>
                    <div className="agenda-day-label">
                      <strong>
                        {new Intl.DateTimeFormat("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          timeZone: TIME_ZONE,
                        }).format(new Date(grouped[key][0].date))}
                      </strong>
                    </div>
                    <div>
                      {grouped[key]
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((a) => (
                          <div className="agenda-appointment" key={a.id}>
                            <span className="agenda-time">{time(a.date)}</span>
                            <CustomerLink id={a.customerId} />
                            <button
                              className="agenda-detail"
                              onClick={() => onDetail(a.id)}
                            >
                              <strong>{a.description}</strong>
                              <small>
                                {a.id} · {money(a.fee)}
                              </small>
                            </button>
                            <StatusBadge status={a.status} />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              {!data.length && (
                <EmptyState
                  title="A little breathing room"
                  description="No appointments match this month and these filters. Navigate to another month or change your search."
                />
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
