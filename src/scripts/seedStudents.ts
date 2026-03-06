//Script para poblar la base de datos con estudiantes y cursos de ejemplo
//Ejecutar con: npx ts-node src/scripts/seedStudents.ts

import { faker } from '@faker-js/faker';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { s3 } from '../config/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

async function uploadPhoto() {
  const gender = Math.random() > 0.5 ? 'men' : 'women';
  const id = Math.floor(Math.random() * 90);

  const imageUrl = `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;

  const image = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
  });

  const key = `students/${uuidv4()}.jpg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: image.data,
      ContentType: 'image/jpeg',
    })
  );

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

async function createCourses() {
  const courses = [];

  for (let i = 0; i < 18; i++) {
    const name = faker.company.buzzPhrase().slice(0, 25);

    const result = await pool.query(
      `INSERT INTO courses (name)
       VALUES ($1)
       RETURNING id`,
      [name]
    );

    courses.push(result.rows[0].id);
  }

  return courses;
}

async function createStudent(courseIds: string | any[]) {
  const name = faker.person.fullName();
  const email = faker.internet.email();

  const photo = await uploadPhoto();

  const student = await pool.query(
    `INSERT INTO students (name,email,avatar_url)
     VALUES ($1,$2,$3)
     RETURNING id`,
    [name, email, photo]
  );

  const studentId = student.rows[0].id;

  const courseCount = faker.number.int({ min: 1, max: 5 });

  for (let i = 0; i < courseCount; i++) {
    const courseId = courseIds[Math.floor(Math.random() * courseIds.length)];

    await pool.query(
      `INSERT INTO student_courses (student_id,course_id)
       VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [studentId, courseId]
    );
  }
}

async function seed() {
  console.log('Creating courses...');

  const courseIds = await createCourses();

  console.log('Creating students...');

  const jobs = [];

  for (let i = 0; i < 53; i++) {
    jobs.push(createStudent(courseIds));
  }

  await Promise.all(jobs);

  console.log('SEED COMPLETE');
}

seed();
