import { pool } from '../db';

export interface Student {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface PaginatedStudents {
  students: Student[];
  total: number;
  totalPages: number;
}

export const getStudents = async (page: number, limit: number): Promise<PaginatedStudents> => {
  const offset = (page - 1) * limit;

  const studentsResult = await pool.query(
    `
    SELECT id, name, email, avatar_url
    FROM students
    ORDER BY id
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const countResult = await pool.query(`SELECT COUNT(*) FROM students`);

  const total = Number(countResult.rows[0].count);

  return {
    students: studentsResult.rows,
    total,
    totalPages: Math.ceil(total / limit),
  };
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
