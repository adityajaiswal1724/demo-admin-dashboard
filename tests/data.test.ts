import test from "node:test";
import assert from "node:assert/strict";
import {
  customers,
  orders,
  appointments,
  payments,
  communications,
  campaigns,
} from "../data/mock/index";
import { APPOINTMENT_FEE_PENCE, DEMO_REFERENCE_DATE } from "../lib/config";
import {
  netCollected,
  customerSources,
  searchCustomers,
  history,
  rangeStart,
  trend,
  platforms,
} from "../lib/data";
test("fixture counts, unique IDs and fictional customer contacts", () => {
  assert.ok(
    customers.length >= 20 &&
      orders.length >= 40 &&
      appointments.length >= 30 &&
      campaigns.length >= 5,
  );
  for (const data of [
    customers,
    orders,
    appointments,
    payments,
    communications,
    campaigns,
  ])
    assert.equal(new Set(data.map((r) => r.id)).size, data.length);
  customers.forEach((c) => {
    assert.ok(c.email.endsWith("@example.com"));
    assert.match(c.phone, /^\+44 7700 900\d{3}$/);
  });
});
test("orders and appointments have exact, reciprocal ledger relationships", () => {
  for (const record of [...orders, ...appointments]) {
    const p = payments.find((p) => p.id === record.paymentId);
    assert.ok(p);
    assert.equal(p.relatedId, record.id);
    assert.equal(p.customerId, record.customerId);
    assert.equal(
      p.amount,
      "amount" in record ? record.amount : APPOINTMENT_FEE_PENCE,
    );
  }
  orders.forEach((o) =>
    assert.equal(
      o.amount,
      o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    ),
  );
  appointments.forEach((a) => assert.equal(a.fee, 1500));
});
test("all records have valid customers, campaign links, integer pence and past event timestamps", () => {
  [...orders, ...appointments, ...payments, ...communications].forEach((r) =>
    assert.ok(customers.some((c) => c.id === r.customerId)),
  );
  payments.forEach((p) => {
    assert.ok(Number.isInteger(p.amount));
    assert.ok(p.date <= DEMO_REFERENCE_DATE);
    if (p.refund) {
      assert.ok(p.refund.date >= p.date);
      assert.ok(p.refund.date <= DEMO_REFERENCE_DATE);
      assert.ok(p.refund.amount <= p.amount);
    }
  });
  communications.forEach((c) => {
    assert.ok(
      campaigns.some((a) => a.id === c.campaignId && a.status === "Sent"),
    );
    if (c.clickedAt) assert.ok(c.openedAt && c.deliveredAt);
    if (c.openedAt) assert.ok(c.deliveredAt);
  });
  history.forEach((e) => assert.ok(e.date <= DEMO_REFERENCE_DATE));
});
test("ledger arithmetic counts collections once, excludes pending/failed and subtracts explicit refunds", () => {
  const expected = payments
    .filter((p) => ["Successful", "Refunded"].includes(p.status))
    .reduce((s, p) => s + p.amount - (p.refund?.amount || 0), 0);
  assert.equal(netCollected(), expected);
  assert.equal(
    customers.reduce(
      (s, c) => s + netCollected(payments.filter((p) => p.customerId === c.id)),
      0,
    ),
    expected,
  );
  assert.equal(
    netCollected(payments.filter((p) => p.provider === "SumUp")) +
      netCollected(payments.filter((p) => p.provider === "Atoa")),
    expected,
  );
  for (const days of [7, 30, 90])
    assert.equal(
      Math.round(trend(days).reduce((s, v) => s + v.value * 100, 0)),
      netCollected(payments, rangeStart(days)),
    );
});
test("refund is recognised in its own period even when collection was earlier", () => {
  const p = payments.find((p) => p.refund)!;
  assert.equal(
    netCollected([p], p.refund!.date, p.refund!.date),
    -p.refund!.amount,
  );
  assert.equal(netCollected([p], p.date, p.date), p.amount);
});
test("search trims whitespace, ignores case, matches partial IDs, and normalises phones", () => {
  assert.equal(searchCustomers("  EMILY HART ")[0].id, "cust_001");
  assert.ok(searchCustomers("example.com").length === customers.length);
  assert.equal(searchCustomers("cust_024")[0].name, "Ethan Scott");
  assert.equal(searchCustomers("07700 900001")[0].name, "Emily Hart");
  assert.equal(searchCustomers("+44 (7700) 900001")[0].id, "cust_001");
  assert.equal(searchCustomers("no such person").length, 0);
});
test("rich and sparse profiles and independent booking/payment statuses are represented", () => {
  assert.ok(
    customers.filter((c) => customerSources(c.id).length === platforms.length)
      .length >= 3,
  );
  assert.ok(
    customers.some(
      (c) =>
        orders.some((o) => o.customerId === c.id) &&
        !appointments.some((a) => a.customerId === c.id),
    ),
  );
  assert.ok(
    customers.some(
      (c) =>
        appointments.some((a) => a.customerId === c.id) &&
        !orders.some((o) => o.customerId === c.id),
    ),
  );
  const status = (id: string) => payments.find((p) => p.id === id)!.status;
  assert.ok(
    appointments.some(
      (a) => a.status === "Upcoming" && status(a.paymentId) === "Successful",
    ),
  );
  assert.ok(
    appointments.some(
      (a) => a.status === "Completed" && status(a.paymentId) === "Pending",
    ),
  );
  assert.ok(
    appointments.some(
      (a) => a.status === "Cancelled" && status(a.paymentId) === "Successful",
    ),
  );
});
test("complete history represents every underlying past record and refund", () => {
  for (const r of [...orders, ...appointments, ...payments, ...communications])
    assert.ok(
      history.some((h) => h.relatedId === r.id),
      `Missing ${r.id}`,
    );
  payments
    .filter((p) => p.refund)
    .forEach((p) =>
      assert.ok(
        history.some((h) => h.relatedId === p.id && h.type === "Refund"),
      ),
    );
});
