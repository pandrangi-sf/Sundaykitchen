import { AlertTriangle, Droplet, Dumbbell, Utensils, Pencil, LogOut, Download, Trash2 } from 'lucide-react';
import { pickMeals } from '../data/mealLibrary.js';
import { buildWorkout } from '../lib/workoutTemplates.js';

const SLOTS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snack', label: 'Snack' },
  { key: 'dinner', label: 'Dinner' }
];

function Disclaimer() {
  return (
    <div className="rounded-xl bg-paper border border-ink/10 px-4 py-3 text-xs text-ink/60">
      General wellness guidance, not medical advice — consult your doctor or dietitian.
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-center">
      <div className="text-2xl font-bold text-ink">{value}<span className="text-sm font-medium text-ink/50"> {unit}</span></div>
      <div className="text-xs text-ink/60 mt-0.5">{label}</div>
    </div>
  );
}

export default function PlanView({ profile, targets, onEdit, onSignOut, onExport, onDelete }) {
  if (!targets) return null;
  const escalated = targets.escalated;
  const calories = targets.calorie_target;
  const split = targets.meal_split || {};
  const meds = profile.meds_note;

  const workout = buildWorkout({
    goal: profile.goal, place: profile.training_place, trainingDays: profile.training_days
  });

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Your plan</h1>
          <div className="flex items-center gap-3">
            <button onClick={onExport} title="Export my data" className="text-ink/60 hover:text-ink"><Download size={18} /></button>
            <button onClick={onSignOut} className="flex items-center gap-1 text-sm text-ink/60 hover:text-ink"><LogOut size={16} /> Sign out</button>
          </div>
        </div>

        <Disclaimer />

        {escalated && (
          <div className="rounded-2xl bg-gold/15 border border-gold/40 px-4 py-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-gold mt-0.5" />
            <p className="text-sm text-ink">{targets.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label={escalated ? 'Maintenance kcal' : 'Daily calories'} value={calories} unit="kcal" />
          <Stat label="Protein" value={targets.protein_g} unit="g" />
          {!escalated && <Stat label="Carbs" value={targets.carb_g} unit="g" />}
          {!escalated && <Stat label="Fat" value={targets.fat_g} unit="g" />}
          <Stat label="Water" value={(targets.water_ml / 1000).toFixed(2)} unit="L" />
        </div>
        {targets.water_note && <p className="text-xs text-ink/60">{targets.water_note}</p>}

        {targets.lever_tags && targets.lever_tags.length > 0 && (
          <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <div className="text-sm font-semibold text-ink mb-2">Gentle dietary guidance</div>
            <ul className="list-disc list-inside text-sm text-ink/70 space-y-1">
              {targets.lever_tags.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* Meal framework */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-teal" />
            <h2 className="text-lg font-bold text-ink">Starter meal framework</h2>
          </div>
          <p className="text-xs text-ink/50">
            Starter framework — personalized weekly menus come with the full plan (coming soon).
          </p>
          {SLOTS.filter((s) => split[s.key]).map((s) => {
            const slotCals = Math.round(calories * (split[s.key] || 0));
            const examples = pickMeals(s.key, profile.diet, profile.allergies || [], 3);
            return (
              <div key={s.key} className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{s.label}</span>
                  <span className="text-sm text-ink/60">~{slotCals} kcal ({Math.round((split[s.key] || 0) * 100)}%)</span>
                </div>
                {examples.length > 0 ? (
                  <ul className="mt-2 text-sm text-ink/70 space-y-1">
                    {examples.map((m, i) => <li key={i}>• {m}</li>)}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink/50">No preset matches your diet/allergies — pick a balanced option for this slot.</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Workout */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-teal" />
            <h2 className="text-lg font-bold text-ink">Workout template</h2>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink capitalize">{workout.summary}</span>
              <span className="text-sm text-ink/60">{workout.setsReps}</span>
            </div>
            {workout.split.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {workout.split.map((d, i) => (
                  <span key={i} className="text-xs rounded-full bg-teal/10 text-teal-dark px-3 py-1">Day {i + 1}: {d}</span>
                ))}
              </div>
            )}
            {workout.note && <p className="text-sm text-ink/60">{workout.note}</p>}
            <p className="text-sm text-ink/70 flex items-center gap-1"><Droplet size={14} className="text-teal" /> Daily step target: {workout.stepTarget.toLocaleString()}</p>
            {workout.homeSwaps.length > 0 && (
              <div className="pt-1">
                <div className="text-xs font-semibold text-ink/70">Home swaps</div>
                <ul className="text-sm text-ink/60 mt-1 space-y-1">
                  {workout.homeSwaps.map((h, i) => <li key={i}>• {h}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {meds && (
          <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <div className="text-sm font-semibold text-ink">Your medications note</div>
            <p className="text-sm text-ink/70 mt-1">{meds}</p>
            <p className="text-xs text-ink/50 mt-1">Captured for your reference only — not used in any calculation. Review with your doctor.</p>
          </div>
        )}

        <Disclaimer />

        <button onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-teal text-teal font-semibold py-3 hover:bg-teal/5">
          <Pencil size={18} /> Update my answers
        </button>

        <button onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-300 text-red-600 font-medium py-3 hover:bg-red-50">
          <Trash2 size={16} /> Delete my data
        </button>
      </div>
    </div>
  );
}
