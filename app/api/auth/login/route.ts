import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing credentials.' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const teachers = db.collection('teachers');
    const teacher = await teachers.findOne({ email: email.toLowerCase() });

    if (!teacher) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    return NextResponse.json({ email: teacher.email, fullName: teacher.fullName }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Login failed.' }, { status: 500 });
  }
}
