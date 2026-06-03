'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data?.message || 'Login failed.');
      console.log(data)
      return;
    }

    localStorage.setItem('teacherSession', JSON.stringify({ email: data.email, name: data.fullName }));
    router.push('/dashboard');
  };

  return (
    <main className="main-shell">
      <section className="card w-full max-w-xl rounded-3xl p-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Login</p>
          <h1 className="glow-text mt-3 text-3xl font-semibold">Teacher Sign In</h1>
          <p className="mt-2 text-slate-300">Enter your email and password to continue to the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
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

          <label className="space-y-2 text-sm text-slate-300">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-white outline-none transition focus:border-cyan-400"
              placeholder="Enter password"
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <p className="text-sm text-slate-400">
            New teacher? <a href="/signup" className="text-cyan-300 hover:text-cyan-200">Create account</a>
          </p>
        </form>
      </section>
    </main>
  );
}
