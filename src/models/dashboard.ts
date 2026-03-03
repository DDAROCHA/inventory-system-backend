import { pool } from '../db';

export const getDashboardStats = async () => {
  const totalStudents = await pool.query('SELECT COUNT(*) FROM students');

  const totalCourses = await pool.query('SELECT COUNT(*) FROM courses');

  const totalEnrollments = await pool.query('SELECT COUNT(*) FROM student_courses');

  return {
    totalStudents: Number(totalStudents.rows[0].count),
    totalCourses: Number(totalCourses.rows[0].count),
    totalEnrollments: Number(totalEnrollments.rows[0].count),
  };
};
