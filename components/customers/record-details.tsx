"use client";
import {
  orders,
  appointments,
  payments,
  campaigns,
  communications,
} from "@/data/mock";
import { APPOINTMENT_FEE_PENCE } from "@/lib/config";
import { date, money, getPayment } from "@/lib/data";
import { DetailSheet } from "@/components/ui/sheet";
import {
  CustomerLink,
  PlatformBadge,
  StatusBadge,
} from "@/components/ui/shared";
export function RecordDetails({
  recordId,
  onClose,
}: {
  recordId: string | null;
  onClose: () => void;
}) {
  const order = orders.find((o) => o.id === recordId);
  const appointment = appointments.find((a) => a.id === recordId);
  const payment = payments.find((p) => p.id === recordId);
  const communication = communications.find((c) => c.id === recordId);
  const campaign = campaigns.find(
    (c) => c.id === (communication?.campaignId || recordId),
  );
  const record = order || appointment || payment || communication;
  return (
    <DetailSheet
      open={!!recordId}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={campaign?.name || recordId || "Record"}
      description={
        order
          ? "Customer purchase · Shopify"
          : appointment
            ? "Appointment · TidyCal"
            : payment
              ? `Payment · ${payment.provider}`
              : "Communication · Klaviyo"
      }
    >
      {record && (
        <div className="detail-customer">
          <CustomerLink id={record.customerId} email />
        </div>
      )}
      {order && (
        <>
          <dl className="details-grid">
            <dt>Order date</dt>
            <dd>{date(order.date, true)}</dd>
            <dt>Payment status</dt>
            <dd>
              <StatusBadge status={getPayment(order.paymentId).status} />
            </dd>
            <dt>Fulfilment</dt>
            <dd>
              <StatusBadge status={order.fulfilment} />
            </dd>
            <dt>Payment reference</dt>
            <dd>{order.paymentId}</dd>
          </dl>
          <h3 className="detail-subtitle">Items purchased</h3>
          {order.items.map((item) => (
            <div className="line-item" key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <small>
                  {item.quantity} × {money(item.unitPrice)}
                </small>
              </div>
              <strong>{money(item.quantity * item.unitPrice)}</strong>
            </div>
          ))}
          <div className="detail-total">
            <span>Order value</span>
            <strong>{money(order.amount)}</strong>
          </div>
        </>
      )}
      {appointment && (
        <>
          <dl className="details-grid">
            <dt>Appointment</dt>
            <dd>{appointment.description}</dd>
            <dt>Scheduled for</dt>
            <dd>{date(appointment.date, true)}</dd>
            <dt>Timezone</dt>
            <dd>Europe/London</dd>
            <dt>Booked on</dt>
            <dd>{date(appointment.bookedAt, true)}</dd>
            <dt>Booking status</dt>
            <dd>
              <StatusBadge status={appointment.status} />
            </dd>
            <dt>Appointment fee</dt>
            <dd>{money(appointment.fee)}</dd>
            <dt>Payment status</dt>
            <dd>
              <StatusBadge status={getPayment(appointment.paymentId).status} />
            </dd>
            <dt>Payment reference</dt>
            <dd>{appointment.paymentId}</dd>
            {appointment.cancelledAt && (
              <>
                <dt>Cancelled on</dt>
                <dd>{date(appointment.cancelledAt, true)}</dd>
              </>
            )}
          </dl>
          <div className="detail-note">
            Booking status and payment status are separate. Every appointment
            has a fixed {money(APPOINTMENT_FEE_PENCE)} fee.
          </div>
        </>
      )}
      {payment && (
        <>
          <dl className="details-grid">
            <dt>Provider</dt>
            <dd>
              <PlatformBadge platform={payment.provider} />
            </dd>
            <dt>Transaction date</dt>
            <dd>{date(payment.date, true)}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={payment.status} />
            </dd>
            <dt>Payment method</dt>
            <dd>{payment.method}</dd>
            <dt>Related {payment.relatedType}</dt>
            <dd>{payment.relatedId}</dd>
            <dt>Transaction amount</dt>
            <dd>{money(payment.amount)}</dd>
            <dt>Collected, after refunds</dt>
            <dd>
              {money(
                payment.status === "Successful"
                  ? payment.amount
                  : payment.status === "Refunded"
                    ? payment.amount - (payment.refund?.amount || 0)
                    : 0,
              )}
            </dd>
            {payment.refund && (
              <>
                <dt>Refund reference</dt>
                <dd>{payment.refund.reference}</dd>
                <dt>Refund date</dt>
                <dd>{date(payment.refund.date, true)}</dd>
                <dt>Refund amount</dt>
                <dd>{money(payment.refund.amount)}</dd>
              </>
            )}
          </dl>
          {payment.refund && (
            <div className="detail-note">
              This explicit refund is subtracted from collected totals on its
              refund date.
            </div>
          )}
        </>
      )}
      {campaign && (
        <>
          <div className="row between">
            <StatusBadge status={campaign.status} />
            <span className="badge">{campaign.stage}</span>
          </div>
          {communication && (
            <dl className="details-grid">
              <dt>Message reference</dt>
              <dd>{communication.id}</dd>
              <dt>Sent</dt>
              <dd>{date(communication.sentAt, true)}</dd>
              <dt>Delivery</dt>
              <dd>
                <StatusBadge status={communication.status} />
              </dd>
              <dt>Opened</dt>
              <dd>
                {communication.openedAt
                  ? date(communication.openedAt, true)
                  : "Not opened"}
              </dd>
              <dt>Clicked</dt>
              <dd>
                {communication.clickedAt
                  ? date(communication.clickedAt, true)
                  : "No click recorded"}
              </dd>
            </dl>
          )}
          <div className="message-preview">
            <span className="eyebrow">READ-ONLY MESSAGE PREVIEW</span>
            <h3>{campaign.subject}</h3>
            <p>Hello there,</p>
            <p>{campaign.body}</p>
            <p>
              With care,
              <br />
              The demo team
            </p>
          </div>
        </>
      )}
    </DetailSheet>
  );
}
