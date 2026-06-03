'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Student = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  collegeType: string;
  collegeTier: string;
  collegeRegular: string;
  studyMode: string;
  preparationType: string;
  dailyStudyHours: number;
  collegeAttendancePercent: number;
  sem1: number;
  sem2: number;
  sem3: number;
  sem4: number;
  sem5: number;
  sem6: number;
  sem7: number;
  sem8: number;
  mockTest1: number;
  mockTest2: number;
  mockTest3: number;
  mockTest4: number;
  mockTest5: number;
  photoUrl?: string;
  predictedScore?: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = toRadians(angleInDegrees - 90);
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
};

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const semScores = useMemo(() => {
    if (!student) return [];
    return [student.sem1, student.sem2, student.sem3, student.sem4, student.sem5, student.sem6, student.sem7, student.sem8];
  }, [student]);

  const mockScores = useMemo(() => {
    if (!student) return [];
    return [student.mockTest1, student.mockTest2, student.mockTest3, student.mockTest4, student.mockTest5];
  }, [student]);

  const average = (numbers: number[]) => (numbers.length === 0 ? 0 : numbers.reduce((sum, value) => sum + value, 0) / numbers.length);

  const avgSemScore = useMemo(() => average(semScores), [semScores]);
  const avgMockScore = useMemo(() => average(mockScores), [mockScores]);

  const performanceIndex = useMemo(() => {
    if (!student) return 0;
    const predicted = student.predictedScore ?? 0;
    const index = avgSemScore * 0.35 + avgMockScore * 0.35 + student.collegeAttendancePercent * 0.2 + predicted * 0.1;
    return Math.round(Math.min(Math.max(index, 0), 100));
  }, [avgMockScore, avgSemScore, student]);

  const predictionConfidence = useMemo(() => {
    if (!student) return 0;

    const base = Math.min(performanceIndex + 10, 95);
    const consistency = Math.abs(avgSemScore - avgMockScore) < 12 ? 5 : 0;
    return Math.round(Math.min(Math.max(base + consistency, 0), 100));
  }, [avgMockScore, avgSemScore, performanceIndex, student]);

  const pieSlices = useMemo(() => {
    if (!student) return [];
    const pieces = [
      { name: 'Semester Avg', value: avgSemScore, color: 'rgb(34, 197, 94)' },
      { name: 'Mock Avg', value: avgMockScore, color: 'rgb(59, 130, 246)' },
      { name: 'Attendance', value: student.collegeAttendancePercent, color: 'rgb(168, 85, 247)' },
      { name: 'Predicted', value: student.predictedScore ?? 0, color: 'rgb(248, 113, 113)' },
    ];
    const total = pieces.reduce((sum, slice) => sum + Math.max(slice.value, 0), 0) || 1;
    let startAngle = 0;
    return pieces.map((slice) => {
      const percent = slice.value / total;
      const endAngle = startAngle + percent * 360;
      const path = describeArc(90, 90, 80, startAngle, endAngle);
      const result = {
        ...slice,
        percent: Math.round(percent * 100),
        path,
      };
      startAngle = endAngle;
      return result;
    });
  }, [avgSemScore, avgMockScore, student]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/students/${params.id}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Unable to fetch student.');
        }
        setStudent(result.student);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load student.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this student? This cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/students/${params.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to delete student.');
      }
      router.push('/students');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed.');
    }
  };

  if (loading) {
    return (
      <main className="main-shell">
        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-12 text-center text-slate-300">Loading student details...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-shell">
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-12 text-center text-rose-200">{error}</div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="main-shell">
        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-12 text-center text-slate-300">Student data not available.</div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <section className="card w-full max-w-6xl rounded-3xl p-4 sm:p-6 md:p-10">
        {/* <div className="mb-6 grid gap-4 sm:grid-cols-[1.8fr_1fr] sm:items-end">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-slate-900 sm:h-28 sm:w-28">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-slate-500 px-3 text-sm">No photo available</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80 sm:text-sm">Student detail</p>
              <h1 className="glow-text mt-2 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">{student.fullName}</h1>
              <p className="mt-2 text-sm text-slate-400">Full profile, score charts, attendance, and prediction analytics.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push(`/add-student?editId=${student._id}`)}
              className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
            >
              Delete
            </button>
          </div>
        </div> */}

        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-neon">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div className="h-28 w-28 overflow-hidden rounded-3xl bg-slate-900">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-slate-500 px-3 text-sm">No photo available</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Student overview</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{student.fullName}</h2>
                  <p className="mt-2 text-sm text-slate-400">{student.email}</p>
                  <p className="text-sm text-slate-400">{student.phone}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Predicted score</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{student.predictedScore ?? 'N/A'}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Attendance</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{student.collegeAttendancePercent}%</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Avg semester</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{avgSemScore.toFixed(1)}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Avg mock</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{avgMockScore.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-neon">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Actions</p>
                    <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Manage student</h2>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push(`/add-student?editId=${student._id}`)}
                    className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-neon">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Student details</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">College type</p>
                    <p className="mt-2 text-white">{student.collegeType}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">College tier</p>
                    <p className="mt-2 text-white">{student.collegeTier}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Attendance type</p>
                    <p className="mt-2 text-white">{student.collegeRegular}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Study mode</p>
                    <p className="mt-2 text-white">{student.studyMode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-neon">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Semester progression</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Semester score graph</h2>
              <p className="mt-2 text-sm text-slate-400">All semester scores plotted in a full-width visual.</p>
              <div className="mt-5 overflow-hidden rounded-3xl bg-slate-950/80 p-3">
                <svg className="h-80 w-full" viewBox="0 0 760 260" preserveAspectRatio="xMinYMin meet">
                  <defs>
                    <linearGradient id="semGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <line x1="40" y1="35" x2="40" y2="190" stroke="rgb(71, 85, 105)" strokeWidth="1" />
                  <line x1="40" y1="190" x2="720" y2="190" stroke="rgb(71, 85, 105)" strokeWidth="1" />

                  {[0, 25, 50, 75, 100].map((value) => (
                    <g key={`sem-grid-${value}`}>
                      <line
                        x1="40"
                        y1={190 - (value / 100) * 140}
                        x2="720"
                        y2={190 - (value / 100) * 140}
                        stroke="rgb(71, 85, 105)"
                        strokeWidth="1"
                        strokeDasharray="4"
                        opacity="0.5"
                      />
                      <text
                        x="34"
                        y={194 - (value / 100) * 140}
                        fontSize="11"
                        fill="rgb(148, 163, 184)"
                        textAnchor="end"
                      >
                        {value}
                      </text>
                    </g>
                  ))}

                  <path
                    d={`M 40 ${190 - (semScores[0] / 100) * 140} ${semScores
                      .map((score, i) => `L ${40 + i * 80} ${190 - (score / 100) * 140}`)
                      .join(' ')} L ${40 + (semScores.length - 1) * 80} 190 L 40 190 Z`}
                    fill="url(#semGradient)"
                  />
                  <polyline
                    points={semScores.map((score, i) => `${40 + i * 80},${190 - (score / 100) * 140}`).join(' ')}
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  {semScores.map((score, index) => (
                    <circle
                      key={`sem-circle-${index}`}
                      cx={40 + index * 80}
                      cy={190 - (score / 100) * 140}
                      r="4"
                      fill="rgb(34, 197, 94)"
                    />
                  ))}

                  {semScores.map((_, index) => (
                    <text
                      key={`x-label-sem-${index}`}
                      x={40 + index * 80}
                      y="206"
                      fontSize="10"
                      fill="rgb(148, 163, 184)"
                      textAnchor="middle"
                    >
                      S{index + 1}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-neon">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Mock test progression</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Mock score graph</h2>
              <p className="mt-2 text-sm text-slate-400">All mock test scores plotted in a second full-width visual.</p>
              <div className="mt-5 overflow-hidden rounded-3xl bg-slate-950/80 p-3">
                <svg className="h-80 w-full" viewBox="0 0 760 260" preserveAspectRatio="xMinYMin meet">
                  <defs>
                    <linearGradient id="mockSingleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <line x1="40" y1="35" x2="40" y2="190" stroke="rgb(71, 85, 105)" strokeWidth="1" />
                  <line x1="40" y1="190" x2="660" y2="190" stroke="rgb(71, 85, 105)" strokeWidth="1" />

                  {[0, 25, 50, 75, 100].map((value) => (
                    <g key={`mock-grid-${value}`}>
                      <line
                        x1="40"
                        y1={190 - (value / 100) * 140}
                        x2="660"
                        y2={190 - (value / 100) * 140}
                        stroke="rgb(71, 85, 105)"
                        strokeWidth="1"
                        strokeDasharray="4"
                        opacity="0.5"
                      />
                      <text
                        x="34"
                        y={194 - (value / 100) * 140}
                        fontSize="11"
                        fill="rgb(148, 163, 184)"
                        textAnchor="end"
                      >
                        {value}
                      </text>
                    </g>
                  ))}

                  <path
                    d={`M 40 ${190 - (mockScores[0] / 100) * 140} ${mockScores
                      .map((score, i) => `L ${40 + i * 120} ${190 - (score / 100) * 140}`)
                      .join(' ')} L ${40 + (mockScores.length - 1) * 120} 190 L 40 190 Z`}
                    fill="url(#mockSingleGradient)"
                  />
                  <polyline
                    points={mockScores.map((score, i) => `${40 + i * 120},${190 - (score / 100) * 140}`).join(' ')}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  {mockScores.map((score, index) => (
                    <circle
                      key={`mock-circle-${index}`}
                      cx={40 + index * 120}
                      cy={190 - (score / 100) * 140}
                      r="4"
                      fill="rgb(59, 130, 246)"
                    />
                  ))}

                  {mockScores.map((_, index) => (
                    <text
                      key={`x-label-mock-${index}`}
                      x={40 + index * 120}
                      y="206"
                      fontSize="10"
                      fill="rgb(148, 163, 184)"
                      textAnchor="middle"
                    >
                      M{index + 1}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
