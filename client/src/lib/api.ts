// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function fetchStudentResults(studentId: string) {
  const res = await fetch(`${BASE_URL}/users/${studentId}/results`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch student results');
  return res.json();
}
