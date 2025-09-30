require('dotenv').config();

const sendSMS = async (phoneNumber, message) => {
  // Always log SMS to console (don't send real SMS)
  console.log(`[SMS LOG] SMS to ${phoneNumber}: ${message}`);
  return { success: true, message: 'SMS logged to console' };

  // Uncomment below to enable real SMS via Twilio
  /*
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS - No Twilio] SMS to ${phoneNumber}: ${message}`);
    return { success: true, message: 'SMS logged (no provider configured)' };
  }

  const provider = process.env.SMS_PROVIDER || 'twilio';

  if (provider === 'twilio') {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      return { success: true, message: 'SMS sent via Twilio' };
    } catch (error) {
      console.error('Twilio error:', error);
      throw error;
    }
  }

  if (provider === 'sms.to') {
    const axios = require('axios');
    try {
      await axios.post('https://api.sms.to/sms/send', {
        message: message,
        to: phoneNumber,
        sender_id: process.env.SMS_TO_SENDER_ID || 'Classroom'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.SMS_TO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, message: 'SMS sent via SMS.to' };
    } catch (error) {
      console.error('SMS.to error:', error);
      throw error;
    }
  }

  throw new Error('Invalid SMS provider');
  */
};

module.exports = { sendSMS };
