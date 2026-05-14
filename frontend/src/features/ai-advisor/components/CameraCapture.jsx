import React, { useEffect, useRef, useState } from 'react';

const CameraCapture = ({ videoRef, onCapture, onCancel }) => {
  const [streamReady, setStreamReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        const video = videoRef?.current || localVideoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            setStreamReady(true);
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        onCancel?.();
      }
    };

    startStream();

    return () => {
      const video = videoRef?.current || localVideoRef.current;
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (countdown !== null) return;
    
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(timer);
        setCountdown(null);
        onCapture?.();
      } else {
        setCountdown(count);
      }
    }, 800);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden">
        <video
          ref={videoRef || localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 sm:w-56 sm:h-72 border-2 border-white/50 rounded-full flex items-center justify-center">
            <div className="w-40 h-56 sm:w-48 sm:h-64 border border-dashed border-white/30 rounded-full" />
          </div>
        </div>

        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-7xl font-bold text-white">{countdown}</span>
          </div>
        )}

        {streamReady && !countdown && (
          <div className="absolute top-4 left-0 right-0 text-center">
            <p className="text-white/80 text-sm">Center your face in the oval</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCapture}
          disabled={!streamReady || countdown !== null}
          className="w-14 h-14 rounded-full bg-white border-4 border-blue-600 hover:border-blue-700 disabled:border-gray-300 transition-all flex items-center justify-center shadow-lg"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;