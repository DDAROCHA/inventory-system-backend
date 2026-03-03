import { pool } from '../db';

export interface Course {
  id: number;
  name: string;
}

export const getCourses = async (): Promise<Course[]> => {
  const result = await pool.query('SELECT id, name FROM courses ORDER BY id');
  return result.rows;
};

export const createCourse = async (name: string) => {
  const result = await pool.query('INSERT INTO courses (name) VALUES ($1) RETURNING *', [name]);
  return result.rows[0];
};

export const assignCourseToStudent = async (studentId: number, courseId: number) => {
  const result = await pool.query(
    'INSERT INTO student_courses (student_id, course_id) VALUES ($1, $2) RETURNING *',
    [studentId, courseId]
  );

  return result.rows[0];
};

export const getCoursesByStudent = async (studentId: number) => {
  const result = await pool.query(
    `SELECT c.id, c.name
     FROM courses c
     JOIN student_courses sc ON sc.course_id = c.id
     WHERE sc.student_id = $1`,
    [studentId]
  );

  return result.rows;
};

export const getAllCourses = async () => {
  const result = await pool.query('SELECT id, name FROM courses ORDER BY id');

  return result.rows;
};
