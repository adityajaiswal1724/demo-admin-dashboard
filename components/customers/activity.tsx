"use client";
import { useState } from "react";
import Link from "next/link";
import { history, platforms, date, getCustomer } from "@/lib/data";
import {
  Avatar,
  PlatformBadge,
  EmptyState,
  platformIcons,
} from "@/components/ui/shared";
export function Activity({
  customerId,
  compact = false,
  onDetail,
  start,
}: {
  customerId?: string;
  compact?: boolean;
  onDetail: (id: string) => void;
  start?: string;
}) {
  const [source, setSource] = useState("all");
  const [type, setType] = useState("all");
  const [limit, setLimit] = useState(12);
  const events = history.filter(
    (e) =>
      (!customerId || e.customerId === customerId) &&
      (!start || e.date >= start) &&
      (source === "all" || e.platform === source) &&
      (type === "all" || e.type === type),
  );
  return (
    <>
      {!compact && (
        <div className="history-filters">
          <span>{events.length} events · complete recorded history</span>
          <div className="row">
            <select
              aria-label="History platform"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setLimit(12);
              }}
            >
              <option value="all">All platforms</option>
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              aria-label="Event type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setLimit(12);
              }}
            >
              <option value="all">All event types</option>
              {[
                "Purchase",
                "Booking",
                "Completion",
                "Cancellation",
                "Payment",
                "Refund",
                "Email",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {!events.length ? (
        <EmptyState
          title="No activity to display"
          description="No past activity matches the selected filters."
        />
      ) : (
        <div className={`activity-list ${compact ? "compact" : ""}`}>
          {events.slice(0, compact ? 5 : limit).map((e) => {
            const c = getCustomer(e.customerId);
            const Icon = platformIcons[e.platform];
            return (
              <div className="activity-item" key={e.id}>
                {customerId ? (
                  <span className={`activity-icon ${e.platform.toLowerCase()}`}>
                    <Icon size={15} />
                  </span>
                ) : (
                  <Avatar name={c.name} />
                )}
                <div className="activity-copy">
                  {!customerId && (
                    <Link
                      href={`/customers/profile?id=${c.id}`}
                      className="activity-customer"
                    >
                      {c.name}
                    </Link>
                  )}
                  <button
                    className="activity-title"
                    onClick={() => onDetail(e.relatedId)}
                  >
                    {e.title}
                  </button>
                  {!compact && <p>{e.detail}</p>}
                  <div className="activity-meta">
                    <PlatformBadge platform={e.platform} />
                    <time>{date(e.date, true)}</time>
                  </div>
                </div>
                {compact && (
                  <button
                    className="icon-button"
                    aria-label={`View ${e.relatedId}`}
                    onClick={() => onDetail(e.relatedId)}
                  >
                    ↗
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!compact && limit < events.length && (
        <div className="load-more">
          <button className="button" onClick={() => setLimit(limit + 12)}>
            Load more history ({events.length - limit} remaining)
          </button>
        </div>
      )}
    </>
  );
}
