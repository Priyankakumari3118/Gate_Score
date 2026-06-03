'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const defaultStudent = {
  fullName: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  collegeType: '',
  collegeTier: '',
  collegeRegular: '',
  studyMode: '',
  preparationType: '',
  dailyStudyHours: '',
  collegeAttendancePercent: '',
  sem1: '',
  sem2: '',
  sem3: '',
  sem4: '',
  sem5: '',
  sem6: '',
  sem7: '',
  sem8: '',
  mockTest1: '',
  mockTest2: '',
  mockTest3: '',
  mockTest4: '',
  mockTest5: '',
};

export default function AddStudentPage() {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const isEditMode = Boolean(editId);
  const [student, setStudent] = useState(defaultStudent);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (photoFile) {
      const previewUrl = URL.createObjectURL(photoFile);
      setPhotoPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }

    setPhotoPreview(existingPhotoUrl || '');
  }, [photoFile, existingPhotoUrl]);

  const previewData = useMemo(
    () => ({
      name: student.fullName || 'Student Name',
      email: student.email || 'Email address',
      phone: student.phone || 'Phone number',
      age: student.age || 'Age',
      gender: student.gender || 'Gender',
      collegeType: student.collegeType || 'College type',
      predicted: 'Pending',
    }),
    [student]
  );

  const handleChange = (field: keyof typeof student, value: string) => {
    setStudent((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditId(params.get('editId'));
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!editId) {
        return;
      }

      try {
        setIsLoadingStudent(true);
        const response = await fetch(`/api/students/${editId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || result.error || 'Unable to load student for editing.');
        }

        const studentData = result.student;
        setStudent({
          fullName: studentData.fullName || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          age: String(studentData.age ?? ''),
          gender: studentData.gender || '',
          collegeType: studentData.collegeType || '',
          collegeTier: studentData.collegeTier || '',
          collegeRegular: studentData.collegeRegular || '',
          studyMode: studentData.studyMode || '',
          preparationType: studentData.preparationType || '',
          dailyStudyHours: String(studentData.dailyStudyHours ?? ''),
          collegeAttendancePercent: String(studentData.collegeAttendancePercent ?? ''),
          sem1: String(studentData.sem1 ?? ''),
          sem2: String(studentData.sem2 ?? ''),
          sem3: String(studentData.sem3 ?? ''),
          sem4: String(studentData.sem4 ?? ''),
          sem5: String(studentData.sem5 ?? ''),
          sem6: String(studentData.sem6 ?? ''),
          sem7: String(studentData.sem7 ?? ''),
          sem8: String(studentData.sem8 ?? ''),
          mockTest1: String(studentData.mockTest1 ?? ''),
          mockTest2: String(studentData.mockTest2 ?? ''),
          mockTest3: String(studentData.mockTest3 ?? ''),
          mockTest4: String(studentData.mockTest4 ?? ''),
          mockTest5: String(studentData.mockTest5 ?? ''),
        });

        setExistingPhotoUrl(studentData.photoUrl || '');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load student.');
      } finally {
        setIsLoadingStudent(false);
      }
    };

    fetchStudent();
  }, [editId]);

  if (isEditMode && isLoadingStudent) {
    return (
      <main className="main-shell">
        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-12 text-center text-slate-300">Loading student record...</div>
      </main>
    );
  }


  const validateForm = () => {
    const requiredFields: Array<keyof typeof student> = [
      'fullName',
      'email',
      'phone',
      'age',
      'gender',
      'collegeType',
      'collegeTier',
      'collegeRegular',
      'studyMode',
      'preparationType',
      'dailyStudyHours',
      'collegeAttendancePercent',
      'sem1',
      'sem2',
      'sem3',
      'sem4',
      'sem5',
      'sem6',
      'sem7',
      'sem8',
      'mockTest1',
      'mockTest2',
      'mockTest3',
      'mockTest4',
      'mockTest5',
    ];

    if (!photoFile && !existingPhotoUrl) {
      setError('Please upload the student photo.');
      return false;
    }

    for (const field of requiredFields) {
      if (!student[field]?.toString().trim()) {
        setError('Please fill all required fields before submitting.');
        return false;
      }
    }

    if (Number(student.age) <= 0 || Number(student.dailyStudyHours) < 0) {
      setError('Age and study hours must be positive numbers.');
      return false;
    }

    return true;
  };

  const uploadImageToCloudinary = async () => {
    if (!photoFile) {
      throw new Error('No photo selected for upload.');
    }

    const form = new FormData();
    form.append('file', photoFile);

    const response = await fetch('/api/students/upload', {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    if (!response.ok || !result.photoUrl) {
      throw new Error(result.message || 'Image upload failed.');
    }

    return result.photoUrl as string;
  };

  const getPredictedScore = async () => {
    const payload = {
      age: Number(student.age),
      gender: student.gender,
      college_type: student.collegeType,
      college_tier: student.collegeTier,
      college_regular: student.collegeRegular,
      study_mode: student.studyMode,
      preparation_type: student.preparationType,
      daily_study_hours: Number(student.dailyStudyHours),
      'college_attendance_%': Number(student.collegeAttendancePercent),
      sem1: Number(student.sem1),
      sem2: Number(student.sem2),
      sem3: Number(student.sem3),
      sem4: Number(student.sem4),
      sem5: Number(student.sem5),
      sem6: Number(student.sem6),
      sem7: Number(student.sem7),
      sem8: Number(student.sem8),
      mock_test_1: Number(student.mockTest1),
      mock_test_2: Number(student.mockTest2),
      mock_test_3: Number(student.mockTest3),
      mock_test_4: Number(student.mockTest4),
      mock_test_5: Number(student.mockTest5),
    };

    console.log('📤 Sending prediction payload to Flask API:', payload);

    try {
      const response = await fetch('https://gate-prediction.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 API Response Status:', response.status, response.statusText);

      const result = await response.json();
      console.log('📥 API Response Body:', result);

      if (!response.ok) {
        const errorMessage = result.error || result.message || `API returned status ${response.status}`;
        throw new Error(errorMessage);
      }

      const score = result.predicted_gate_score;
      if (score === undefined || score === null) {
        throw new Error(`Prediction failed: ${result.error || 'Backend returned no score'}`);
      }

      console.log('✅ Prediction successful:', score);
      return Number(score);
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      if (fetchError instanceof TypeError) {
        throw new Error('Network error: Unable to reach the prediction API. Check your connection and API URL.');
      }
      throw fetchError;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const imageUrl = photoFile ? await uploadImageToCloudinary() : existingPhotoUrl;
      const predictedScore = await getPredictedScore();

      const savePayload = {
        ...student,
        age: Number(student.age),
        dailyStudyHours: Number(student.dailyStudyHours),
        collegeAttendancePercent: Number(student.collegeAttendancePercent),
        sem1: Number(student.sem1),
        sem2: Number(student.sem2),
        sem3: Number(student.sem3),
        sem4: Number(student.sem4),
        sem5: Number(student.sem5),
        sem6: Number(student.sem6),
        sem7: Number(student.sem7),
        sem8: Number(student.sem8),
        mockTest1: Number(student.mockTest1),
        mockTest2: Number(student.mockTest2),
        mockTest3: Number(student.mockTest3),
        mockTest4: Number(student.mockTest4),
        mockTest5: Number(student.mockTest5),
        photoUrl: imageUrl,
        predictedScore,
      };

      const apiUrl = editId ? `/api/students/${editId}` : '/api/students/create';
      const method = editId ? 'PATCH' : 'POST';

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Unable to save student.');
      }

      await Swal.fire({
        icon: 'success',
        title: editId ? 'Student Updated' : 'Student Added',
        text: editId
          ? 'Student profile updated successfully and prediction was refreshed.'
          : 'Student was added successfully and the predicted score is saved.',
        confirmButtonColor: '#06b6d4',
      });

      router.push('/students');
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : 'Something went wrong.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="main-shell">
      <section className="card w-full max-w-7xl rounded-3xl p-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">{isEditMode ? 'Edit student' : 'Add student'}</p>
            <h1 className="glow-text mt-3 text-4xl font-semibold">{isEditMode ? 'Edit student profile' : 'New student profile'}</h1>
            <p className="mt-2 text-slate-300 max-w-2xl">
              {isEditMode
                ? 'Update the student details, preview the profile, and refresh the Gate prediction.'
                : 'Fill the student details, preview profile, and save with Cloudinary image upload and Gate score prediction.'}
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8 shadow-neon">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                    <path d="M12 4.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5S14.485 4.5 12 4.5z" />
                    <path d="M6 20.5c0-3.314 2.686-6 6-6s6 2.686 6 6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Section 1</h2>
                  <p className="text-slate-400">Personal Information</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-3 text-sm text-slate-300">
                  Photo Upload
                  <input
                    required={!isEditMode || !existingPhotoUrl}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-slate-100 file:cursor-pointer file:rounded-xl file:border-0 file:bg-cyan-500/10 file:py-2 file:px-4 file:text-cyan-300"
                  />
                </label>

                <label className="space-y-3 text-sm text-slate-300">
                  Full Name
                  <input
                    required
                    value={student.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                    placeholder="Anjali Sharma"
                  />
                </label>

                <label className="space-y-3 text-sm text-slate-300">
                  Email
                  <input
                    required
                    type="email"
                    value={student.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                    placeholder="anjali@example.com"
                  />
                </label>

                <label className="space-y-3 text-sm text-slate-300">
                  Phone
                  <input
                    required
                    type="tel"
                    value={student.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                    placeholder="9876543210"
                  />
                </label>

                <label className="space-y-3 text-sm text-slate-300">
                  Age
                  <input
                    required
                    type="number"
                    min="16"
                    value={student.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                    placeholder="21"
                  />
                </label>

                <label className="space-y-3 text-sm text-slate-300">
                  Gender
                  <select
                    required
                    value={student.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8 shadow-neon">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                    <path d="M4 19.5h16" />
                    <path d="M6 4.5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z" />
                    <path d="M8 8.5h8M8 12.5h5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Section 2</h2>
                  <p className="text-slate-400">Academic Information</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-3 text-sm text-slate-300">
                  College Type
                  <select
                    required
                    value={student.collegeType}
                    onChange={(e) => handleChange('collegeType', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select college type</option>
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                  </select>
                </label>
                <label className="space-y-3 text-sm text-slate-300">
                  College Tier
                  <select
                    required
                    value={student.collegeTier}
                    onChange={(e) => handleChange('collegeTier', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select tier</option>
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </label>
                <label className="space-y-3 text-sm text-slate-300">
                  College Regular
                  <select
                    required
                    value={student.collegeRegular}
                    onChange={(e) => handleChange('collegeRegular', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select attendance type</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="space-y-3 text-sm text-slate-300">
                  Study Mode
                  <select
                    required
                    value={student.studyMode}
                    onChange={(e) => handleChange('studyMode', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select mode</option>
                    <option value="Online">Online</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </label>
                <label className="space-y-3 text-sm text-slate-300">
                  Preparation Type
                  <select
                    required
                    value={student.preparationType}
                    onChange={(e) => handleChange('preparationType', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select preparation style</option>
                    <option value="Self Study">Self Study</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>
                <label className="space-y-3 text-sm text-slate-300">
                  Daily Study Hours
                  <input
                    required
                    type="number"
                    min="0"
                    value={student.dailyStudyHours}
                    onChange={(e) => handleChange('dailyStudyHours', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                    placeholder="8"
                  />
                </label>
                <label className="space-y-3 text-sm text-slate-300">
                  Attendance Percentage
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={student.collegeAttendancePercent}
                    onChange={(e) => handleChange('collegeAttendancePercent', e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                    placeholder="79"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8 shadow-neon">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                    <path d="M5 4.5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z" />
                    <path d="M8 7.5h8M8 11.5h8M8 15.5h5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Section 3</h2>
                  <p className="text-slate-400">Semester Marks</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => {
                  const key = `sem${index + 1}` as keyof typeof student;
                  return (
                    <label key={key} className="space-y-3 text-sm text-slate-300">
                      {`Sem ${index + 1}`}
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={student[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                        placeholder="80"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8 shadow-neon">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                    <path d="M4 5.5h16M7 9.5h10M5 13.5h14M9 17.5h6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Section 4</h2>
                  <p className="text-slate-400">Mock Test Scores</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {Array.from({ length: 5 }, (_, index) => {
                  const key = `mockTest${index + 1}` as keyof typeof student;
                  return (
                    <label key={key} className="space-y-3 text-sm text-slate-300">
                      {`Mock Test ${index + 1}`}
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={student[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-white outline-none transition focus:border-cyan-400"
                        placeholder="70"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {error ? <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving student...' : 'Predict & Save Student'}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-neon">
              <h2 className="text-lg font-semibold text-white">Live Preview</h2>
              <p className="mt-2 text-slate-400">Review the student summary before final submission.</p>

              <div className="mt-6 space-y-5">
                <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-800">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Student preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">No photo</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Profile</p>
                      <p className="mt-2 text-xl font-semibold text-white">{previewData.name}</p>
                      <p className="text-slate-400">{previewData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Academic snapshot</p>
                  <div className="mt-4 grid gap-3 text-slate-300 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">College</p>
                      <p className="mt-2 text-white">{student.collegeType || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Tier</p>
                      <p className="mt-2 text-white">{student.collegeTier || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Study Mode</p>
                      <p className="mt-2 text-white">{student.studyMode || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Preparation</p>
                      <p className="mt-2 text-white">{student.preparationType || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Quick stats</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Phone</p>
                      <p className="mt-2 text-white">{previewData.phone}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Age / Gender</p>
                      <p className="mt-2 text-white">{previewData.age} · {previewData.gender}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
