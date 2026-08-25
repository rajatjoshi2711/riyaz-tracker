"use client";

import { useState } from "react";
import RaagCombobox from "@/components/RaagCombobox";
import { createSession, RIYAZ_TYPES, type RiyazType } from "@/lib/apiClient";
import { toDateOnly } from "@/lib/streaks";

export default function SessionForm({ onLogged }: { onLogged: () => void }) {
  const [raagName, setRaagName] = useState("");
  const [practiceDate, setPracticeDate] = useState(toDateOnly(new Date()));
  const [durationMinutes, setDurationMinutes] = useState("");
  const [types, setTypes] = useState<RiyazType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleType(type: RiyazType) {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createSession({
        raagName,
        practiceDate,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        types: types.length ? types : undefined,
      });
      setRaagName("");
      setDurationMinutes("");
      setTypes([]);
      setPracticeDate(toDateOnly(new Date()));
      onLogged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ef-card flex flex-col gap-4">
      <p className="ef-subhead">Log a riyaz session</p>

      <RaagCombobox value={raagName} onChange={setRaagName} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="ef-field-label" htmlFor="practiceDate">
            Date
          </label>
          <input
            id="practiceDate"
            type="date"
            className="ef-input"
            value={practiceDate}
            onChange={(e) => setPracticeDate(e.target.value)}
            max={toDateOnly(new Date())}
            required
          />
        </div>
        <div>
          <label className="ef-field-label" htmlFor="durationMinutes">
            Duration (minutes)
          </label>
          <input
            id="durationMinutes"
            type="number"
            className="ef-input"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            min={1}
            max={1440}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <span className="ef-field-label">Type of riyaz</span>
        <div className="flex flex-wrap gap-2">
          {RIYAZ_TYPES.map((t) => {
            const active = types.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleType(t.value)}
                className={`ef-badge ${active ? "ef-badge-info" : "ef-badge-neutral"}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="ef-error-text">{error}</p>}

      <button type="submit" className="ef-btn ef-btn-primary self-start" disabled={submitting}>
        {submitting ? "Logging…" : "Log session"}
      </button>
    </form>
  );
}
