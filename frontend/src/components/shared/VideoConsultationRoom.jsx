import { useEffect, useRef, useState } from 'react';
import Participant from './Participant';
import apiClient from '../../services/apiClient';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

function VideoConsultationRoom({ appointmentId, userName, userRole }) {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef();
  const audioRef = useRef();

  // Join video room
  const joinRoom = async () => {
    try {
      setLoading(true);
      setError('');

      // Get video token from backend
      const tokenResponse = await apiClient.post('/api/consultations/video/token', {
        appointmentId,
        userName,
        userRole,
      });

      if (!tokenResponse.data?.data?.token) {
        throw new Error('Failed to get video token');
      }

      const { token, roomName } = tokenResponse.data.data;

      // Load Twilio SDK if not already loaded
      if (!window.Twilio) {
        const script = document.createElement('script');
        script.src = 'https://media.twiliocdn.com/sdk/js/video/releases/2.28.0/twilio-video.min.js';
        script.async = true;
        script.onload = () => {
          connectToRoom(token, roomName);
        };
        document.body.appendChild(script);
      } else {
        connectToRoom(token, roomName);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join video call');
      setLoading(false);
    }
  };

  const connectToRoom = async (token, roomName) => {
    const Twilio = window.Twilio.Video;

    try {
      const room = await Twilio.connect(token, {
        name: roomName,
        audio: { name: 'microphone' },
        video: { name: 'camera' },
        maxAudioBitrate: 16000,
        dominantSpeaker: true,
      });

      setRoom(room);
      setLoading(false);

      // Handle participants
      const participantMap = new Map(
        Array.from(room.participants.values()).map((participant) => [
          participant.sid,
          participant,
        ])
      );
      setParticipants(Array.from(participantMap.values()));

      room.on('participantConnected', (participant) => {
        setParticipants((prevParticipants) => [...prevParticipants, participant]);
      });

      room.on('participantDisconnected', (participant) => {
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p !== participant)
        );
      });

      // End room on window close
      const handleBeforeUnload = () => room.localParticipant.videoTracks.forEach((trackSubscription) => {
        trackSubscription.track.stop();
      });
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        setRoom(null);
        room.localParticipant.videoTracks.forEach((trackSubscription) => {
          trackSubscription.track.stop();
        });
        room.localParticipant.audioTracks.forEach((trackSubscription) => {
          trackSubscription.track.stop();
        });
        room.disconnect();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } catch (err) {
      setError(err.message || 'Failed to connect to video room');
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach((trackSubscription) => {
        if (isAudioEnabled) {
          trackSubscription.track.disable();
        } else {
          trackSubscription.track.enable();
        }
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((trackSubscription) => {
        if (isVideoEnabled) {
          trackSubscription.track.disable();
        } else {
          trackSubscription.track.enable();
        }
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const leaveRoom = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((trackSubscription) => {
        trackSubscription.track.stop();
      });
      room.localParticipant.audioTracks.forEach((trackSubscription) => {
        trackSubscription.track.stop();
      });
      room.disconnect();
      setRoom(null);
    }
  };

  useEffect(() => {
    joinRoom();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="mb-4 text-white">Joining video call...</p>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="rounded-lg bg-red-900/20 p-6 text-red-500">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Main video grid */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          {room ? (
            <>
              <Participant
                key={room.localParticipant.sid}
                participant={room.localParticipant}
                isLocal={true}
              />
              {participants.map((participant) => (
                <Participant
                  key={participant.sid}
                  participant={participant}
                  isLocal={false}
                />
              ))}
            </>
          ) : null}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 bg-slate-800 py-4">
          <button
            onClick={toggleAudio}
            className={`rounded-full p-4 ${
              isAudioEnabled
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-red-600 hover:bg-red-700'
            } text-white transition`}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`rounded-full p-4 ${
              isVideoEnabled
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-red-600 hover:bg-red-700'
            } text-white transition`}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button
            onClick={leaveRoom}
            className="rounded-full bg-red-600 p-4 text-white hover:bg-red-700 transition"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoConsultationRoom;
