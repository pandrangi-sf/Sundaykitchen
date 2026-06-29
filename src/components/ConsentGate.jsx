import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { CONSENT_ITEMS } from '../lib/consent.js';

// Required gate before any plan is generated. Four SEPARATE checkboxes,
// none pre-ticked, none bundled. Plan stays blocked until all are checked.
export default function ConsentGate({ onAccept, busy }) {
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(CONSENT_ITEMS.map((c) => [c.key, false]))
  );
  const allChecked = CONSENT_ITEMS.every((c) => checked[c.key]);

  function toggle(key) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-teal flex items-center justify-center text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-ink">Before we build your plan</h1>
          <p className="mt-1 text-sm text-ink/60">
            Please review and accept each item. We log each acceptance separately.
          </p>
        </div>

        <div className="space-y-3">
          {CONSENT_ITEMS.map((c) => (
            <label key={c.key}
              className="flex items-start gap-3 rounded-2xl border border-ink/15 bg-white px-4 py-3 cursor-pointer hover:border-teal">
              <input type="checkbox" checked={checked[c.key]} onChange={() => toggle(c.key)}
                className="mt-1 h-5 w-5 accent-teal" />
              <span className="text-sm text-ink">{c.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-paper border border-ink/10 px-4 py-3 text-xs text-ink/60">
          This app gives general wellness guidance, not medical advice. It never does
          medication math and never claims to treat any condition. For anything medical,
          consult your doctor or a registered dietitian.
        </div>

        <button type="button" disabled={!allChecked || busy} onClick={() => onAccept(checked)}
          className="mt-5 w-full rounded-xl bg-teal hover:bg-teal-dark text-white font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {busy && <Loader2 size={18} className="animate-spin" />}
          {allChecked ? 'Accept and build my plan' : 'Please accept all items'}
        </button>
      </div>
    </div>
  );
}
