export type Platform = "Shopify" | "Klaviyo" | "TidyCal" | "SumUp" | "Atoa";
export type PaymentStatus = "Successful" | "Pending" | "Failed" | "Refunded";
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  since: string;
}
export interface Order {
  id: string;
  customerId: string;
  date: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  amount: number;
  fulfilment: "Fulfilled" | "Unfulfilled" | "Cancelled";
  paymentId: string;
}
export interface Appointment {
  id: string;
  customerId: string;
  date: string;
  bookedAt: string;
  description: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  cancelledAt?: string;
  fee: number;
  paymentId: string;
}
export interface Payment {
  id: string;
  customerId: string;
  date: string;
  provider: "SumUp" | "Atoa";
  relatedId: string;
  relatedType: "order" | "appointment";
  amount: number;
  method: string;
  status: PaymentStatus;
  refund?: { amount: number; date: string; reference: string };
}
export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "Draft" | "Sent";
  body: string;
  stage: string;
}
export interface Communication {
  id: string;
  customerId: string;
  campaignId: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  status: "Delivered" | "Bounced";
  stage: string;
}
export interface HistoryEvent {
  id: string;
  customerId: string;
  date: string;
  platform: Platform;
  type:
    | "Purchase"
    | "Booking"
    | "Completion"
    | "Cancellation"
    | "Payment"
    | "Refund"
    | "Email";
  title: string;
  detail: string;
  relatedId: string;
}
