import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { isUAT, isSupabaseConfigured } from './lib/supabaseClient.js';
import { computeTargets } from './lib/targetsEngine.js';
import { hasAllConsents } from './lib/consent.js';
import {
  saveProfile, loadProfile, saveTargets, loadTargets,
  saveConsents, loadConsents, exportMyData, clearLocal, normalizeProfile
} from './lib/db.js';
import Auth from './components/Auth.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';
import ConsentGate from './components/ConsentGate.jsx';
import PlanView from './components/PlanView.jsx';

// Stage 3 flow: auth -> onboarding -> consent gate -> compute targets -> plan.
// When Supabase is unconfigured we use a synthetic 'local' user id so the
// localStorage fallback in db.js still works end to end.

const LOCAL_UID = 'local-user';

// Build the engine input from the (metric-normalized) wizard profile.
function toEngineInput(profile) {
  const n = normalizeProfile(profile);
  return {
    sex: profile.sex,
    dob: profile.dob,
    height_cm: n.height_cm,
    weight_kg: n.weight_kg,
    activity: profile.activity,
    goal: profile.goal,
    meals_per_day: profile.meals_per_day,
    health_flags: profile.health_flags || []
  };
}

function UatRibbon() {
  if (!isUAT) return null;
  return (
    <div className="fixed top-3 right-3 z-50 rounded-full bg-gold text-ink text-xs font-bold px-3 py-1 shadow">
      UAT — test data
    </div>
  );
}

export default function App() {
  const { user, loading, signOut } = useAuth();
  const uid = isSupabaseConfigured ? user?.id : LOCAL_UID;
  const signedIn = isSupabaseConfigured ? Boolean(user) : true;

  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState(null);
  const [consents, setConsents] = useState([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const consented = hasAllConsents(consents);

  // Load existing data once we know who the user is.
  useEffect(() => {
    let active = true;
    async function init() {
      if (!signedIn || !uid) { setReady(true); return; }
      const [p, t, c] = await Promise.all([loadProfile(uid), loadTargets(uid), loadConsents(uid)]);
      if (!active) return;
      setProfile(p); setTargets(t); setConsents(c); setReady(true);
    }
    setReady(false);
    init();
    return () => { active = false; };
  }, [signedIn, uid]);

  // Safety net: if we have a profile + consent but no targets, compute them.
  useEffect(() => {
    let active = true;
    async function ensure() {
      if (ready && profile && consented && !targets && !busy && !editing) {
        setBusy(true);
        const t = computeTargets(toEngineInput(profile));
        await saveTargets(t, uid);
        if (active) setTargets(t);
        setBusy(false);
      }
    }
    ensure();
    return () => { active = false; };
  }, [ready, profile, consented, targets, busy, editing, uid]);

  const handleOnboardingComplete = useCallback(async (p) => {
    setBusy(true);
    await saveProfile(p, uid);
    setProfile(p);
    setEditing(false);
    if (hasAllConsents(consents)) {
      const t = computeTargets(toEngineInput(p));
      await saveTargets(t, uid);
      setTargets(t);
    } else {
      setTargets(null); // force consent gate before plan
    }
    setBusy(false);
  }, [uid, consents]);

  const handleAccept = useCallback(async (checkedMap) => {
    setBusy(true);
    await saveConsents(checkedMap, uid);
    const fresh = await loadConsents(uid);
    setConsents(fresh);
    if (profile) {
      const t = computeTargets(toEngineInput(profile));
      await saveTargets(t, uid);
      setTargets(t);
    }
    setBusy(false);
  }, [uid, profile]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    await clearLocal();
    setProfile(null); setTargets(null); setConsents([]);
  }, [signOut]);

  const handleExport = useCallback(async () => {
    const data = await exportMyData(uid);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-data.json'; a.click();
    URL.revokeObjectURL(url);
  }, [uid]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!signedIn) return (<><UatRibbon /><Auth /></>);

  const needsOnboarding = editing || !profile;

  let screen;
  if (needsOnboarding) {
    screen = (
      <OnboardingWizard
        initial={profile}
        onComplete={handleOnboardingComplete}
        onCancel={() => profile && setEditing(false)}
      />
    );
  } else if (!consented) {
    screen = <ConsentGate onAccept={handleAccept} busy={busy} />;
  } else if (targets) {
    screen = (
      <PlanView
        profile={profile}
        targets={targets}
        onEdit={() => setEditing(true)}
        onSignOut={handleSignOut}
        onExport={handleExport}
      />
    );
  } else {
    screen = (
      <div className="min-h-screen flex items-center justify-center text-ink/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (<><UatRibbon />{screen}</>);
}
