import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields = [
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
      'photoUrl',
      'predictedScore',
    ] as const;

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json({ message: `Field ${field} is required.` }, { status: 400 });
      }
    }

    const db = await connectToDatabase();
    const students = db.collection('students');
    const result = await students.insertOne({
      createdAt: new Date(),
      ...body,
    });

    return NextResponse.json({ message: 'Student created successfully.', studentId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Unable to save student.' }, { status: 500 });
  }
}
