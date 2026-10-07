"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  CalendarDays,
  Receipt,
  ArrowUpRight,
  ArrowRight,
  Calendar,
  Layers3,
} from "lucide-react";
import {
  customers,
  payments,
  orders,
  appointments,
  communications,
} from "@/data/mock";
import {
  date,
  money,
  netCollected,
  nextAppointment,
  rangeStart,
  trend,
  platforms,
  getCustomer,
  time,
} from "@/lib/data";
import { APPOINTMENT_FEE_PENCE, DEMO_REFERENCE_DATE } from "@/lib/config";
import {
  StatCard,
  SectionHeader,
  StatusBadge,
  platformIcons,
} from "@/components/ui/shared";
import { PaymentChart } from "@/components/charts/payment-chart";
import { Activity } from "@/components/customers/activity";
import { RecordDetails } from "@/components/customers/record-details";
export default function Overview() {
  const [days, setDays] = useState(30);
  const [detail, setDetail] = useState<string | null>(null);
  const start = rangeStart(days);
  const upcoming = nextAppointment();
  const count = (p: string) =>
    p === "Shopify"
      ? orders.length
      : p === "TidyCal"
        ? appointments.length
        : p === "Klaviyo"
          ? communications.length
          : payments.filter((x) => x.provider === p).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR BUSINESS, AT A GLANCE</div>
          <h1>A little more clarity.</h1>
          <p>Welcome back. Here’s an overview of your demo business.</p>
        </div>
        <div className="date-control">
          <Calendar size={15} />
          <select
            aria-label="Overview date range"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Total customers"
          value={customers.length}
          note="All-time customer profiles"
          icon={Users}
        />
        <StatCard
          label="Net payments collected"
          value={money(netCollected(payments, start))}
          note={`Last ${days} days · after refunds`}
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          label="Upcoming appointments"
          value={upcoming.length}
          note={`All future bookings · after ${date(DEMO_REFERENCE_DATE).slice(0, 6)}`}
          icon={CalendarDays}
          tone="lavender"
        />
        <StatCard
          label="Appointment fees collected"
          value={money(
            netCollected(
              payments.filter((p) => p.relatedType === "appointment"),
              start,
            ),
          )}
          note={`Last ${days} days · ${money(APPOINTMENT_FEE_PENCE)} per appointment`}
          icon={Receipt}
          tone="beige"
        />
      </div>
      <div className="overview-primary">
        <section className="card trend-card">
          <SectionHeader
            title="Payment collection"
            subtitle="A clearer view of what’s coming in."
          >
            <span className="chart-legend">
              <i />
              Net collected
            </span>
          </SectionHeader>
          <div className="chart-total">
            {money(netCollected(payments, start))}
            <span>
              {date(start)} – {date(DEMO_REFERENCE_DATE)}
            </span>
          </div>
          <PaymentChart data={trend(days)} />
          <div className="chart-caption">
            Successful payments, less explicit refunds. Pending and failed
            payments excluded.
          </div>
        </section>
        <section className="card upcoming-card">
          <SectionHeader
            title="Coming up"
            subtitle="A little time, thoughtfully set aside."
            href="/platforms/tidycal"
          />
          <div className="upcoming-list">
            {upcoming.slice(0, 3).map((a) => (
              <div className="upcoming-item" key={a.id}>
                <div className="appointment-date">
                  <strong>{new Date(a.date).getUTCDate()}</strong>
                  <span>
                    {new Intl.DateTimeFormat("en-GB", {
                      month: "short",
                      timeZone: "Europe/London",
                    })
                      .format(new Date(a.date))
                      .toUpperCase()}
                  </span>
                </div>
                <div className="upcoming-copy">
                  <Link href={`/customers/profile?id=${a.customerId}`}>
                    {getCustomer(a.customerId).name}
                  </Link>
                  <button onClick={() => setDetail(a.id)}>
                    {a.description}
                  </button>
                  <small>
                    {time(a.date)} <span>·</span> {money(a.fee)}
                  </small>
                </div>
                <StatusBadge status="Upcoming" />
              </div>
            ))}
          </div>
          <Link href="/platforms/tidycal" className="card-footer-link">
            View all {upcoming.length} upcoming appointments
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <div className="overview-secondary">
        <section className="card">
          <SectionHeader
            title="Recent activity"
            subtitle={`The latest moments across your platforms · last ${days} days`}
            href="/customers"
            action="Customers"
          />
          <Activity compact start={start} onDetail={setDetail} />
        </section>
        <section className="card sources-card">
          <SectionHeader
            title="Your data sources"
            subtitle="Five platforms. One considered view."
          />
          {platforms.map((p) => {
            const Icon = platformIcons[p];
            return (
              <Link
                key={p}
                href={`/platforms/${p.toLowerCase()}`}
                className="source-row"
              >
                <span className={`platform-logo ${p.toLowerCase()}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <strong>{p}</strong>
                  <small>
                    {count(p)}{" "}
                    {p === "Shopify"
                      ? "orders"
                      : p === "Klaviyo"
                        ? "messages"
                        : p === "TidyCal"
                          ? "appointments"
                          : "transactions"}
                  </small>
                </div>
                <span className="badge">Demo data</span>
                <ArrowUpRight size={14} />
              </Link>
            );
          })}
          <div className="sources-note">
            <Layers3 size={16} />
            <span>
              Prepared sample records.
              <br />
              No platform accounts are connected.
            </span>
          </div>
        </section>
      </div>
      <div className="insight-banner">
        <span className="icon-tile sage">
          <Users size={20} />
        </span>
        <div>
          <strong>Behind every record, a customer.</strong>
          <p>
            Explore their purchases, appointments and conversations in one
            place.
          </p>
        </div>
        <Link href="/customers" className="text-link">
          Explore customers <ArrowRight size={16} />
        </Link>
      </div>
      <RecordDetails recordId={detail} onClose={() => setDetail(null)} />
    </>
  );
}
