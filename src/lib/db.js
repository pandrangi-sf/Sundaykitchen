import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { CONSENT_VERSION, REQUIRED_CONSENT_KEYS } from './consent.js';

// Persistence layer. When Supabase is configured, reads/writes the user's own
// rows (RLS enforced server-side). Otherwise falls back to localStorage so the
// flow is testable without a database.

const LS = {
  profile: 'mgp.profile.v1',
  targets: 'mgp.targets.v1',
  consents: 'mgp.consents.v1'
};

// --- unit normalization: wizard values -> metric for engine + DB ---
export function normalizeProfile(p) {
  const imperial = p.units === 'imperial';
  let height_cm = Number(p.height_cm) || null;
  if (imperial) {
    const ft = Number(p.height_ft) || 0;
    const inch = Number(p.height_in) || 0;
    height_cm = Math.round((ft * 12 + inch) * 2.54) || null;
  }
  let weight_kg = Number(p.weight) || null;
  if (imperial && weight_kg) weight_kg = Math.round(weight_kg * 0.453592 * 10) / 10;
  let target_weight_kg = Number(p.target_weight) || null;
  if (imperial && target_weight_kg) target_weight_kg = Math.round(target_weight_kg * 0.453592 * 10) / 10;
  return { height_cm, weight_kg, target_weight_kg };
}

// Map wizard profile -> profiles table row shape.
function toProfileRow(p, userId) {
  const n = normalizeProfile(p);
  return {
    id: userId,
    goal: p.goal, sex: p.sex, dob: p.dob || null, units: p.units,
    height_cm: n.height_cm, weight_kg: n.weight_kg, target_weight_kg: n.target_weight_kg,
    activity: p.activity, diet: p.diet,
    allergies: p.allergies || [], allergies_other: p.allergies_other || null,
    avoid_foods: p.avoid_foods || null, cuisines: p.cuisines || [],
    meals_per_day: p.meals_per_day, training_days: p.training_days,
    training_place: p.training_place, updated_at: new Date().toISOString()
  };
}

function toHealthRow(p, userId) {
  return {
    user_id: userId,
    health_flags: p.health_flags || [],
    health_other: p.health_other || null,
    meds_note: p.meds_note || null,   // stored only; never used in calculation
    updated_at: new Date().toISOString()
  };
}

// --- profile ---
export async function saveProfile(p, userId) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(LS.profile, JSON.stringify(p));
    return { error: null };
  }
  const { error: e1 } = await supabase.from('profiles').upsert(toProfileRow(p, userId));
  const { error: e2 } = await supabase.from('health_profile').upsert(toHealthRow(p, userId));
  return { error: e1 || e2 || null };
}

export async function loadProfile(userId) {
  if (!isSupabaseConfigured) {
    try { return JSON.parse(localStorage.getItem(LS.profile) || 'null'); } catch { return null; }
  }
  const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (!prof) return null;
  const { data: health } = await supabase.from('health_profile').select('*').eq('user_id', userId).maybeSingle();
  // Rehydrate into wizard shape (metric).
  return {
    goal: prof.goal, sex: prof.sex, dob: prof.dob || '', units: prof.units || 'metric',
    height_cm: prof.height_cm ?? '', weight: prof.weight_kg ?? '', target_weight: prof.target_weight_kg ?? '',
    height_ft: '', height_in: '',
    activity: prof.activity, diet: prof.diet,
    allergies: prof.allergies || [], allergies_other: prof.allergies_other || '',
    avoid_foods: prof.avoid_foods || '', cuisines: prof.cuisines || [],
    meals_per_day: prof.meals_per_day ?? 4, training_days: prof.training_days ?? 4,
    training_place: prof.training_place || 'gym',
    health_flags: health?.health_flags || [], health_other: health?.health_other || '',
    meds_note: health?.meds_note || ''
  };
}

// --- targets ---
export async function saveTargets(t, userId) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(LS.targets, JSON.stringify(t));
    return { error: null };
  }
  const row = {
    user_id: userId,
    calories: t.calorie_target ?? null,
    protein_g: t.protein_g ?? null,
    carbs_g: t.carb_g ?? null,
    fat_g: t.fat_g ?? null,
    water_l: t.water_ml ? Math.round(t.water_ml / 100) / 10 : null,
    meal_split: t.meal_split ?? null,
    lever_tags: t.lever_tags || [],
    escalated: !!t.escalated,
    engine: t
  };
  const { error } = await supabase.from('targets').insert(row);
  return { error: error || null };
}

export async function loadTargets(userId) {
  if (!isSupabaseConfigured) {
    try { return JSON.parse(localStorage.getItem(LS.targets) || 'null'); } catch { return null; }
  }
  const { data } = await supabase.from('targets').select('engine').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data?.engine || null;
}

// --- consents ---
export async function saveConsents(checkedMap, userId) {
  const records = REQUIRED_CONSENT_KEYS.map((key) => ({
    user_id: userId, consent_key: key, version: CONSENT_VERSION, accepted: !!checkedMap[key]
  }));
  if (!isSupabaseConfigured) {
    localStorage.setItem(LS.consents, JSON.stringify(records));
    return { error: null };
  }
  const { error } = await supabase.from('consents').insert(records);
  return { error: error || null };
}

export async function loadConsents(userId) {
  if (!isSupabaseConfigured) {
    try { return JSON.parse(localStorage.getItem(LS.consents) || '[]'); } catch { return []; }
  }
  const { data } = await supabase.from('consents').select('consent_key, version, accepted').eq('user_id', userId);
  return data || [];
}

// --- export / delete stubs (wire fully before launch) ---
export async function exportMyData(userId) {
  const [profile, targets, consents] = await Promise.all([
    loadProfile(userId), loadTargets(userId), loadConsents(userId)
  ]);
  return { exported_at: new Date().toISOString(), profile, targets, consents };
}

export async function clearLocal() {
  Object.values(LS).forEach((k) => localStorage.removeItem(k));
}
