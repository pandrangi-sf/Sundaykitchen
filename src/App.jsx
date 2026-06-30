import { useEffect, useState } from 'react';
import { Loader2, LogOut, Pencil } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { isUAT } from './lib/supabaseClient.js';
import Auth from './components/Auth.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';

// Stage 2: auth + onboarding flow.
// Profile is held in localStorage for now; Stage 3 wires Supabase tables,
// the consent gate, and the plan output. After onboarding we show a
// temporary 'profile captured' summary as a placeholder for the dashboard.

const PROFILE_KEY = 'mgp.profile.v1';

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
}

function UatRibbon() {
  if (!isUAT) return null;
  return (
    <div className="fixed top-3 right-3 z-50 rounded-full bg-gold text-ink text-xs font-bold px-3 py-1 shadow">
      UAT — test data
    </div>
  );
}

function ProfileSummary({ profile, onEdit, onSignOut }) {
  const rows = [
    ['Goal', profile.goal],
    ['Sex', profile.sex],
    ['Activity', profile.activity],
    ['Diet', profile.diet],
    ['Allergies', (profile.allergies || []).join(', ') || 'none'],
    ['Meals/day', profile.meals_per_day],
    ['Training days', profile.training_days],
    ['Health flags', (profile.health_flags || []).join(', ') || 'none']
  ];
  return (
    <div className="min-h-screen px-5 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Your profile</h1>
          <button onClick={onSignOut} className="flex items-center gap-1 text-sm text-ink/60 hover:text-ink">
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <p className="mt-2 text-sm text-ink/60">
          Saved. In the next step we&apos;ll add the consent gate and generate your personalized targets,
          starter meal framework, and workout template.
        </p>

        <div className="mt-5 rounded-2xl border border-ink/10 bg-white divide-y divide-ink/10">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink/60">{k}</span>
              <span className="text-sm font-medium text-ink capitalize">{String(v)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-paper border border-ink/10 px-4 py-3 text-xs text-ink/60">
          General wellness guidance, not medical advice — consult your doctor or dietitian.
        </div>

        <button onClick={onEdit}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-teal text-teal font-semibold py-3 hover:bg-teal/5">
          <Pencil size={18} /> Update my answers
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading, signOut, isSupabaseConfigured } = useAuth();
  const [profile, setProfile] = useState(loadProfile());
  const [onboarding, setOnboarding] = useState(false);

  // When a user signs in and has no profile yet, start onboarding.
  useEffect(() => {
    if (user && !profile) setOnboarding(true);
  }, [user, profile]);

  function handleComplete(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
    setOnboarding(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // If Supabase is not configured, let people preview onboarding without auth.
  const signedIn = isSupabaseConfigured ? Boolean(user) : true;

  return (
    <>
      <UatRibbon />
      {!signedIn && <Auth />}
      {signedIn && (onboarding || !profile) && (
        <OnboardingWizard
          initial={profile}
          onComplete={handleComplete}
          onCancel={() => profile && setOnboarding(false)}
        />
      )}
      {signedIn && profile && !onboarding && (
        <ProfileSummary
          profile={profile}
          onEdit={() => setOnboarding(true)}
          onSignOut={async () => { await signOut(); localStorage.removeItem(PROFILE_KEY); setProfile(null); }}
        />
      )}
    </>
  );
}
