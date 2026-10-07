import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Mail,
  CalendarDays,
  CreditCard,
  ArrowLeftRight,
  Inbox,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { getCustomer, initials, platformUrls } from "@/lib/data";
import type { Platform } from "@/types";
export const platformIcons: Record<Platform, LucideIcon> = {
  Shopify: ShoppingBag,
  Klaviyo: Mail,
  TidyCal: CalendarDays,
  SumUp: CreditCard,
  Atoa: ArrowLeftRight,
};
export function PlatformBadge({
  platform,
  compact = false,
}: {
  platform: Platform;
  compact?: boolean;
}) {
  const Icon = platformIcons[platform];
  return (
    <span
      className={`badge platform-badge ${platform.toLowerCase()}`}
      title={platform}
    >
      <Icon size={12} />
      {!compact && platform}
    </span>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`badge status-${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
export function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <span className={`avatar ${large ? "avatar-large" : ""}`}>
      {initials(name)}
    </span>
  );
}
export function CustomerLink({
  id,
  email = false,
}: {
  id: string;
  email?: boolean;
}) {
  const c = getCustomer(id);
  return (
    <Link href={`/customers/profile?id=${id}`} className="customer-link">
      <Avatar name={c.name} />
      <span>
        <strong>{c.name}</strong>
        {email && <small>{c.email}</small>}
      </span>
    </Link>
  );
}
export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <div className="stat-card">
      <div className="row between">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={17} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
export function EmptyState({
  title = "Nothing to show yet",
  description = "There are no matching records. Try a different search or filter.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <span className="icon-tile sage">
        <Inbox size={23} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function ExternalButton({
  platform,
  label,
}: {
  platform: Platform;
  label?: string;
}) {
  return (
    <a
      className="button external-button"
      href={platformUrls[platform]}
      target="_blank"
      rel="noopener noreferrer"
    >
      <PlatformBadge platform={platform} compact />
      {label || platform}
      <ExternalLink size={13} />
    </a>
  );
}
export function SectionHeader({
  title,
  subtitle,
  href,
  action = "View all",
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {action}
          <ArrowUpRight size={15} />
        </Link>
      )}
      {children}
    </div>
  );
}
export function ProfileArrow({ id }: { id: string }) {
  return (
    <Link className="text-link" href={`/customers/profile?id=${id}`}>
      View profile <ArrowRight size={14} />
    </Link>
  );
}
