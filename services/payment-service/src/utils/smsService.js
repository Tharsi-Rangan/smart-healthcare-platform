import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not found. SMS and WhatsApp notifications will be mocked.');
}

export const sendSMS = async ({ to, body }) => {
  try {
    if (!client || !twilioPhoneNumber) {
      console.log(`[MOCK SMS] To: ${to} | Body: ${body}`);
      return;
    }
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`SMS sent to ${to}, SID: ${message.sid}`);
  } catch (error) {
    console.error('SMS send error:', error.message);
  }
};

export const sendWhatsApp = async ({ to, body }) => {
  try {
    if (!client || !twilioWhatsAppNumber) {
      console.log(`[MOCK WhatsApp] To: whatsapp:${to} | Body: ${body}`);
      return;
    }
    // WhatsApp numbers need to be prefixed with 'whatsapp:'
    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
    const message = await client.messages.create({
      body,
      from: twilioWhatsAppNumber,
      to: toWhatsApp,
    });
    console.log(`WhatsApp message sent to ${toWhatsApp}, SID: ${message.sid}`);
  } catch (error) {
    console.error('WhatsApp send error:', error.message);
  }
};
