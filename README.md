# Meal & Gym Plan (Phase 1)

A public wellness app: sign up, answer a short onboarding, accept consent, and get a
personalized plan (calorie/macro/water targets + a starter meal framework + a workout
template). No AI generation and no payments in Phase 1.

> General wellness guidance, not medical advice. Consult your doctor or a registered dietitian.

## Stack
Vite + React (JavaScript), Tailwind CSS, lucide-react, @supabase/supabase-js, vite-plugin-pwa.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```
If Supabase keys are not set, the app runs in a local preview mode (no auth, data in
localStorage) so you can click through onboarding -> consent -> plan.

## Environment variables
| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key (safe in client; RLS protects data) |
| `VITE_APP_ENV` | `uat` shows the staging sample-profile button + UAT ribbon; use `prod` (or unset) in production |

Never put the Supabase `service_role` key in the client.

## Two-environment setup (UAT + prod)
1. Create two Supabase projects, e.g. `mealsaas-uat` and `mealsaas-prod`.
2. In EACH project's SQL editor, run `supabase/schema.sql` (creates tables + RLS).
3. Enable Email auth in both. In UAT you may disable email confirmation for faster testing.
4. Create two Vercel environments:
   - Staging: `VITE_APP_ENV=uat` + the UAT project's URL/anon key.
   - Production: `VITE_APP_ENV=prod` + the prod project's URL/anon key.
5. Never share a database between environments.

## Promote to production
1. Verify on staging using the UAT checklist below.
2. Confirm `supabase/schema.sql` has been run in the prod project.
3. Set the production env vars in Vercel and deploy the same commit.
4. Keep signups geo-limited until legal review is complete (see below).

## Settings (data rights)
- Export my data: download a JSON of your profile, targets, and consents (wired in `db.js`).
- Delete my data: wired in `db.js` (`deleteMyData`) - removes the signed-in user's
  profile, health, targets and consent rows (RLS restricts deletes to `auth.uid()`),
  then signs out. The schema also cascades via `on delete cascade`. Note: removing the
  Supabase auth-user record itself needs a privileged server call (never a service_role
  key in the client) and is handled out-of-band before launch.

## Sample profiles (UAT)
When `VITE_APP_ENV=uat`, the onboarding screen shows a "Fill sample profile" bar with
one-tap presets (`src/data/samplePresets.js`): a metric fat-loss profile, an imperial
muscle-gain profile with a blood-pressure lever, and a pregnancy profile that exercises
the escalation path. These buttons never render in production.

## PWA icons
App icons live in `public/` as SVGs (`favicon.svg`, `icon.svg`) and are referenced by the
vite-plugin-pwa manifest. Replace with PNGs if you need wider install-icon support.

## Safety model
- Consent gate: four separate, unbundled, not-pre-ticked checkboxes block plan generation;
  each acceptance is logged with a version + timestamp.
- Deterministic engine (`src/lib/targetsEngine.js`): Mifflin-St Jeor BMR, activity TDEE,
  goal calories, macros, water. Safety floors applied last (min calories, capped deficit/
  surplus, min protein).
- Escalation: serious flags (pregnancy, breastfeeding, eating-disorder history, type-1
  diabetes, kidney/liver disease) skip any deficit plan and show a professional-referral
  message with general balanced guidance only.
- `meds_note` is stored and shown back to the user but NEVER used in any calculation.
- Health data lives in its own table (`health_profile`); strict per-user RLS, no cross-user reads.

## NOT negotiable before charging money / going broadly live
Have the Terms, Privacy Policy, consent copy, and medical disclaimer reviewed by a qualified
health-tech lawyer, and launch geo-limited at first. Phase 1 has no payments by design.

## UAT checklist
See `UAT_CHECKLIST.md`.

## Roadmap
- Phase 1 (this): signup -> onboarding -> consent -> targets + starter framework + workout.
- Phase 2: AI-generated weekly menus.
- Phase 3: daily tracker.
- Phase 4: Stripe subscriptions.
