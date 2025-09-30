const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendSMS } = require('../utils/sms');
const { sendEmail } = require('../utils/email');

const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/createAccessCode', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const accessCode = generateAccessCode();
    
    await db.collection('accessCodes').doc(phoneNumber).set({
      code: accessCode,
      createdAt: new Date().toISOString()
    });

    await sendSMS(phoneNumber, `Your access code is: ${accessCode}`);

    res.json({ success: true, message: 'Access code sent' });
  } catch (error) {
    console.error('Error creating access code:', error);
    res.status(500).json({ error: 'Failed to create access code' });
  }
});

router.post('/validateAccessCode', async (req, res) => {
  try {
    const { phoneNumber, accessCode } = req.body;

    if (!phoneNumber || !accessCode) {
      return res.status(400).json({ error: 'Phone number and access code are required' });
    }

    const codeDoc = await db.collection('accessCodes').doc(phoneNumber).get();
    
    if (!codeDoc.exists) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    const storedCode = codeDoc.data().code;
    
    if (storedCode !== accessCode) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    await db.collection('accessCodes').doc(phoneNumber).delete();

    const userDoc = await db.collection('users').doc(phoneNumber).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return res.json({ 
        success: true, 
        userType: userData.role,
        user: userData
      });
    }

    await db.collection('users').doc(phoneNumber).set({
      phone: phoneNumber,
      role: 'instructor',
      createdAt: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      userType: 'instructor',
      user: {
        phone: phoneNumber,
        role: 'instructor'
      }
    });
  } catch (error) {
    console.error('Error validating access code:', error);
    res.status(500).json({ error: 'Failed to validate access code' });
  }
});

router.post('/loginEmail', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const accessCode = generateAccessCode();

    await db.collection('emailAccessCodes').doc(email).set({
      code: accessCode,
      createdAt: new Date().toISOString()
    });

    const emailHtml = `
      <h2>Your Access Code</h2>
      <p>Your 6-digit access code is: <strong>${accessCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    await sendEmail(email, 'Your Classroom Access Code', emailHtml);

    res.json({ success: true, message: 'Access code sent to email' });
  } catch (error) {
    console.error('Error sending email code:', error);
    res.status(500).json({ error: 'Failed to send access code' });
  }
});

router.post('/validateEmailAccessCode', async (req, res) => {
  try {
    const { email, accessCode } = req.body;

    if (!email || !accessCode) {
      return res.status(400).json({ error: 'Email and access code are required' });
    }

    const codeDoc = await db.collection('emailAccessCodes').doc(email).get();
    
    if (!codeDoc.exists) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    const storedCode = codeDoc.data().code;
    
    if (storedCode !== accessCode) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    await db.collection('emailAccessCodes').doc(email).delete();

    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    res.json({ 
      success: true,
      userType: userData.role,
      user: userData
    });
  } catch (error) {
    console.error('Error validating email code:', error);
    res.status(500).json({ error: 'Failed to validate access code' });
  }
});

router.get('/getInstructor', async (req, res) => {
  try {
    const instructorsSnapshot = await db.collection('users').where('role', '==', 'instructor').limit(1).get();
    
    if (instructorsSnapshot.empty) {
      return res.status(404).json({ error: 'No instructor found' });
    }

    const instructor = instructorsSnapshot.docs[0].data();
    res.json({ success: true, instructor });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ error: 'Failed to fetch instructor' });
  }
});

router.post('/setupAccount', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'Student account not found. Please contact your instructor.' });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.accountActivated) {
      return res.status(400).json({ error: 'Account already activated. Please login.' });
    }

    await db.collection('users').doc(userDoc.id).update({
      name: name,
      password: password,
      accountActivated: true,
      updatedAt: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Account setup completed successfully' 
    });
  } catch (error) {
    console.error('Error setting up account:', error);
    res.status(500).json({ error: 'Failed to setup account' });
  }
});

module.exports = router;
