require('dotenv').config();

const sendSMS = async (phoneNumber, message) => {
  console.log(` ${phoneNumber}: ${message}`);
  return { success: true, message: 'SMS logged to console' };
};

module.exports = { sendSMS };
