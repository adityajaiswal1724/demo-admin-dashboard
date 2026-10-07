"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, X, CornerDownLeft, ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, PlatformBadge, EmptyState } from "@/components/ui/shared";
import { customerSources, searchCustomers } from "@/lib/data";
export function CustomerSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  useEffect(() => {
    const show = () => {
      setQuery("");
      setOpen(true);
    };
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        show();
      }
    };
    document.addEventListener("customer-search", show);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("customer-search", show);
      document.removeEventListener("keydown", key);
    };
  }, []);
  const results = searchCustomers(query);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="search-dialog">
        <DialogTitle>Search Customer Profile</DialogTitle>
        <DialogDescription>One search. Their complete story.</DialogDescription>
        <Command shouldFilter={false} loop>
          <div className="command-input">
            <Search size={19} />
            <Command.Input
              aria-label="Search Customer Profile"
              placeholder="Name, email, phone or customer ID…"
              value={query}
              onValueChange={setQuery}
            />
            {query && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={17} />
              </button>
            )}
          </div>
          <Command.List>
            <div className="command-label">
              {query
                ? `${results.length} CUSTOMER${results.length !== 1 ? "S" : ""} FOUND`
                : "ALL CUSTOMERS"}
            </div>
            {!results.length && (
              <EmptyState
                title="No customers found"
                description="Try a different name, email, phone number or customer ID."
              />
            )}
            {results.map((c) => (
              <Command.Item
                key={c.id}
                value={c.id}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/customers/profile?id=${c.id}`);
                }}
              >
                <Avatar name={c.name} />
                <div className="search-result-main">
                  <strong>{c.name}</strong>
                  <small>
                    {c.email} <span>· {c.id}</span>
                  </small>
                </div>
                <div className="source-badges">
                  {customerSources(c.id).map((p) => (
                    <PlatformBadge key={p} platform={p} compact />
                  ))}
                </div>
                <CornerDownLeft size={14} />
              </Command.Item>
            ))}
          </Command.List>
          <div className="command-footer">
            <span>
              <ArrowUpDown size={12} /> to navigate
            </span>
            <span>
              <CornerDownLeft size={12} /> to select
            </span>
            <span>
              <kbd>esc</kbd> to close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
