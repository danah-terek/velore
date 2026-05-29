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
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
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
      setIsOpen(false);
    } else {
      setShowTooltip(false);
      
      // If privacy not accepted, show notice first
      if (!privacyAccepted) {
        setShowPrivacyNotice(true);
      } else {
        setIsOpen(true);
        startAnalysis();
      }
    }
  };

  const handleAcceptPrivacy = () => {
    setPrivacyAccepted(true);
    setShowPrivacyNotice(false);
    setIsOpen(true);
    startAnalysis();
  };

  const handleDeclinePrivacy = () => {
    setShowPrivacyNotice(false);
    setShowTooltip(true);
  };

  return (
    <>
      {/* Privacy Notice Modal */}
      {showPrivacyNotice && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-all"
            onClick={handleDeclinePrivacy}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#76CDD6]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#76CDD6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-light tracking-tight text-[#1E1D22]">Your Privacy Matters</h3>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-stone-600">Your photos are analyzed in real-time and <span className="font-semibold text-stone-800">never stored</span> on our servers.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-stone-600">Camera access is used only for virtual try-on and <span className="font-semibold text-stone-800">ends when you close</span> the advisor.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-stone-600">Face shape analysis happens on-device — <span className="font-semibold text-stone-800">no biometric data leaves</span> your device.</p>
                  </div>
                </div>
                
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    <span className="font-semibold text-stone-700">🔒 Velore protects your privacy:</span> We never save your photos, facial data, or camera feed. All analysis is temporary and deleted after your session ends.
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-stone-100 flex gap-3">
                <button
                  onClick={handleAcceptPrivacy}
                  className="flex-1 px-4 py-2.5 bg-[#1E1D22] text-white text-sm font-medium rounded-full hover:bg-stone-700 transition-all duration-300"
                >
                  Got it, continue
                </button>
                <button
                  onClick={handleDeclinePrivacy}
                  className="px-4 py-2.5 bg-stone-100 text-stone-600 text-sm font-medium rounded-full hover:bg-stone-200 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all md:hidden"
          onClick={toggleChat}
        />
      )}

      {/* Floating Button & Tooltip */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {showTooltip && !isOpen && !showPrivacyNotice && (
          <div className="relative animate-slide-in-right">
            <div className="bg-white text-gray-800 text-sm font-medium pl-4 pr-3 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-[#76CDD6]">AI Style Advisor</p>
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
          {!isOpen && !showPrivacyNotice && (
            <>
              <span className="orb-ring-1" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(118,205,214,0.6)', transformOrigin: 'center' }} />
              <span className="orb-ring-2" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(118,205,214,0.4)', transformOrigin: 'center' }} />
              <span className="orb-ring-3" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(118,205,214,0.2)', transformOrigin: 'center' }} />
            </>
          )}

          <div
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${!isOpen && !showPrivacyNotice ? 'orb-breathe' : ''}`}
            style={{
              background: isOpen || showPrivacyNotice
                ? '#1E1D22'
                : 'linear-gradient(145deg, #1E1D22, #2D2D35, #3D3D45)',
              border: isOpen || showPrivacyNotice ? 'none' : '1.5px solid rgba(118,205,214,0.4)',
              boxShadow: isOpen || showPrivacyNotice
                ? '0 4px 20px rgba(0,0,0,0.15)'
                : '0 4px 24px rgba(118,205,214,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              transform: isOpen || showPrivacyNotice ? 'scale(0.9)' : undefined,
            }}
          >
            {isOpen || showPrivacyNotice ? (
              <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col ${className}`}
               style={{ height: '580px', width: '400px', maxHeight: '75vh' }}>
            {/* Custom header for chat window - matches brand */}
            <div className="px-5 py-4 border-b border-stone-100 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-block w-5 h-px bg-[#76CDD6]" />
                    <span className="text-[9px] font-medium text-stone-400 uppercase tracking-[0.2em]">AI Stylist</span>
                  </div>
                  <h3 className="text-sm font-light tracking-tight text-[#1E1D22]">Style Advisor</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#76CDD6]/10 flex items-center justify-center">
                  <span className="text-[10px]">✨</span>
                </div>
              </div>
            </div>
            
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