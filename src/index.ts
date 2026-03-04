import express from 'express';
import cors from 'cors';
import { pool } from './db';
import { createStudent, deleteStudent, getStudents, updateStudent } from './models/student';
import {
  getCourses,
  createCourse,
  assignCourseToStudent,
  getCoursesByStudent,
  getAllCourses,
} from './models/courses';
import { getDashboardStats } from './models/dashboard';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from './config/s3';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({ status: 'I am Ilive!' });
});

// Endpoint para probar conexión a la DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
    });
  }
});

// Endpoint para probar mensaje desde la DB
app.get('/message', async (req, res) => {
  try {
    console.log('Attempting to connect to the database...');
    const result = await pool.query("SELECT 'Hello from AWS RDS!' as message");
    res.json({ message: result.rows[0].message });
  } catch {
    res.json({ message: 'DB not connected' });
  }
});

// Endpoint para generar URL de subida a S3
app.get('/students/upload-url', async (req, res) => {
  try {
    const { fileName, fileType } = req.query;

    console.log('Generating S3 URL for:', fileName, fileType);

    const key = `students/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType as string,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ uploadUrl, fileUrl });
  } catch (err) {
    console.error('S3 URL ERROR:', err);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// Endpoint para traer estadísticas del dashboard
app.get('/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint para traer lista de cursos
app.get('/courses', async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses); // 🔥 devolvemos array directo
  } catch (error) {
    console.error('GET COURSES ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint para traer lista de estudiantes
app.get('/students', async (req, res) => {
  try {
    const students = await getStudents();
    res.json({ students });
  } catch (err) {
    console.error('DB QUERY ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Endpoint para crear estudiante
app.post('/students', async (req, res) => {
  try {
    const { name, email, avatar_url } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email required' });
    }

    const newStudent = await createStudent(name, email, avatar_url);

    res.status(201).json({ student: newStudent });
  } catch (err) {
    console.error('CREATE ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Endpoint para eliminar estudiante
app.delete('/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await deleteStudent(id);

    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('DELETE ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Endpoint para actualizar estudiante
app.put('/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    const updated = await updateStudent(id, name, email);

    res.json(updated);
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Endpoint para traer cursos
app.post('/courses', async (req, res) => {
  try {
    const { name } = req.body;
    const course = await createCourse(name);
    res.json(course);
  } catch (err) {
    console.error('CREATE COURSE ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Endpoint para asignar curso a estudiante
app.post('/students/:id/courses', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { courseId } = req.body;

    console.log('BODY:', req.body);

    const result = await assignCourseToStudent(studentId, courseId);

    res.json(result);
  } catch (err) {
    console.error('ASSIGN COURSE ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Endpoint para traer cursos de un estudiante
app.get('/students/:id/courses', async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const courses = await getCoursesByStudent(studentId);

    res.json(courses);
  } catch (err) {
    console.error('GET STUDENT COURSES ERROR:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
