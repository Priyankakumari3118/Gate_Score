import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const students = db.collection('students');
    const studentList = await students
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const formattedStudents = studentList.map((student) => ({
      ...student,
      _id: student._id.toString(),
    }));

    return NextResponse.json({ students: formattedStudents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Unable to fetch students.' }, { status: 500 });
  }
}
