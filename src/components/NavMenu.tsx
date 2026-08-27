"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export type NavItem = { label: string; href?: string; onClick?: () => void };

export default function NavMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="hidden items-center gap-3 sm:flex">
        {items.map((item) =>
          item.href ? (
            <Link key={item.label} href={item.href} className="ef-btn ef-btn-secondary">
              {item.label}
            </Link>
          ) : (
            <button key={item.label} type="button" className="ef-btn ef-btn-text" onClick={item.onClick}>
              {item.label}
            </button>
          ),
        )}
      </div>

      <div className="relative sm:hidden" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-[var(--border)] bg-white text-[var(--text-primary)] transition hover:bg-[var(--blue-50)]"
        >
          {open ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
        </button>
        {open && (
          <div className="ef-card absolute right-0 z-20 mt-2 w-48 p-1">
            {items.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="ef-body block rounded-[var(--radius-button)] px-3 py-2 hover:bg-[var(--blue-50)]"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className="ef-body block w-full rounded-[var(--radius-button)] px-3 py-2 text-left hover:bg-[var(--blue-50)]"
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </>
  );
}
