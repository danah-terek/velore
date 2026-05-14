import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './components/ChatWindow';
import { useAiAdvisor } from './hooks/useAiAdvisor';

const orbStyles = `
  @keyframes orbBreathe {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.06); }
  }
  @keyframes orbRing1 {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes orbRing2 {
    0%   { transform: scale(1);   opacity: 0.4; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes orbRing3 {
    0%   { transform: scale(1);   opacity: 0.25; }
    100% { transform: scale(2.9); opacity: 0; }
  }
  .orb-breathe  { animation: orbBreathe 3s ease-in-out infinite; }
  .orb-ring-1   { animation: orbRing1 2.2s ease-out infinite; }
  .orb-ring-2   { animation: orbRing2 2.2s ease-out infinite 0.55s; }
  .orb-ring-3   { animation: orbRing3 2.2s ease-out infinite 1.1s; }
`;

const AIAdvisorChat = ({ onProductClick, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  
  const {
    step,
    messages,
    isLoading,
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
  } = useAiAdvisor();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('orb-styles')) {
      const tag = document.createElement('style');
      tag.id = 'orb-styles';
      tag.textContent = orbStyles;
      document.head.appendChild(tag);
    }
    startAnalysis();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleViewProduct = (productId) => {
    if (onProductClick) {
      onProductClick(productId);
    } else {
      window.location.href = `/product/${productId}`;
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all md:hidden"
          onClick={toggleChat}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {showTooltip && !isOpen && (
          <div className="relative animate-slide-in-right">
            <div className="bg-white text-gray-800 text-sm font-medium pl-4 pr-3 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-blue-600">AI Style Advisor</p>
                <p className="text-gray-500 text-xs mt-0.5">Find your perfect frames</p>
              </div>
              <button 
                onClick={() => setShowTooltip(false)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border border-gray-100 rotate-45 border-t-0 border-l-0" />
          </div>
        )}

        <button
          onClick={toggleChat}
          className="group relative w-20 h-20 flex items-center justify-center"
          aria-label="Open AI Style Advisor"
        >
          {!isOpen && (
            <>
              <span className="orb-ring-1" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(129,140,248,0.7)', transformOrigin: 'center' }} />
              <span className="orb-ring-2" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(129,140,248,0.5)', transformOrigin: 'center' }} />
              <span className="orb-ring-3" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(129,140,248,0.3)', transformOrigin: 'center' }} />
            </>
          )}

          <div
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${!isOpen ? 'orb-breathe' : ''}`}
            style={{
              background: isOpen
                ? 'linear-gradient(145deg, #312e81, #4338ca, #6366f1)'
                : 'linear-gradient(145deg, #1e1b4b, #312e81, #4338ca)',
              border: '1.5px solid rgba(165,180,252,0.35)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
              transform: isOpen ? 'scale(0.9)' : undefined,
            }}
          >
            <span style={{ fontSize: '24px', lineHeight: 1 }}>
              {isOpen ? '✕' : '✨'}
            </span>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col ring-1 ring-black/5 ${className}`}
               style={{ height: '580px', width: '400px', maxHeight: '75vh' }}>
            <ChatWindow
              messages={messages}
              step={step}
              isLoading={isLoading}
              videoRef={videoRef}
              fileInputRef={fileInputRef}
              onUpload={openFilePicker}
              onCamera={startCamera}
              onTextSend={handleTextSend}
              onTakePhoto={takePhoto}
              onCancelCamera={stopCamera}
              onFileSelect={handleFileSelect}
              onViewProduct={handleViewProduct}
              onStartOver={reset}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AIAdvisorChat;