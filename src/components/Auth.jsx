import { useState } from 'react';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { signUp, signIn, isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    const fn = mode === 'signup' ? signUp : signIn;
    const { data, error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) { setError(error.message); return; }
    if (mode === 'signup' && !data?.session) {
      setInfo('Check your email to confirm your account, then sign in.');
      setMode('signin');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-teal flex items-center justify-center text-white shadow-md">
            <Leaf size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">Meal &amp; Gym Plan</h1>
          <p className="mt-1 text-sm text-ink/60 text-center">
            Personalized wellness targets, a starter meal framework, and a workout template.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl bg-gold/15 border border-gold/40 px-4 py-3 text-sm text-ink">
            Supabase isn&apos;t configured yet. Add your keys to .env.local to enable sign-in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2.5 focus-within:border-teal">
              <Mail size={18} className="text-ink/40" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-ink" placeholder="you@example.com" />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2.5 focus-within:border-teal">
              <Lock size={18} className="text-ink/40" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-ink" placeholder="At least 6 characters" />
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-teal-dark">{info}</p>}

          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-teal hover:bg-teal-dark text-white font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 size={18} className="animate-spin" />}
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setInfo(''); }}
            className="font-semibold text-teal hover:underline">
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
