import api from './http';

export async function getMyLessons(phone: string) {
  const { data } = await api.get('/myLessons', { params: { phone } });
  return data.lessons as any[];
}

export async function markLessonDone(phone: string, lessonId: string) {
  await api.post('/markLessonDone', { phone, lessonId });
}

export async function updateProfile(phone: string, payload: { name?: string; email?: string }) {
  await api.put('/editProfile', { phone, ...payload });
}


