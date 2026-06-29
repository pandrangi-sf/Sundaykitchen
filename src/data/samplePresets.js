// Staging-only sample profiles for UAT. Surfaced behind isUAT (VITE_APP_ENV==='uat').
// These let testers fill the onboarding form with one tap to exercise the engine,
// consent gate, plan output, and the escalation path. NEVER shown in production.
// Shapes match emptyProfile in OnboardingWizard.jsx.

export const SAMPLE_PRESETS = [
  {
    id: 'cut-metric',
    label: 'Fat loss (metric)',
    profile: {
      goal: 'lose',
      sex: 'male',
      dob: '1990-05-14',
      units: 'metric',
      height_cm: '180',
      height_ft: '',
      height_in: '',
      weight: '82',
      target_weight: '76',
      activity: 'moderate',
      diet: 'omnivore',
      allergies: [],
      allergies_other: '',
      avoid_foods: '',
      cuisines: ['Indian', 'Mediterranean'],
      meals_per_day: 4,
      training_days: 4,
      training_place: 'gym',
      health_flags: ['none'],
      health_other: '',
      meds_note: ''
    }
  },
  {
    id: 'gain-imperial-bp',
    label: 'Muscle gain (imperial, blood pressure)',
    profile: {
      goal: 'gain',
      sex: 'female',
      dob: '1995-11-02',
      units: 'imperial',
      height_cm: '',
      height_ft: '5',
      height_in: '6',
      weight: '140',
      target_weight: '150',
      activity: 'light',
      diet: 'vegetarian',
      allergies: ['Peanuts'],
      allergies_other: '',
      avoid_foods: 'Liver',
      cuisines: ['East Asian', 'Italian'],
      meals_per_day: 4,
      training_days: 3,
      training_place: 'home',
      health_flags: ['blood_pressure'],
      health_other: '',
      meds_note: 'Sample note — stored, never used in calculations.'
    }
  },
  {
    id: 'escalation-pregnancy',
    label: 'Escalation path (pregnancy)',
    profile: {
      goal: 'lose',
      sex: 'female',
      dob: '1992-03-21',
      units: 'metric',
      height_cm: '165',
      height_ft: '',
      height_in: '',
      weight: '68',
      target_weight: '63',
      activity: 'light',
      diet: 'omnivore',
      allergies: [],
      allergies_other: '',
      avoid_foods: '',
      cuisines: ['Mediterranean'],
      meals_per_day: 4,
      training_days: 3,
      training_place: 'home',
      health_flags: ['pregnancy'],
      health_other: '',
      meds_note: ''
    }
  }
];
