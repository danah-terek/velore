import React from 'react';
import { Link } from 'react-router-dom';

const ChatMessage = ({ message }) => {
  const { type, text, image, isLoading, isError, analysis, recommendations, signupPrompt } = message;

  const isUser = type === 'user';

  const handleProductClick = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'order-1' : 'order-1'}`}>
        
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm
            ${isUser 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : isError 
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }
          `}
        >
          {image && (
            <img
              src={image}
              alt="Uploaded"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mb-2"
            />
          )}

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-gray-500">{text}</span>
            </div>
          )}

          {!isLoading && text && (
            <p className="whitespace-pre-wrap">
              {text.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          )}

          {signupPrompt && (
            <a
              href="/signup"
              className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <span>✨</span>
              Create Free Account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          )}

          {analysis?.all_scores && (
            <div className="mt-3 space-y-1.5">
              {Object.entries(analysis.all_scores)
                .sort((a, b) => b[1] - a[1]).slice(0, 2)
                .map(([shape, score]) => (
                  <div key={shape} className="flex items-center gap-2">
                    <span className="text-xs w-20 text-right">{shape}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score > 50 ? 'bg-green-500' : score > 20 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs w-10">{score}%</span>
                  </div>
              ))}
            </div>
          )}
        </div>

        <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        {recommendations && recommendations.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {recommendations.slice(0, 4).map((rec) => (
              <Link
                to={`/product/${rec.product_id}`}
                key={rec.product_id}
                className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer no-underline"
              >
                {rec.image && (
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-full h-24 object-cover rounded-md mb-1"
                  />
                )}
                <p className="text-xs font-medium truncate text-gray-900">{rec.name}</p>
                {rec.brand && (
                  <p className="text-[10px] text-gray-500">{rec.brand}</p>
                )}
                <p className="text-xs font-bold text-blue-600">${parseFloat(rec.price).toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;