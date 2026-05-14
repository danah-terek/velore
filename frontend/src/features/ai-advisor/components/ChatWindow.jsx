import React from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CameraCapture from './CameraCapture';
import { STEPS } from '../hooks/useAiAdvisor';

const ChatWindow = ({
  messages,
  step,
  isLoading,
  recommendations,
  videoRef,
  fileInputRef,
  onUpload,
  onCamera,
  onTextSend,
  onTakePhoto,
  onCancelCamera,
  onFileSelect,
  onViewProduct,
  onStartOver,
  messagesEndRef,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">AI Style Advisor</h3>
              <p className="text-xs text-gray-500">
                {isLoading ? 'Analyzing...' : 'Ready to help'}
              </p>
            </div>
          </div>
          
          {messages.length > 1 && (
            <button
              onClick={onStartOver}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50">
        {step === STEPS.CAMERA && (
          <div className="mb-4">
            <CameraCapture
              videoRef={videoRef}
              onCapture={onTakePhoto}
              onCancel={onCancelCamera}
            />
          </div>
        )}

        {messages.length === 0 && step === STEPS.IDLE && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-gray-700 font-medium mb-2">Find Your Perfect Frames</h4>
            <p className="text-gray-500 text-sm max-w-xs">
              Upload a selfie or take a photo to get AI-powered frame recommendations based on your face shape.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {step !== STEPS.CAMERA && (
        <ChatInput
          onUpload={onUpload}
          onCamera={onCamera}
          onTextSend={onTextSend}
          isLoading={isLoading}
          disabled={step === STEPS.UPLOADING}
        />
      )}
    </div>
  );
};

export default ChatWindow;