import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  X,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import chatbotService from '../../services/chatbotService';

const ChatbotInterface = ({ isOpen, onClose, onMinimize, isMinimized, isMobile }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi there! 👋 I'm JobBot, your AI career assistant. I'm here to help you find the perfect job opportunities on JobAstra. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Find jobs in my field",
        "Help me improve my resume",
        "What are trending skills?",
        "Salary insights"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatbotService.sendMessage(inputMessage.trim());

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions || [],
        fallback: response.fallback
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setError('Sorry, I encountered an issue. Please try again.');

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now. Please try asking your question again, or visit our Jobs page to browse available positions.",
        timestamp: new Date(),
        suggestions: ["Browse Jobs", "Contact Support", "Try Again", "Help"]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className={`
      ${isMobile
        ? 'w-full h-full flex flex-col'
        : `fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 
           w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-300 ease-out
           ${isMinimized ? 'h-16' : 'h-80 sm:h-96 md:h-[500px]'}`
      }
    `}>
      <div className={`
        bg-white rounded-2xl shadow-2xl 
        border border-gray-200 overflow-hidden 
        backdrop-blur-xl bg-opacity-95
        ${isMobile ? 'w-full h-full flex flex-col' : 'flex flex-col h-full'}
      `}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 sm:p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full border border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">JobAstra AI</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <Sparkles className="w-2 h-2 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Career Assistant</span>
                  <span className="sm:hidden">Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {!isMobile && (
                <button
                  onClick={onMinimize}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                  aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                >
                  {isMinimized ?
                    <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" /> :
                    <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  }
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Close chat"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div
              className={`
                flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3
                ${isMobile ? 'flex-1' : 'max-h-48 sm:max-h-64 md:max-h-80'}
              `}
              style={isMobile ? { paddingBlockEnd: 'calc(env(safe-area-inset-bottom) + 0.25rem)' } : undefined}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-1 sm:space-x-2`}
                >
                  {message.type === 'bot' && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-48 sm:max-w-56 md:max-w-xs">
                    <div
                      className={`
                        p-2 sm:p-3 rounded-lg sm:rounded-2xl text-xs sm:text-sm
                        ${message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }
                      `}
                    >
                      {message.type === 'bot' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-200 prose-code:rounded">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children, ...props }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                              code: ({ className, children, ...props }) => (
                                <code className={`${className || ''}`.trim()} {...props}>{children}</code>
                              )
                            }}
                          >
                            {String(message.content || '')}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="break-words whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {/* Suggestions for bot messages */}
                    {message.type === 'bot' && message.suggestions && (
                      <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-right text-blue-300' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-2 h-2 sm:w-3 sm:h-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start items-end space-x-1 sm:space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <div className="bg-gray-100 p-2 sm:p-3 rounded-lg sm:rounded-2xl rounded-bl-md">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-500" />
                      <span className="text-xs sm:text-sm text-gray-600">Typing...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-50 border border-red-200 p-2 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span className="text-xs sm:text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="p-2 sm:p-3 border-t border-gray-200"
              style={isMobile ? { paddingBlockEnd: 'calc(env(safe-area-inset-bottom) + 0.25rem)' } : undefined}
            >
              <div className="flex items-end space-x-1 sm:space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about jobs..."
                    className="w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-300 bg-white text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                    rows="1"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1 text-center hidden sm:block">
                Press Enter to send
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotInterface;
