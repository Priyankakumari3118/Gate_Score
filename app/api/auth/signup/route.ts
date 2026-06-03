import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body;

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const teachers = db.collection('teachers');
    const existingTeacher = await teachers.findOne({ email: email.toLowerCase() });

    if (existingTeacher) {
      return NextResponse.json({ message: 'Email is already registered.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await teachers.insertOne({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Teacher account created.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating account.' }, { status: 500 });
  }
}
