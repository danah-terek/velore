import { useState, useCallback, useRef } from 'react';
import { aiAdvisorService } from '../services/aiAdvisorService';

export const STEPS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  RESULT: 'result',
  ERROR: 'error',
  CAMERA: 'camera',
};

function getShapeDescription(shape) {
  const descriptions = {
    Round: 'add definition with angular styles',
    Oval: 'work with almost any frame style',
    Square: 'soften your features with round frames',
    Heart: 'balance your features with bottom-heavy frames',
    Rectangle: 'add width with taller or wider frames',
  };
  return descriptions[shape] || 'complement your features';
}

export function useAiAdvisor() {
  const [step, setStep] = useState(STEPS.IDLE);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...message,
    }]);
  }, []);

  const startAnalysis = useCallback(() => {
    setStep(STEPS.IDLE);
    setAnalysis(null);
    setRecommendations([]);
    setError(null);
    setMessages([]);
    addMessage({
      type: 'system',
      text: "👋 Hi! I'm your AI style advisor. Upload a selfie or take a photo, and I'll analyze your face shape to recommend the perfect frames for you.",
    });
  }, [addMessage]);

  const processImage = useCallback(async (file) => {
    setIsLoading(true);
    setStep(STEPS.UPLOADING);
    setError(null);

    addMessage({
      type: 'system',
      text: '🔍 Analyzing your face shape...',
      isLoading: true,
    });

    try {
      const result = await aiAdvisorService.analyzeFace(file);
      
      setAnalysis(result.analysis);
      setRecommendations(result.recommendations || []);
      
      setMessages(prev => prev.filter(m => !m.isLoading));

      const { face_shape, confidence } = result.analysis;
      
      addMessage({
        type: 'system',
        text: `✅ Analysis complete! Your face shape is **${face_shape}** (${confidence}% confidence).`,
        analysis: result.analysis,
      });

      if (result.recommendations && result.recommendations.length > 0) {
        addMessage({
          type: 'system',
          text: `Here are ${result.recommendations.length} frames that will perfectly complement your ${face_shape.toLowerCase()} face:`,
          recommendations: result.recommendations,
        });
      }

      if (result.analysis.warnings && result.analysis.warnings.length > 0) {
        addMessage({
          type: 'system',
          text: `⚠️ ${result.analysis.warnings[0]}`,
        });
      }

      setStep(STEPS.RESULT);
    } catch (err) {
      setMessages(prev => prev.filter(m => !m.isLoading));
      
      const errorMessage = err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      setStep(STEPS.ERROR);
      
      addMessage({
        type: 'system',
        text: `❌ ${errorMessage}`,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      addMessage({
        type: 'system',
        text: '🔒 Creating an account unlocks your personal AI style analysis!',
      });
      addMessage({
        type: 'system',
        text: 'Get face shape detection, personalized frame recommendations, and save your style profile.',
        signupPrompt: true,
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      addMessage({
        type: 'system',
        text: '❌ Sorry, this file type is not supported. Please upload a JPG, PNG, or WebP image.',
        isError: true,
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addMessage({
        type: 'system',
        text: '❌ Image is too large. Maximum size is 10MB.',
        isError: true,
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    addMessage({
      type: 'user',
      text: 'Here is my photo. What frames would suit me?',
      image: previewUrl,
    });

    await processImage(file);
  }, [addMessage, processImage]);

  const handleCameraCapture = useCallback(async (imageBlob) => {
    const token = localStorage.getItem('token');
    if (!token) {
      addMessage({
        type: 'system',
        text: '🔒 Creating an account unlocks your personal AI style analysis!',
      });
      addMessage({
        type: 'system',
        text: 'Get face shape detection, personalized frame recommendations, and save your style profile.',
        signupPrompt: true,
      });
      return;
    }

    const file = new File([imageBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    addMessage({
      type: 'user',
      text: "Here's my photo from camera.",
      image: previewUrl,
    });

    await processImage(file);
  }, [addMessage, processImage]);

  const handleShapeQuery = useCallback(async (shape) => {
    setIsLoading(true);
    try {
      const recommendations = await aiAdvisorService.getRecommendationsByShape(shape);
      setRecommendations(recommendations);
      addMessage({
        type: 'system',
        text: `For a **${shape}** face shape, I recommend frames that ${getShapeDescription(shape)}. Here are some options:`,
        recommendations: recommendations,
      });
    } catch (err) {
      addMessage({
        type: 'system',
        text: '❌ Could not fetch recommendations. Please try again.',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const handleTextSend = useCallback((text) => {
    addMessage({
      type: 'user',
      text: text,
    });

    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('round') || lowerText.includes('circle')) {
      handleShapeQuery('Round');
    } else if (lowerText.includes('oval')) {
      handleShapeQuery('Oval');
    } else if (lowerText.includes('square')) {
      handleShapeQuery('Square');
    } else if (lowerText.includes('heart')) {
      handleShapeQuery('Heart');
    } else if (lowerText.includes('rectangle') || lowerText.includes('long')) {
      handleShapeQuery('Rectangle');
    } else {
      addMessage({
        type: 'system',
        text: "I can help you find frames based on your face shape! Upload a selfie for the most accurate results, or tell me your face shape (Round, Oval, Square, Heart, Rectangle).",
      });
    }
  }, [addMessage, handleShapeQuery]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setStep(STEPS.CAMERA);
      return stream;
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      setStep(STEPS.ERROR);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStep(STEPS.IDLE);
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      handleCameraCapture(blob);
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [handleCameraCapture, stopCamera]);

  const reset = useCallback(() => {
    setStep(STEPS.IDLE);
    setAnalysis(null);
    setRecommendations([]);
    setError(null);
    setPreviewImage(null);
    setMessages([]);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setTimeout(() => {
      addMessage({
        type: 'system',
        text: "👋 Hi! I'm your AI style advisor. Upload a selfie or take a photo, and I'll analyze your face shape to recommend the perfect frames for you.",
      });
    }, 50);
  }, [addMessage]);

  return {
    step,
    analysis,
    recommendations,
    error,
    isLoading,
    previewImage,
    messages,
    videoRef,
    fileInputRef,
    startAnalysis,
    handleFileSelect,
    handleTextSend,
    openFilePicker,
    startCamera,
    stopCamera,
    takePhoto,
    reset,
  };
}