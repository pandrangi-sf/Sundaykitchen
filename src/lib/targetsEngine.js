/**
 * targetsEngine.js — deterministic wellness targets engine (Phase 1)
 *
 * IMPORTANT: This is a wellness tool, NOT a medical service.
 * - No AI, no medication math, no disease treatment claims.
 * - Health flags only adjust gentle, well-established dietary "guidance tags".
 * - Hard SAFETY FLOORS are applied last and can never be crossed.
 * - SERIOUS escalation flags suppress any deficit/aggressive plan and return a
 *   professional-referral result instead.
 *
 * Pure functions only — no I/O, no side effects. Easy to unit-test.
 */

export const CONSENT_VERSION = "1.0.0";

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

// Serious flags: never auto-generate an aggressive/deficit plan for these.
export const SERIOUS_FLAGS = [
  "pregnancy",
  "breastfeeding",
  "eating_disorder",
  "type1_diabetes",
  "kidney_disease",
  "liver_disease",
];

// Gentle dietary "levers" -> user-facing guidance tags. NEVER alter calories/meds.
export const HEALTH_LEVERS = {
  blood_sugar: [
    "Favor lower-GI carbs (whole grains, legumes)",
    "Add more fibre with each meal",
    "Limit added sugar and sugary drinks",
  ],
  blood_pressure: [
    "Lower sodium — go easy on salt and processed foods",
    "More potassium-rich vegetables (leafy greens, beans)",
  ],
  cholesterol: [
    "More soluble fibre (oats, beans, fruit)",
    "Prefer unsaturated fats (olive oil, nuts, fish)",
    "Limit fried and trans fats",
  ],
};

function round(n, step) { return Math.round(n / step) * step; }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function ageFromDob(dob) {
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

// --- BMR (Mifflin-St Jeor) ---
export function bmr({ sex, kg, cm, age }) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161; // non-male treated as female formula
}

// --- TDEE ---
export function tdee({ bmrVal, activity }) {
  const f = ACTIVITY_FACTORS[activity] ?? ACTIVITY_FACTORS.sedentary;
  return bmrVal * f;
}

// --- Goal calories (before floors) ---
export function goalCalories({ tdeeVal, goal }) {
  switch (goal) {
    case "lose": return tdeeVal * 0.8;        // -20%
    case "gain": return tdeeVal * 1.12;       // +12%
    case "recomp": return tdeeVal * 0.95;     // -5%
    case "maintain":
    default: return tdeeVal;
  }
}

export function hasSeriousFlag(flags) {
  return (flags || []).some((f) => SERIOUS_FLAGS.includes(f));
}

export function leverTags(flags) {
  const tags = [];
  (flags || []).forEach((f) => { if (HEALTH_LEVERS[f]) tags.push(...HEALTH_LEVERS[f]); });
  return tags;
}

/**
 * computeTargets(input) -> result
 * input: { sex, dob, height_cm, weight_kg, activity, goal, meals_per_day, health_flags }
 */
export function computeTargets(input) {
  const {
    sex, dob, height_cm, weight_kg, activity, goal,
    meals_per_day = 4, health_flags = [],
  } = input;

  const age = ageFromDob(dob);
  const kg = Number(weight_kg);
  const cm = Number(height_cm);

  const bmrVal = bmr({ sex, kg, cm, age });
  const tdeeVal = tdee({ bmrVal, activity });
  const tags = leverTags(health_flags);

  // ESCALATION: serious flag -> no aggressive plan; balanced maintenance guidance only.
  if (hasSeriousFlag(health_flags)) {
    const maint = Math.round(tdeeVal);
    return {
      escalated: true,
      message:
        "Some of the health information you shared means a personalized deficit or " +
        "surplus plan isn't appropriate to auto-generate. Please work with a doctor " +
        "or registered dietitian. Below is only general balanced-eating guidance.",
      method: "mifflin",
      calorie_target: maint,          // maintenance only, no deficit/surplus
      protein_g: Math.round(1.6 * kg),
      water_ml: round(35 * kg, 250),
      lever_tags: tags,
      meal_split: defaultSplit(meals_per_day),
      floors_applied: [],
    };
  }

  // --- macros & calories (pre-floor) ---
  let cal = goalCalories({ tdeeVal, goal });

  // protein g/kg: default 1.8; higher end (2.2) for cut/gain, lower baseline for maintain
  let proteinPerKg = 1.8;
  if (goal === "lose" || goal === "gain") proteinPerKg = 2.0;
  if (goal === "recomp") proteinPerKg = 1.9;
  let protein_g = proteinPerKg * kg;
  let fat_g = Math.max(0.6 * kg, (cal * 0.25) / 9); // >= 0.6 g/kg, aim ~25% cals

  // --- SAFETY FLOORS (applied last) ---
  const floors_applied = [];
  const sexFloor = sex === "male" ? 1500 : 1200;
  const bmrFloor = bmrVal * 1.1;
  const hardFloor = Math.max(sexFloor, bmrFloor);

  // deficit cap: never below 80% TDEE AND never below hardFloor
  const maxDeficitCal = tdeeVal * 0.8;
  if (goal === "lose" || goal === "recomp") {
    if (cal < maxDeficitCal) { cal = maxDeficitCal; floors_applied.push("deficit_capped_20pct"); }
  }
  // surplus cap ~15%
  const maxSurplusCal = tdeeVal * 1.15;
  if (goal === "gain" && cal > maxSurplusCal) { cal = maxSurplusCal; floors_applied.push("surplus_capped_15pct"); }

  if (cal < hardFloor) {
    cal = hardFloor;
    floors_applied.push(sexFloor >= bmrFloor ? "min_calories_floor" : "bmr_x1.1_floor");
  }

  // protein floor 1.2 g/kg
  const proteinFloor = 1.2 * kg;
  if (protein_g < proteinFloor) { protein_g = proteinFloor; floors_applied.push("protein_min_1.2"); }

  // recompute fat min after cal floor, then carbs = remainder
  fat_g = Math.max(0.6 * kg, fat_g);
  let calFromPF = protein_g * 4 + fat_g * 9;
  let carb_g = Math.max(0, (cal - calFromPF) / 4);

  // water
  let water_ml = round(35 * kg, 250);
  const waterNote = (health_flags || []).includes("blood_pressure")
    ? "Confirm your fluid target with your doctor."
    : null;

  return {
    escalated: false,
    method: "mifflin",
    age, bmr: Math.round(bmrVal), tdee: Math.round(tdeeVal),
    calorie_target: Math.round(cal),
    protein_g: Math.round(protein_g),
    fat_g: Math.round(fat_g),
    carb_g: Math.round(carb_g),
    water_ml,
    water_note: waterNote,
    lever_tags: tags,
    meal_split: defaultSplit(meals_per_day),
    floors_applied,
  };
}

// meal split percentages -> calorie amounts depend on caller; here we return ratios.
export function defaultSplit(mealsPerDay) {
  if (mealsPerDay <= 3) return { breakfast: 0.3, lunch: 0.4, dinner: 0.3 };
  if (mealsPerDay >= 5) return { breakfast: 0.22, lunch: 0.3, snack1: 0.13, snack2: 0.1, dinner: 0.25 };
  return { breakfast: 0.25, lunch: 0.35, snack: 0.15, dinner: 0.25 }; // 4 meals (default)
}
