'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Student = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeType: string;
  predictedScore?: number;
  photoUrl?: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => student.fullName.toLowerCase().includes(query));
  }, [students, searchTerm]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students/list');
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load students.');
        }
        setStudents(result.students || []);
      } catch (fetchError: unknown) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <main className="main-shell">
      <section className="card w-full max-w-6xl rounded-3xl p-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Student Records</p>
            <h1 className="glow-text mt-3 text-4xl font-semibold">All Students</h1>
            <p className="mt-2 text-slate-300">View the newly added student profiles and Gate score predictions.</p>
          </div>
          <div className="w-full sm:w-80">
            <label className="block text-sm font-medium text-slate-400">Search by name</label>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8 text-center text-slate-300">Loading students...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-200">{error}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8 text-center text-slate-300">
            {searchTerm ? 'No students found for that name.' : 'No students found yet. Add a student first.'}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                onClick={() => router.push(`/students/${student._id}`)}
                className="group cursor-pointer rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-neon transition hover:-translate-y-1 hover:border-cyan-400"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-900">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">No image</div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{student.fullName}</h2>
                    <p className="text-slate-400">{student.email}</p>
                    <p className="mt-1 text-slate-400">{student.phone}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">College</p>
                    <p className="mt-2 text-white">{student.collegeType}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Predicted Score</p>
                    <p className="mt-2 text-white">{student.predictedScore ?? 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
