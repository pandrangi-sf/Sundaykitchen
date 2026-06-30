// Rules-based starter workout templates (Phase 1, no AI).
// Selected by goal + place (gym/home) + training days/week.

const SETS_REPS = {
  lose: '3 sets x 12-15 reps',
  gain: '4 sets x 6-10 reps',
  maintain: '3 sets x 10-12 reps',
  recomp: '3-4 sets x 8-12 reps'
};

const STEP_TARGET = {
  lose: 9000,
  gain: 7000,
  maintain: 8000,
  recomp: 8000
};

// Day splits keyed by how many training days the user picked.
const SPLITS = {
  2: ['Full body A', 'Full body B'],
  3: ['Push', 'Pull', 'Legs'],
  4: ['Upper', 'Lower', 'Push', 'Pull'],
  5: ['Chest + tri', 'Back + bi', 'Legs', 'Shoulders', 'Full body'],
  6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
};

const HOME_SWAPS = [
  'Barbell/machine -> dumbbell, band, or bodyweight',
  'Lat pulldown -> band pulldown or doorway rows',
  'Leg press -> goblet squat or split squat',
  'Cable fly -> band fly or floor press'
];

export function buildWorkout({ goal = 'maintain', place = 'gym', trainingDays = 4 }) {
  const days = Math.max(0, Math.min(7, Number(trainingDays) || 0));
  if (days === 0) {
    return {
      summary: 'No training days selected',
      note: 'Aim for daily steps and light mobility; add 2-3 short sessions when ready.',
      split: [],
      setsReps: SETS_REPS[goal],
      stepTarget: STEP_TARGET[goal],
      homeSwaps: place === 'home' ? HOME_SWAPS : []
    };
  }
  const key = days <= 2 ? 2 : days >= 6 ? 6 : days;
  const split = (SPLITS[key] || SPLITS[4]).slice(0, days);
  return {
    summary: `${days}-day ${place} split`,
    split,
    setsReps: SETS_REPS[goal],
    stepTarget: STEP_TARGET[goal],
    homeSwaps: place === 'home' ? HOME_SWAPS : []
  };
}
