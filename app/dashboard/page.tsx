'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Student = {
  _id: string;
  fullName: string;
  gender?: string;
  predictedScore?: number;
  photoUrl?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = typeof window !== 'undefined' ? localStorage.getItem('teacherSession') : null;
    if (!session) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(session);
    setTeacherName(parsed?.name || 'Teacher');

    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students/list');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Unable to load students.');
        }

        setStudents(result.students || []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [router]);

  const stats = useMemo(() => {
    const total = students.length;
    const maleCount = students.filter((student) => student.gender?.toLowerCase() === 'male').length;
    const femaleCount = students.filter((student) => student.gender?.toLowerCase() === 'female').length;

    const scoreRanges = Array.from({ length: 10 }, (_, index) => ({
      label: `${index * 10}-${index * 10 + 10}`,
      start: index * 10,
      end: index * 10 + 10,
      count: 0,
    }));

    students.forEach((student) => {
      const score = Number(student.predictedScore ?? 0);
      const bucketIndex = Math.min(Math.max(Math.floor(score / 10), 0), 9);
      scoreRanges[bucketIndex].count += 1;
    });

    const maxRangeCount = Math.max(...scoreRanges.map((item) => item.count), 1);

    return {
      total,
      maleCount,
      femaleCount,
      scoreRanges,
      maxRangeCount,
    };
  }, [students]);

  const topStudents = useMemo(() => {
    return [...students]
      .sort((first, second) => (second.predictedScore ?? 0) - (first.predictedScore ?? 0))
      .slice(0, 5);
  }, [students]);

  const pieStyle = useMemo(() => {
    const total = Math.max(stats.total, 1);
    const malePercent = (stats.maleCount / total) * 100;
    const femalePercent = 100 - malePercent;

    return {
      backgroundImage: `conic-gradient(#22d3ee 0deg ${malePercent * 3.6}deg, #f472b6 ${malePercent * 3.6}deg ${malePercent * 3.6 + femalePercent * 3.6}deg, #0f172a ${malePercent * 3.6 + femalePercent * 3.6}deg 360deg)`,
      backgroundColor: '#111827',
      boxShadow: '0 0 30px rgba(56, 189, 248, 0.18)',
    };
  }, [stats]);

  if (loading) {
    return (
      <main className="main-shell">
        <div className="card rounded-3xl p-10 text-center">
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <section className="card w-full max-w-7xl rounded-3xl p-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Welcome back</p>
            <h1 className="glow-text mt-3 text-4xl font-semibold">{teacherName}</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('teacherSession');
              router.push('/login');
            }}
            className="rounded-2xl border border-slate-700 bg-slate-950/90 px-5 py-3 text-sm text-slate-100 transition hover:border-cyan-400 hover:text-cyan-100"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <button
            onClick={() => router.push('/add-student')}
            className="group rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-8 text-left shadow-neon transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-slate-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 transition group-hover:bg-cyan-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.35em] text-slate-400">Add Student</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Create new record</h2>
            <p className="mt-3 text-slate-400">Add a student profile, upload details, and prepare for gate score prediction.</p>
          </button>

          <button
            onClick={() => router.push('/students')}
            className="group rounded-3xl border border-pink-400/20 bg-slate-950/80 p-8 text-left shadow-neon transition hover:-translate-y-1 hover:border-pink-300/50 hover:bg-slate-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300 transition group-hover:bg-pink-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                <path d="M8 11h8M8 15h5" />
              </svg>
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.35em] text-slate-400">View Students</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">All student records</h2>
            <p className="mt-3 text-slate-400">Browse and manage existing students with quick access to edit or delete profiles.</p>
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-neon">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Overview</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Student performance snapshot</h2>
                <p className="mt-2 text-slate-400">A quick dashboard view with total students, gender split, and score distribution.</p>
              </div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">Live data</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Total students</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stats.total}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Male</p>
                <p className="mt-3 text-3xl font-semibold text-cyan-200">{stats.maleCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Female</p>
                <p className="mt-3 text-3xl font-semibold text-pink-200">{stats.femaleCount}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Gender pie chart</p>
                <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-32 w-32 rounded-full border border-slate-700" style={pieStyle}>
                    <div className="absolute inset-[8px] rounded-full bg-slate-950/95" />
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-cyan-400" /> Male: {stats.maleCount}</div>
                    <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-pink-400" /> Female: {stats.femaleCount}</div>
                    <p className="text-slate-400">This gives a quick gender split of the current student database.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Predicted score ranges</p>
                <div className="mt-4 flex h-64 items-end gap-3">
                  {stats.scoreRanges.map((range) => {
                    const heightPercent = stats.maxRangeCount === 0 ? 0 : (range.count / stats.maxRangeCount) * 100;
                    const barHeight = Math.max(heightPercent, range.count > 0 ? 10 : 4);

                    return (
                      <div key={range.label} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-48 w-full items-end rounded-2xl bg-slate-950/80 p-1">
                          <div
                            className="w-full rounded-xl bg-gradient-to-t from-cyan-400 via-sky-400 to-pink-400 shadow-[0_0_20px_rgba(56,189,248,0.18)]"
                            style={{ height: `${barHeight}%`, minHeight: range.count > 0 ? '10%' : '4%' }}
                          />
                        </div>
                        <span className="text-center text-xs text-slate-400">{range.label}</span>
                        <strong className="text-sm text-white">{range.count}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-neon">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-pink-300/80">Top students</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Top 5 predicted scores</h2>
              <p className="mt-2 text-slate-400">Click any student to open their detailed profile page.</p>
            </div>

            {error ? (
              <div className="mt-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
            ) : topStudents.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-900/90 p-5 text-slate-300">No student scores available yet.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {topStudents.map((student, index) => (
                  <button
                    key={student._id}
                    type="button"
                    onClick={() => router.push(`/students/${student._id}`)}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">{student.fullName.charAt(0)}</div>
                        )}
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-semibold text-cyan-100">#{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-base font-semibold text-white">{student.fullName}</p>
                        <p className="text-sm text-slate-400">Predicted score: {student.predictedScore ?? 'N/A'}</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100">View</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
