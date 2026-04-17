import { useState, useEffect, useRef } from 'react';

function Participant({ participant, isLocal }) {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const videoRef = useRef();
  const audioRef = useRef();
  const videoSubscription = useRef();
  const audioSubscription = useRef();

  const videoTrack = videoTracks[0];
  const audioTrack = audioTracks[0];

  useEffect(() => {
    setVideoTracks(Array.from(participant.videoTracks.values()));
    setAudioTracks(Array.from(participant.audioTracks.values()));

    const videoSubscription = participant.on('trackSubscribed', (track) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      }
    });

    const unsubscribeFromVideo = participant.on('trackUnsubscribed', (track) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      }
    });

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      videoSubscription.unsubscribe();
      unsubscribeFromVideo.unsubscribe();
    };
  }, [participant]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div className="relative h-full w-full bg-slate-800 rounded-lg overflow-hidden">
      <video
        autoPlay={true}
        muted={isLocal}
        ref={videoRef}
        className="h-full w-full object-cover"
      />
      <audio autoPlay={true} muted={false} ref={audioRef} />
      
      {isLocal && (
        <div className="absolute bottom-2 right-2 rounded bg-slate-900/80 px-3 py-1 text-sm text-white">
          You (Local)
        </div>
      )}
    </div>
  );
}

export default Participant;
