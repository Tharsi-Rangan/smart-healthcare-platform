import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_API_KEY || !TWILIO_API_SECRET) {
  console.warn('⚠️ Twilio credentials not fully configured. Video consultations may not work.');
}

const twilio_client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const generateVideoToken = (roomName, userName, userId) => {
  try {
    const { AccessToken } = twilio.jwt;
    const { VideoGrant } = AccessToken;

    const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET);
    
    token.identity = userId;
    token.addGrant(new VideoGrant({ room: roomName }));

    return token.toJwt();
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    throw new Error('Failed to generate video access token');
  }
};

export const getTwilioClient = () => twilio_client;

export const createVideoRoom = async (roomName, maxParticipants = 2) => {
  try {
    const room = await twilio_client.video.rooms.create({
      uniqueName: roomName,
      type: 'peer',
      maxParticipants: maxParticipants,
      recordParticipantsOnConnect: true,
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL || 'https://example.com/status-callback',
    });
    return room;
  } catch (error) {
    console.error('Error creating Twilio room:', error);
    throw error;
  }
};

export const endVideoRoom = async (roomName) => {
  try {
    const room = await twilio_client.video.rooms(roomName).update({ status: 'completed' });
    return room;
  } catch (error) {
    console.error('Error ending Twilio room:', error);
    throw error;
  }
};

export const getRecordings = async (roomName) => {
  try {
    const recordings = await twilio_client.video
      .rooms(roomName)
      .recordings
      .list();
    return recordings;
  } catch (error) {
    console.error('Error fetching recordings:', error);
    throw error;
  }
};

export default {
  generateVideoToken,
  getTwilioClient,
  createVideoRoom,
  endVideoRoom,
  getRecordings,
};
