// Onboarding option sets (Phase 1). Values are stable keys stored to DB;
// labels are display text. Keep keys in sync with the targets engine.

export const GOALS = [
  { value: 'lose', label: 'Lose fat' },
  { value: 'gain', label: 'Build muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'recomp', label: 'Recomposition' }
];

export const SEXES = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'very', label: 'Very active (6-7 days/week)' },
  { value: 'athlete', label: 'Athlete (twice daily / physical job)' }
];

export const DIETS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' }
];

export const COMMON_ALLERGENS = [
  'Dairy', 'Eggs', 'Peanuts', 'Tree nuts', 'Soy', 'Wheat/Gluten',
  'Fish', 'Shellfish', 'Sesame'
];

export const CUISINES = [
  'Indian', 'Mediterranean', 'East Asian', 'Mexican', 'American',
  'Middle Eastern', 'Italian'
];

export const TRAINING_PLACES = [
  { value: 'gym', label: 'Gym' },
  { value: 'home', label: 'Home' }
];

// Health flags. 'serious' ones trigger the professional-referral path in the engine.
export const HEALTH_FLAGS = [
  { value: 'none', label: 'None', serious: false },
  { value: 'blood_sugar', label: 'Managing blood sugar', serious: false },
  { value: 'blood_pressure', label: 'Managing blood pressure', serious: false },
  { value: 'cholesterol', label: 'High cholesterol', serious: false },
  { value: 'pregnancy', label: 'Pregnant', serious: true },
  { value: 'breastfeeding', label: 'Breastfeeding', serious: true },
  { value: 'eating_disorder', label: 'Eating-disorder history', serious: true },
  { value: 'type1_diabetes', label: 'Type 1 diabetes', serious: true },
  { value: 'kidney_disease', label: 'Kidney disease', serious: true },
  { value: 'liver_disease', label: 'Liver disease', serious: true }
];
