import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Zap } from 'lucide-react';

const ChatbotButton = ({ onClick, isOpen, unreadCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      if (!isOpen) {
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[70]">
      {/* 3D Floating Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative w-14 h-14 sm:w-16 sm:h-16 
          bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
          rounded-full shadow-2xl transform transition-all duration-500 ease-out
          hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/30
          ${pulse ? 'animate-pulse scale-110' : ''}
          ${isHovered ? 'rotate-12 shadow-purple-500/40' : 'shadow-purple-500/20'}
        `}
        style={{
          filter: isHovered
            ? 'drop-shadow(0 12px 40px rgba(139, 92, 246, 0.5))'
            : 'drop-shadow(0 8px 32px rgba(139, 92, 246, 0.3))',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {/* Animated Background Blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Glassmorphism Effect */}
        <div className="relative w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">

          {/* Icon Container */}
          <div className="relative z-10">
            {isOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white transform transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white transform transition-transform duration-300 group-hover:scale-110" fill="currentColor" />
            )}

            {/* Sparkle Effect */}
            <Sparkles
              className={`
                absolute -top-1 -right-1 w-3 h-3 text-yellow-300 
                transform transition-all duration-500
                ${isHovered ? 'scale-125 rotate-180' : 'scale-100 rotate-0'}
              `}
            />
          </div>

          {/* Floating Particles Animation */}
          {!isOpen && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => {
                const angle = i * 120; // 120 degrees apart
                const x = 50 + Math.cos((angle * Math.PI) / 180) * 20;
                const y = 50 + Math.sin((angle * Math.PI) / 180) * 20;

                return (
                  <Zap
                    key={i}
                    className={`
                      absolute w-2 h-2 text-white/60 
                      animate-bounce transition-all duration-1000
                      ${pulse ? 'opacity-100' : 'opacity-0'}
                    `}
                    style={{
                      insetInlineStart: `${x}%`,
                      insetBlockStart: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Unread Count Badge */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
            <span className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Tooltip for Desktop */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 hidden sm:block">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl border border-gray-700">
            Chat with JobAstra AI
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Mobile Touch Feedback */}
      <div
        className={`
          absolute inset-0 rounded-full bg-white/20 transition-opacity duration-200
      ${isHovered ? 'opacity-100' : 'opacity-0'} sm:hidden pointer-events-none
        `}
      />
    </div>
  );
};

export default ChatbotButton;
