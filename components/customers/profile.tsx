"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Wallet,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Heart,
} from "lucide-react";
import {
  customers,
  orders,
  appointments,
  payments,
  communications,
  campaigns,
} from "@/data/mock";
import {
  date,
  time,
  money,
  netCollected,
  customerSources,
  nextAppointment,
  platforms,
  getPayment,
} from "@/lib/data";
import { APPOINTMENT_FEE_PENCE, DEMO_REFERENCE_DATE } from "@/lib/config";
import {
  Avatar,
  PlatformBadge,
  StatusBadge,
  ExternalButton,
  StatCard,
  SectionHeader,
  EmptyState,
} from "@/components/ui/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity } from "./activity";
import { RecordDetails } from "./record-details";
import {
  OrdersTable,
  AppointmentsTable,
  PaymentsTable,
  CommunicationsTable,
} from "./record-tables";
export function CustomerProfile() {
  const params = useSearchParams();
  const id = params.get("id");
  const customer = customers.find((c) => c.id === id);
  const [detail, setDetail] = useState<string | null>(null);
  if (!customer)
    return (
      <>
        <Link href="/customers" className="text-link">
          <ArrowLeft size={15} /> Back to customers
        </Link>
        <section className="card">
          <EmptyState
            title="Customer not found"
            description="Choose a customer from the directory or search by name, email, phone or customer ID."
          />
        </section>
      </>
    );
  const ownOrders = orders
    .filter((o) => o.customerId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const ownAppointments = appointments.filter((a) => a.customerId === id);
  const ownPayments = payments
    .filter((p) => p.customerId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const ownComms = communications
    .filter((c) => c.customerId === id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const upcoming = nextAppointment(customer.id);
  const next = upcoming[0];
  const sources = customerSources(customer.id);
  const latest = ownPayments[0];
  return (
    <>
      <Link href="/customers" className="back-link">
        <ArrowLeft size={14} /> Back to customers
      </Link>
      <section className="profile-hero card">
        <div className="profile-hero-top">
          <Avatar name={customer.name} large />
          <div className="profile-heading">
            <div className="row">
              <h1>{customer.name}</h1>
              <span className="badge customer-id">{customer.id}</span>
            </div>
            <div className="profile-contact">
              <span>
                <Mail size={13} />
                {customer.email}
              </span>
              <span>
                <Phone size={13} />
                {customer.phone}
              </span>
            </div>
            <div className="profile-contact">
              <span>
                <MapPin size={13} />
                {customer.location}{" "}
                <span className="fictional-tag">Fictional</span>
              </span>
              <span>
                <CalendarDays size={13} />
                Customer since {date(customer.since)}
              </span>
            </div>
          </div>
          <div className="profile-relationship">
            <Heart size={16} />
            <span>
              One customer.
              <br />
              <strong>A complete story.</strong>
            </span>
          </div>
        </div>
        <div className="profile-hero-bottom">
          <span>Customer activity across</span>
          <div className="source-badges">
            {sources.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
          </div>
          <span className="profile-demo-note">
            Manually prepared sample profile
          </span>
        </div>
      </section>
      <div className="stats-grid profile-stats">
        <StatCard
          label="Total collected"
          value={money(netCollected(ownPayments))}
          note="All time · after explicit refunds"
          icon={Wallet}
        />
        <StatCard
          label="Purchases"
          value={ownOrders.length}
          note="All recorded customer orders"
          icon={ShoppingBag}
          tone="blue"
        />
        <StatCard
          label="Past appointments"
          value={
            ownAppointments.filter((a) => a.date <= DEMO_REFERENCE_DATE).length
          }
          note="Past dates · including cancellations"
          icon={Clock}
          tone="lavender"
        />
        <StatCard
          label="Next appointment"
          value={
            next
              ? new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  timeZone: "Europe/London",
                }).format(new Date(next.date))
              : "Not scheduled"
          }
          note={
            next
              ? `${time(next.date)} · Europe/London · ${money(next.fee)}`
              : "No upcoming bookings"
          }
          icon={CalendarDays}
          tone="beige"
        />
      </div>
      <Tabs defaultValue="overview">
        <TabsList aria-label="Customer profile sections">
          {[
            ["overview", "Overview"],
            ["history", "Complete history"],
            ["purchases", "Purchases"],
            ["appointments", "Appointments"],
            ["payments", "Payments"],
            ["communications", "Communications"],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
              {value === "purchases" && <span>{ownOrders.length}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <div className="profile-columns">
            <div className="profile-main">
              <section className="card">
                <SectionHeader
                  title="Recent purchases"
                  subtitle="Their latest little discoveries."
                />
                {ownOrders.length ? (
                  ownOrders.slice(0, 3).map((o) => (
                    <button
                      className="purchase-preview"
                      key={o.id}
                      onClick={() => setDetail(o.id)}
                    >
                      <span className="icon-tile beige">
                        <ShoppingBag size={18} />
                      </span>
                      <span className="purchase-preview-copy">
                        <strong>
                          {o.items
                            .map(
                              (i) =>
                                `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`,
                            )
                            .join(" + ")}
                        </strong>
                        <small>
                          {o.id} <span>·</span> {date(o.date)}
                        </small>
                      </span>
                      <span className="purchase-preview-amount">
                        <strong>{money(o.amount)}</strong>
                        <StatusBadge status={getPayment(o.paymentId).status} />
                      </span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))
                ) : (
                  <EmptyState
                    title="No purchases yet"
                    description="This customer has no recorded Shopify orders."
                  />
                )}
              </section>
              <section className="card">
                <SectionHeader
                  title="Recent activity"
                  subtitle="The moments that make up their story."
                />
                <Activity
                  customerId={customer.id}
                  compact
                  onDetail={setDetail}
                />
              </section>
            </div>
            <div className="profile-aside">
              <section className="card next-appointment-card">
                <SectionHeader title="Their next appointment">
                  <CalendarDays size={18} />
                </SectionHeader>
                {next ? (
                  <div className="next-appointment-body">
                    <span className="eyebrow">A MOMENT IN THE DIARY</span>
                    <h2>{date(next.date)}</h2>
                    <p>{time(next.date)} · Europe/London</p>
                    <div className="next-description">
                      {next.description}
                      <small>{next.id}</small>
                    </div>
                    <div className="row between">
                      <strong>{money(next.fee)}</strong>
                      <StatusBadge status={getPayment(next.paymentId).status} />
                    </div>
                    <button
                      className="button"
                      onClick={() => setDetail(next.id)}
                    >
                      View appointment <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming appointment"
                    description="There’s nothing in the diary for this customer."
                  />
                )}
              </section>
              <section className="card">
                <SectionHeader title="Latest payment" />
                {latest ? (
                  <button
                    className="latest-payment"
                    onClick={() => setDetail(latest.id)}
                  >
                    <div className="row between">
                      <strong>{money(latest.amount)}</strong>
                      <StatusBadge status={latest.status} />
                    </div>
                    <div className="row between">
                      <PlatformBadge platform={latest.provider} />
                      <span>{date(latest.date)}</span>
                    </div>
                    <small>
                      {latest.id} · {latest.relatedId}
                    </small>
                  </button>
                ) : (
                  <EmptyState title="No payments recorded" />
                )}
              </section>
              <section className="card customer-notes">
                <h3>Customer details</h3>
                <dl>
                  <dt>Customer ID</dt>
                  <dd>{customer.id}</dd>
                  <dt>First recorded</dt>
                  <dd>{date(customer.since)}</dd>
                  <dt>Email activity</dt>
                  <dd>
                    {ownComms.length} messages ·{" "}
                    {ownComms.filter((c) => c.openedAt).length} opened
                  </dd>
                </dl>
                {ownComms[0] && (
                  <p className="latest-communication-subject">
                    {
                      campaigns.find((c) => c.id === ownComms[0].campaignId)
                        ?.subject
                    }
                    <small>
                      {date(ownComms[0].sentAt)} · {ownComms[0].status}
                    </small>
                  </p>
                )}
                {ownComms[0] && (
                  <button
                    className="text-link"
                    onClick={() => setDetail(ownComms[0].id)}
                  >
                    Latest communication <ArrowUpRight size={14} />
                  </button>
                )}
              </section>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history">
          {upcoming.length > 0 && (
            <div className="future-notice">
              <CalendarDays size={18} />
              <span>
                {upcoming.length} future appointment
                {upcoming.length === 1 ? "" : "s"} · next{" "}
                {date(upcoming[0].date, true)}. Future appointments appear in
                the Appointments tab.
              </span>
            </div>
          )}
          <section className="card">
            <SectionHeader
              title="Complete customer history"
              subtitle="Every recorded past event, across all their platforms."
            />
            <Activity customerId={customer.id} onDetail={setDetail} />
          </section>
        </TabsContent>
        <TabsContent value="purchases">
          <section className="card">
            <SectionHeader
              title="Customer purchases"
              subtitle="Order values are separate from payment collections."
            />
            <OrdersTable
              data={ownOrders}
              onDetail={setDetail}
              showCustomer={false}
            />
          </section>
        </TabsContent>
        <TabsContent value="appointments">
          <section className="card">
            <SectionHeader
              title="Upcoming appointments"
              subtitle={`Future bookings · all appointment fees are ${money(APPOINTMENT_FEE_PENCE)}`}
            />
            <AppointmentsTable
              data={ownAppointments.filter((a) => a.date > DEMO_REFERENCE_DATE)}
              onDetail={setDetail}
              showCustomer={false}
            />
          </section>
          <section className="card section-gap">
            <SectionHeader
              title="Past appointments"
              subtitle="Booking and payment statuses are shown separately."
            />
            <AppointmentsTable
              data={ownAppointments.filter(
                (a) => a.date <= DEMO_REFERENCE_DATE,
              )}
              onDetail={setDetail}
              showCustomer={false}
            />
          </section>
        </TabsContent>
        <TabsContent value="payments">
          <section className="card">
            <SectionHeader
              title="Payment ledger"
              subtitle="Successful collections less explicit refunds. Pending and failed payments are excluded from totals."
            />
            <PaymentsTable
              data={ownPayments}
              onDetail={setDetail}
              showCustomer={false}
            />
          </section>
        </TabsContent>
        <TabsContent value="communications">
          <section className="card">
            <SectionHeader
              title="Communications"
              subtitle="Fictional Klaviyo messages and recorded engagement."
            />
            <CommunicationsTable
              data={ownComms}
              onDetail={setDetail}
              showCustomer={false}
            />
          </section>
        </TabsContent>
      </Tabs>
      <section className="open-platforms card">
        <div>
          <h3>Open platform</h3>
          <p>
            Opens the platform website. No account is connected in this demo.
          </p>
        </div>
        <div className="platform-buttons">
          {platforms.map((p) => (
            <ExternalButton key={p} platform={p} />
          ))}
        </div>
      </section>
      <RecordDetails recordId={detail} onClose={() => setDetail(null)} />
    </>
  );
}
