import { pool } from '../db';

export interface Student {
  id: number;
  name: string;
  email: string;
}

export const getStudents = async (): Promise<Student[]> => {
  const result = await pool.query('SELECT id, name, email, avatar_url FROM students');
  return result.rows;
};

export const createStudent = async (name: string, email: string, avatarUrl?: string) => {
  const result = await pool.query(
    `INSERT INTO students (name, email, avatar_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, email, avatarUrl || null]
  );

  return result.rows[0];
};

export const deleteStudent = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM students WHERE id = $1', [id]);
};

export const updateStudent = async (id: number, name: string, email: string) => {
  const result = await pool.query(
    'UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [name, email, id]
  );

  return result.rows[0];
};
