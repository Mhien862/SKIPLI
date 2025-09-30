import api from './http';

export async function addStudent(name: string, phone: string, email: string) {
  await api.post('/addStudent', { name, phone, email });
}

export async function assignLesson(studentPhone: string, title: string, description: string) {
  await api.post('/assignLesson', { studentPhone, title, description });
}

export async function fetchStudents() {
  const { data } = await api.get('/students');
  return data.students as Array<any>;
}

export async function fetchStudent(phone: string) {
  const { data } = await api.get(`/student/${encodeURIComponent(phone)}`);
  return data as { profile: any; lessons: any[] };
}

export async function updateStudent(phone: string, payload: { name?: string; email?: string }) {
  await api.put(`/editStudent/${encodeURIComponent(phone)}`, payload);
}

export async function deleteStudent(phone: string) {
  await api.delete(`/student/${encodeURIComponent(phone)}`);
}


