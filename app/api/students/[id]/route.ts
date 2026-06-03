import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

function getObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const objectId = getObjectId(id);
  if (!objectId) {
    return NextResponse.json({ message: 'Invalid student ID.' }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const students = db.collection('students');
    const student = await students.findOne({ _id: objectId });

    if (!student) {
      return NextResponse.json({ message: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json({ student: { ...student, _id: student._id.toString() } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Unable to fetch student.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const objectId = getObjectId(id);
  if (!objectId) {
    return NextResponse.json({ message: 'Invalid student ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid update payload.' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const students = db.collection('students');
    const updateResult = await students.updateOne(
      { _id: objectId },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student updated successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Unable to update student.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const objectId = getObjectId(id);
  if (!objectId) {
    return NextResponse.json({ message: 'Invalid student ID.' }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const students = db.collection('students');
    const deleteResult = await students.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ message: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student deleted successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Unable to delete student.' }, { status: 500 });
  }
}
