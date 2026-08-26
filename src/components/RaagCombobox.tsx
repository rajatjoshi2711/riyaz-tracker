"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchRaags, type Raag } from "@/lib/apiClient";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RaagCombobox({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<Raag[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = value.trim();
    const timer = setTimeout(() => {
      searchRaags(trimmed)
        .then((res) => setSuggestions(res.raags))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exactMatch = suggestions.some((r) => r.name.toLowerCase() === value.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      <label className="ef-field-label" htmlFor="raagName">
        Raag
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" size={16} strokeWidth={1.5} />
        <input
          id="raagName"
          className="ef-input pl-9"
          style={{ paddingLeft: 36 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search or add a raag"
          autoComplete="off"
          required
        />
      </div>

      {open && value.trim().length > 0 && (
        <ul className="ef-card absolute z-10 mt-1 max-h-56 w-full overflow-auto p-1" role="listbox">
          {suggestions.map((raag) => (
            <li key={raag.id}>
              <button
                type="button"
                className="ef-body w-full rounded-[var(--radius-button)] px-3 py-2 text-left hover:bg-[var(--blue-50)]"
                onClick={() => {
                  onChange(raag.name);
                  setOpen(false);
                }}
              >
                {raag.name}
              </button>
            </li>
          ))}
          {!exactMatch && (
            <li>
              <div className="ef-small px-3 py-2 text-[var(--text-secondary)]">
                Press enter to add “{value.trim()}” as a new raag
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
