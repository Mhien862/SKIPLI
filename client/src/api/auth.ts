import api from './http';

export async function requestSmsCode(phoneNumber: string) {
  await api.post('/createAccessCode', { phoneNumber });
}

export async function verifySmsCode(phoneNumber: string, accessCode: string) {
  const { data } = await api.post('/validateAccessCode', { phoneNumber, accessCode });
  return data as { success: boolean; role: 'instructor' | 'student'; token: string };
}

export async function requestEmailCode(email: string) {
  await api.post('/student/loginEmail', { email });
}

export async function verifyEmailCode(email: string, accessCode: string) {
  const { data } = await api.post('/student/validateAccessCode', { email, accessCode });
  return data as { success: boolean; token: string };
}

export async function passwordLogin(username: string, password: string) {
  const { data } = await api.post('/loginPassword', { username, password });
  return data as { success: boolean; token: string; role: 'instructor' | 'student' };
}


