const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendEmail } = require('../utils/email');

router.post('/addStudent', async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required' });
    }

    const normalizedPhone = phone.replace(/\s+/g, '');

    const studentData = {
      name,
      phone: normalizedPhone,
      email,
      role: 'student',
      createdAt: new Date().toISOString(),
      lessons: []
    };

    await db.collection('users').doc(normalizedPhone).set(studentData);

    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-account?email=${encodeURIComponent(email)}`;
    
    const emailHtml = `
      <h2>Welcome to Classroom Management!</h2>
      <p>Hi ${name},</p>
      <p>You have been added as a student. Click the link below to set up your account:</p>
      <p><a href="${setupLink}">Set Up Your Account</a></p>
      <p>You can also log in using your email: ${email}</p>
    `;

    await sendEmail(email, 'Welcome to Classroom Management', emailHtml);

    res.json({ success: true, student: studentData });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

router.post('/assignLesson', async (req, res) => {
  try {
    const { studentPhone, title, description } = req.body;

    if (!studentPhone || !title || !description) {
      return res.status(400).json({ error: 'Student phone, title, and description are required' });
    }

    const normalizedPhone = studentPhone.replace(/\s+/g, '');

    const lessonId = Date.now().toString();
    const lesson = {
      id: lessonId,
      title,
      description,
      status: 'pending',
      assignedAt: new Date().toISOString()
    };

    const studentRef = db.collection('users').doc(normalizedPhone);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const currentLessons = studentDoc.data().lessons || [];
    await studentRef.update({
      lessons: [...currentLessons, lesson]
    });

    res.json({ success: true, lesson });
  } catch (error) {
    console.error('Error assigning lesson:', error);
    res.status(500).json({ error: 'Failed to assign lesson' });
  }
});

router.get('/students', async (req, res) => {
  try {
    const studentsSnapshot = await db.collection('users').where('role', '==', 'student').get();
    
    const students = [];
    studentsSnapshot.forEach(doc => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/student/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const studentDoc = await db.collection('users').doc(phone).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true, student: studentDoc.data() });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

router.put('/editStudent/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const updates = req.body;

    const studentRef = db.collection('users').doc(phone);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await studentRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await studentRef.get();
    res.json({ success: true, student: updatedDoc.data() });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.delete('/student/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const studentDoc = await db.collection('users').doc(phone).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await db.collection('users').doc(phone).delete();

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
