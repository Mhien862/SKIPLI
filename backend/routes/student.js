const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.get('/myLessons', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const normalizedPhone = phone.replace(/\s+/g, '');

    const studentDoc = await db.collection('users').doc(normalizedPhone).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const lessons = studentDoc.data().lessons || [];
    res.json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.post('/markLessonDone', async (req, res) => {
  try {
    const { phone, lessonId } = req.body;

    if (!phone || !lessonId) {
      return res.status(400).json({ error: 'Phone and lessonId are required' });
    }

    const normalizedPhone = phone.replace(/\s+/g, '');

    const studentRef = db.collection('users').doc(normalizedPhone);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const lessons = studentDoc.data().lessons || [];
    const updatedLessons = lessons.map(lesson => {
      if (lesson.id === lessonId) {
        return { ...lesson, status: 'completed', completedAt: new Date().toISOString() };
      }
      return lesson;
    });

    await studentRef.update({ lessons: updatedLessons });

    res.json({ success: true, lessons: updatedLessons });
  } catch (error) {
    console.error('Error marking lesson done:', error);
    res.status(500).json({ error: 'Failed to mark lesson done' });
  }
});

router.put('/editProfile', async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const normalizedPhone = phone.replace(/\s+/g, '');

    const studentRef = db.collection('users').doc(normalizedPhone);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    updates.updatedAt = new Date().toISOString();

    await studentRef.update(updates);

    const updatedDoc = await studentRef.get();
    res.json({ success: true, user: updatedDoc.data() });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
