'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    setLoading(true);
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data?.message || 'Unable to create account.');
      return;
    }

    router.push('/login');
  };

  return (
    <main className="main-shell">
      <section className="card w-full max-w-2xl rounded-3xl p-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Signup</p>
          <h1 className="glow-text mt-3 text-3xl font-semibold">Teacher Sign Up</h1>
          <p className="mt-2 text-slate-300">Create your teacher account to manage students and predictions.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Full Name
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none transition focus:border-cyan-400"
                placeholder="John Doe"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Phone
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none transition focus:border-cyan-400"
                placeholder="9876543210"
                type="tel"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none transition focus:border-cyan-400"
              placeholder="teacher@example.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none transition focus:border-cyan-400"
                placeholder="Create password"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Confirm Password
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none transition focus:border-cyan-400"
                placeholder="Re-enter password"
              />
            </label>
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <a href="/login" className="text-cyan-300 hover:text-cyan-200">
              Login here
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
