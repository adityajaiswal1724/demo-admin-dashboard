"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Search,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Mail,
  CalendarDays,
  CreditCard,
  ArrowLeftRight,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import { CustomerSearch } from "@/components/customers/search";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DEMO_SESSION_KEY } from "@/lib/demo-auth";
import { DEMO_REFERENCE_DATE } from "@/lib/config";
import { date } from "@/lib/data";
const navigation = [
  ["Overview", "/overview", LayoutDashboard],
  ["Customers", "/customers", Users],
  ["Shopify", "/platforms/shopify", ShoppingBag],
  ["Klaviyo", "/platforms/klaviyo", Mail],
  ["TidyCal", "/platforms/tidycal", CalendarDays],
  ["SumUp", "/platforms/sumup", CreditCard],
  ["Atoa", "/platforms/atoa", ArrowLeftRight],
] as const;
function SidebarContent({
  pathname,
  onNavigate,
  logout,
  onSearch,
}: {
  pathname: string;
  onNavigate: () => void;
  logout: () => void;
  onSearch: () => void;
}) {
  return (
    <>
      <div className="sidebar-brand">
        <Link href="/overview" className="wordmark" onClick={onNavigate}>
          Demo
        </Link>
        <small>Customer Dashboard</small>
      </div>
      <button className="sidebar-search" onClick={onSearch}>
        <Search size={16} />
        Search Customer Profile
      </button>
      <nav aria-label="Main navigation">
        {navigation.map(([name, path, Icon], i) => (
          <div key={name}>
            {i === 2 && <div className="nav-label">PLATFORMS</div>}
            <Link
              href={path}
              onClick={onNavigate}
              className={`nav-link ${pathname.startsWith(path) ? "active" : ""}`}
              aria-current={pathname.startsWith(path) ? "page" : undefined}
            >
              <Icon size={18} />
              {name}
              {pathname.startsWith(path) && <span className="active-dot" />}
            </Link>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="demo-info">
          <span className="demo-dot" />
          Demo mode<small>Fictional data. Real possibilities.</small>
        </div>
        <div className="admin-identity">
          <span className="avatar">DA</span>
          <div>
            <strong>Demo Admin</strong>
            <small>Demo administrator</small>
          </div>
          <button className="icon-button" aria-label="Log out" onClick={logout}>
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname().replace(/\/$/, "");
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_SESSION_KEY) === "true") setReady(true);
    else router.replace("/");
  }, [router]);
  function logout() {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    setReady(false);
    router.replace("/");
  }
  function search() {
    setMobile(false);
    document.dispatchEvent(new Event("customer-search"));
  }
  if (!ready)
    return (
      <div className="gate" role="status">
        Opening Demo…
      </div>
    );
  const sidebar = (
    <SidebarContent
      pathname={pathname}
      onNavigate={() => setMobile(false)}
      logout={logout}
      onSearch={search}
    />
  );
  return (
    <div className="app-shell">
      <CustomerSearch />
      <aside className="sidebar">{sidebar}</aside>
      <Dialog open={mobile} onOpenChange={setMobile}>
        <DialogContent className="mobile-sidebar">
          <DialogTitle className="sr-only">Demo navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Browse the customer dashboard and platform records.
          </DialogDescription>
          {sidebar}
        </DialogContent>
      </Dialog>
      <div className="main-shell">
        <header className="topbar">
          <div className="row">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Workspace
              <ChevronRight size={13} />
              <strong>
                {pathname.includes("profile")
                  ? "Customer profile"
                  : navigation.find(([, p]) => pathname === p)?.[0] ||
                    "Customers"}
              </strong>
            </span>
          </div>
          <button className="header-search" onClick={search}>
            <Search size={16} />
            <span>Search Customer Profile</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="header-right">
            <span className="badge demo-badge">Demo — sample data only</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="avatar" aria-label="Admin menu">
                DA
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="admin-dropdown"
                  sideOffset={12}
                  align="end"
                >
                  <DropdownMenu.Label>
                    Demo Admin<small>Demo administrator</small>
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onSelect={logout}>
                    <LogOut size={15} /> Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer">
          <span>Demo Customer Dashboard</span>
          <span>
            Sample data as of {date(DEMO_REFERENCE_DATE)}{" "}
            <span className="footer-dot">·</span> Europe/London
          </span>
        </footer>
      </div>
    </div>
  );
}
