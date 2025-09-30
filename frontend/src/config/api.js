import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authAPI = {
  createAccessCode: (phoneNumber) => api.post('/auth/createAccessCode', { phoneNumber }),
  validateAccessCode: (phoneNumber, accessCode) => api.post('/auth/validateAccessCode', { phoneNumber, accessCode }),
  loginEmail: (email) => api.post('/auth/loginEmail', { email }),
  validateEmailAccessCode: (email, accessCode) => api.post('/auth/validateEmailAccessCode', { email, accessCode }),
  getInstructor: () => api.get('/auth/getInstructor')
};

export const instructorAPI = {
  addStudent: (data) => api.post('/instructor/addStudent', data),
  assignLesson: (data) => api.post('/instructor/assignLesson', data),
  getStudents: () => api.get('/instructor/students'),
  getStudent: (phone) => api.get(`/instructor/student/${phone}`),
  editStudent: (phone, data) => api.put(`/instructor/editStudent/${phone}`, data),
  deleteStudent: (phone) => api.delete(`/instructor/student/${phone}`)
};

export const studentAPI = {
  getMyLessons: (phone) => api.get(`/student/myLessons?phone=${phone}`),
  markLessonDone: (phone, lessonId) => api.post('/student/markLessonDone', { phone, lessonId }),
  editProfile: (data) => api.put('/student/editProfile', data)
};
