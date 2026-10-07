"use client";
import { useState } from "react";
import { Users, Layers3, Search } from "lucide-react";
import { customers, payments } from "@/data/mock";
import {
  customerSources,
  date,
  money,
  netCollected,
  latestActivity,
  nextAppointment,
  platforms,
} from "@/lib/data";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import {
  CustomerLink,
  PlatformBadge,
  ProfileArrow,
} from "@/components/ui/shared";
import type { Customer, Platform } from "@/types";
export default function Customers() {
  const [source, setSource] = useState("all");
  const columns: TableColumn<Customer>[] = [
    {
      key: "name",
      label: "Customer",
      value: (c) => c.name,
      render: (c) => <CustomerLink id={c.id} email />,
    },
    {
      key: "id",
      label: "Customer ID",
      value: (c) => c.id,
      render: (c) => <span className="mono muted">{c.id}</span>,
    },
    {
      key: "sources",
      label: "Platforms",
      value: (c) => customerSources(c.id).join(" "),
      render: (c) => (
        <div className="source-badges">
          {customerSources(c.id).map((p) => (
            <PlatformBadge key={p} platform={p} compact />
          ))}
        </div>
      ),
    },
    {
      key: "total",
      label: "Total collected",
      value: (c) => netCollected(payments.filter((p) => p.customerId === c.id)),
      render: (c) =>
        money(netCollected(payments.filter((p) => p.customerId === c.id))),
      money: true,
    },
    {
      key: "activity",
      label: "Latest activity",
      value: (c) => latestActivity(c.id) || "",
      render: (c) =>
        latestActivity(c.id) ? date(latestActivity(c.id)!) : "No activity",
    },
    {
      key: "next",
      label: "Next appointment",
      value: (c) => nextAppointment(c.id)[0]?.date || "",
      render: (c) =>
        nextAppointment(c.id)[0] ? (
          date(nextAppointment(c.id)[0].date)
        ) : (
          <span className="muted">None scheduled</span>
        ),
    },
    {
      key: "profile",
      label: "Profile",
      value: (c) => c.id,
      render: (c) => <ProfileArrow id={c.id} />,
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE, NOT JUST RECORDS</div>
          <h1>Your customers</h1>
          <p>
            Every purchase, appointment and conversation. A complete picture.
          </p>
        </div>
        <span className="count-pill">
          <Users size={16} />
          {customers.length} customers
        </span>
      </div>
      <div className="directory-banner">
        <span className="icon-tile sage">
          <Layers3 size={22} />
        </span>
        <div>
          <h3>A familiar face, wherever they find you.</h3>
          <p>Explore one unified profile across all five platforms.</p>
        </div>
        <button
          className="button"
          onClick={() => document.dispatchEvent(new Event("customer-search"))}
        >
          <Search size={15} />
          Search Customer Profile
        </button>
      </div>
      <section className="card">
        <DataTable
          key={source}
          data={customers.filter(
            (c) =>
              source === "all" ||
              customerSources(c.id).includes(source as Platform),
          )}
          columns={columns}
          searchText={(c) => `${c.name} ${c.email} ${c.id} ${c.phone}`}
          searchPlaceholder="Search customers by name, email or ID…"
          label="Customers"
          pageSize={8}
          filters={
            <select
              aria-label="Customer source platform"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="all">All platforms</option>
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          }
        />
      </section>
      <p className="page-footnote">
        All customer details are fictional. Platform relationships are manually
        prepared for this demo.
      </p>
    </>
  );
}
