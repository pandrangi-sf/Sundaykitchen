# UAT Checklist (Phase 1)

Run these on the STAGING environment (VITE_APP_ENV=uat) before promoting to prod.

## Setup
- [ ] `supabase/schema.sql` has been run in the UAT project (tables + RLS exist).
- [ ] Email auth is enabled in the UAT Supabase project.
- [ ] Staging env vars set: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_ENV=uat.
- [ ] UAT ribbon ("UAT - test data") is visible.

## Auth
- [ ] Can sign up with email + password.
- [ ] Can sign in and sign out.
- [ ] After sign-up, onboarding starts automatically.

## Onboarding
- [ ] Each step shows one question group; Back/Next work; progress bar advances.
- [ ] Metric and imperial both accept height/weight.
- [ ] Allergies and cuisines multi-select toggle correctly.
- [ ] Health step can be SKIPPED and still produce a basic plan.
- [ ] Medications note is captured and later shown back with the 'not used in calculation' note.

## Sample profiles (UAT only)
- [ ] "Fill sample profile" bar is visible on onboarding (staging only).
- [ ] "Fat loss (metric)" preset fills the form and produces a normal plan.
- [ ] "Muscle gain (imperial, blood pressure)" preset fills imperial fields + BP lever.
- [ ] "Escalation path (pregnancy)" preset triggers the professional-referral message.
- [ ] The sample bar is NOT shown when VITE_APP_ENV=prod.

## Consent gate
- [ ] Plan is blocked until ALL FOUR boxes are checked.
- [ ] Boxes are separate, not bundled, and none are pre-ticked.
- [ ] After accepting, a row per consent_key is written with the current version.

## Targets engine
- [ ] Typical cutting profile returns sensible calories/macros/water.
- [ ] Very low intake clamps to the safety floor (never below the minimum).
- [ ] A serious flag (e.g. pregnancy) shows the professional-referral message and NO deficit.
- [ ] Blood-pressure flag adds the 'confirm fluid target with your doctor' note.
- [ ] Re-running onboarding recomputes targets.

## Plan output
- [ ] Numbers, per-meal split, meal framework, and workout all render.
- [ ] Meal examples respect diet + allergies (no conflicting foods shown).
- [ ] 'Not medical advice' disclaimer appears on the plan screen.

## Privacy / data
- [ ] A second test user cannot see the first user's rows (RLS).
- [ ] 'Export my data' downloads a JSON with profile + targets + consents.
- [ ] 'Delete my data' asks for confirmation, then removes the user's rows and signs out.
- [ ] After deletion, signing back in starts a fresh onboarding (no old data).

## Promote
- [ ] App installs as a PWA (manifest + icon load; standalone display).
- [ ] schema.sql also run in PROD project.
- [ ] Prod env vars set (VITE_APP_ENV=prod), UAT ribbon hidden in prod.
- [ ] Legal review of Terms/Privacy/consent/disclaimer complete before opening public signups.
