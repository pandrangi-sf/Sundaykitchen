import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, ShieldQuestion } from 'lucide-react';
import {
  GOALS, SEXES, ACTIVITY_LEVELS, DIETS, COMMON_ALLERGENS,
  CUISINES, TRAINING_PLACES, HEALTH_FLAGS
} from '../data/options.js';
import { isUAT } from '../lib/supabaseClient.js';
import { SAMPLE_PRESETS } from '../data/samplePresets.js';

// One question group per screen. Health step is optional/skippable.
// On finish, calls onComplete(profile). Consent gate + plan come in Stage 3.

const emptyProfile = {
  goal: 'lose',
  sex: 'male',
  dob: '',
  units: 'metric',
  height_cm: '',
  height_ft: '',
  height_in: '',
  weight: '',
  target_weight: '',
  activity: 'moderate',
  diet: 'omnivore',
  allergies: [],
  allergies_other: '',
  avoid_foods: '',
  cuisines: [],
  meals_per_day: 4,
  training_days: 4,
  training_place: 'gym',
  health_flags: [],
  health_other: '',
  meds_note: ''
};

function Pill({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${active
        ? 'bg-teal text-white border-teal'
        : 'bg-white text-ink/80 border-ink/15 hover:border-teal'}`}>
      {children}
    </button>
  );
}

function Card({ active, title, desc, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition ${active
        ? 'border-teal bg-teal/5 ring-1 ring-teal'
        : 'border-ink/15 bg-white hover:border-teal'}`}>
      <div className="font-semibold text-ink">{title}</div>
      {desc && <div className="text-sm text-ink/60 mt-0.5">{desc}</div>}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink/50 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls = 'mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-teal text-ink';

export default function OnboardingWizard({ initial, onComplete, onCancel }) {
  const [p, setP] = useState({ ...emptyProfile, ...(initial || {}) });
  const [step, setStep] = useState(0);
  const set = (patch) => setP((prev) => ({ ...prev, ...patch }));
  const toggle = (key, val) => set({
    [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val]
  });

  const steps = useMemo(() => ['Goal', 'About you', 'Activity', 'Diet', 'Allergies', 'Preferences', 'Health'], []);
  const last = steps.length - 1;

  function next() { setStep((s) => Math.min(s + 1, last)); }
  function back() { if (step === 0) { onCancel && onCancel(); } else { setStep((s) => s - 1); } }
  function finish() { onComplete && onComplete(p); }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-teal' : 'bg-ink/10'}`} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">{steps[step]}</h2>
          <span className="text-xs text-ink/50">Step {step + 1} of {steps.length}</span>
        </div>
      </div>

      {isUAT && (
        <div className="mx-5 mt-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3">
          <p className="text-xs font-semibold text-ink/70">UAT — fill sample profile</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setP({ ...emptyProfile, ...preset.profile })}
                className="rounded-full bg-white border border-ink/15 px-3 py-1 text-xs text-ink hover:border-teal"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 px-5 py-5 space-y-4">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-3">
            {GOALS.map((g) => (
              <Card key={g.value} active={p.goal === g.value} title={g.label} onClick={() => set({ goal: g.value })} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Sex (used for the calorie formula)">
              <div className="mt-1 flex gap-2">
                {SEXES.map((s) => (
                  <Pill key={s.value} active={p.sex === s.value} onClick={() => set({ sex: s.value })}>{s.label}</Pill>
                ))}
              </div>
            </Field>
            <Field label="Date of birth">
              <input type="date" className={inputCls} value={p.dob} onChange={(e) => set({ dob: e.target.value })} />
            </Field>
            <Field label="Units">
              <div className="mt-1 flex gap-2">
                <Pill active={p.units === 'metric'} onClick={() => set({ units: 'metric' })}>Metric (cm/kg)</Pill>
                <Pill active={p.units === 'imperial'} onClick={() => set({ units: 'imperial' })}>Imperial (ft/lb)</Pill>
              </div>
            </Field>
            {p.units === 'metric' ? (
              <Field label="Height (cm)">
                <input type="number" className={inputCls} value={p.height_cm} onChange={(e) => set({ height_cm: e.target.value })} />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height (ft)">
                  <input type="number" className={inputCls} value={p.height_ft} onChange={(e) => set({ height_ft: e.target.value })} />
                </Field>
                <Field label="Height (in)">
                  <input type="number" className={inputCls} value={p.height_in} onChange={(e) => set({ height_in: e.target.value })} />
                </Field>
              </div>
            )}
            <Field label={p.units === 'metric' ? 'Current weight (kg)' : 'Current weight (lb)'}>
              <input type="number" className={inputCls} value={p.weight} onChange={(e) => set({ weight: e.target.value })} />
            </Field>
            <Field label={`Target weight (optional, ${p.units === 'metric' ? 'kg' : 'lb'})`}>
              <input type="number" className={inputCls} value={p.target_weight} onChange={(e) => set({ target_weight: e.target.value })} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-3">
            {ACTIVITY_LEVELS.map((a) => (
              <Card key={a.value} active={p.activity === a.value} title={a.label} onClick={() => set({ activity: a.value })} />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-3">
            {DIETS.map((d) => (
              <Card key={d.value} active={p.diet === d.value} title={d.label} onClick={() => set({ diet: d.value })} />
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Field label="Allergies (select any)">
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map((a) => (
                  <Pill key={a} active={p.allergies.includes(a)} onClick={() => toggle('allergies', a)}>{a}</Pill>
                ))}
              </div>
            </Field>
            <Field label="Other allergies (optional)">
              <input className={inputCls} value={p.allergies_other} onChange={(e) => set({ allergies_other: e.target.value })} placeholder="e.g. mustard" />
            </Field>
            <Field label="Foods to avoid (optional)">
              <input className={inputCls} value={p.avoid_foods} onChange={(e) => set({ avoid_foods: e.target.value })} placeholder="e.g. mushrooms, liver" />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <Field label="Preferred cuisines (optional)">
              <div className="mt-2 flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <Pill key={c} active={p.cuisines.includes(c)} onClick={() => toggle('cuisines', c)}>{c}</Pill>
                ))}
              </div>
            </Field>
            <Field label={`Meals per day: ${p.meals_per_day}`}>
              <input type="range" min={3} max={5} value={p.meals_per_day} onChange={(e) => set({ meals_per_day: Number(e.target.value) })} className="mt-2 w-full" />
            </Field>
            <Field label={`Training days per week: ${p.training_days}`}>
              <input type="range" min={0} max={7} value={p.training_days} onChange={(e) => set({ training_days: Number(e.target.value) })} className="mt-2 w-full" />
            </Field>
            <Field label="Train at">
              <div className="mt-1 flex gap-2">
                {TRAINING_PLACES.map((t) => (
                  <Pill key={t.value} active={p.training_place === t.value} onClick={() => set({ training_place: t.value })}>{t.label}</Pill>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-3">
              <ShieldQuestion size={18} className="text-gold mt-0.5" />
              <p className="text-sm text-ink/70">
                This step is optional. It helps us add gentle dietary guidance — it is never used for medication math,
                and you can skip it and still get a basic plan.
              </p>
            </div>
            <Field label="Any health flags? (select any)">
              <div className="mt-2 flex flex-wrap gap-2">
                {HEALTH_FLAGS.map((h) => (
                  <Pill key={h.value} active={p.health_flags.includes(h.value)} onClick={() => toggle('health_flags', h.value)}>{h.label}</Pill>
                ))}
              </div>
            </Field>
            <Field label="Other health note (optional)">
              <input className={inputCls} value={p.health_other} onChange={(e) => set({ health_other: e.target.value })} />
            </Field>
            <Field label="Medications note (optional)" hint="Stored for your reference only — never used in any calculation. Review with your doctor.">
              <textarea rows={2} className={inputCls} value={p.meds_note} onChange={(e) => set({ meds_note: e.target.value })} />
            </Field>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-paper/90 backdrop-blur border-t border-ink/10 px-5 py-4 flex items-center justify-between gap-3">
        <button type="button" onClick={back} className="flex items-center gap-1 text-ink/70 font-medium px-3 py-2">
          <ChevronLeft size={18} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step === 6 && (
          <button type="button" onClick={finish} className="text-sm text-ink/50 underline">Skip health</button>
        )}
        {step < last ? (
          <button type="button" onClick={next} className="flex items-center gap-1 rounded-xl bg-teal hover:bg-teal-dark text-white font-semibold px-5 py-2.5">
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" onClick={finish} className="flex items-center gap-1 rounded-xl bg-teal hover:bg-teal-dark text-white font-semibold px-5 py-2.5">
            <Check size={18} /> Continue
          </button>
        )}
      </div>
    </div>
  );
}
