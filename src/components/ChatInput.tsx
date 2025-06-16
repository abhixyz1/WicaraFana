import React, { useState, useEffect, ChangeEvent } from 'react';
import { useChat } from '../contexts/ChatContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Placeholder suggestions for chat
const PLACEHOLDER_SUGGESTIONS = [
  "Ketik pesan...",
  "Lagi ngapain?",
  "Hai, mau kenalan?",
  "Kuliah jurusan apa?",
  "Lagi gabut nih...",
  "Punya rekomendasi film?",
  "Udah makan belum?",
  "Lagi di mana?",
  "Hobi kamu apa?",
  "Dengerin lagu apa?",
];

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, isConnected } = useChat();
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_SUGGESTIONS[0]);
  const [isTyping, setIsTyping] = useState(false);

  // Change placeholder text periodically
  useEffect(() => {
    if (isTyping) return;
    
    const placeholderInterval = setInterval(() => {
      setPlaceholder(PLACEHOLDER_SUGGESTIONS[Math.floor(Math.random() * PLACEHOLDER_SUGGESTIONS.length)]);
    }, 3000);
    
    return () => clearInterval(placeholderInterval);
  }, [isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-gray-200 p-2 sm:p-4 bg-white relative z-20 animate-slide-up"
    >
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
          placeholder={isConnected ? placeholder : "Menunggu koneksi..."}
          className="flex-1 border border-gray-300 rounded-l-full py-2 sm:py-3 px-3 sm:px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all focus:scale-[1.01]"
          autoFocus
          disabled={!isConnected}
        />
        <button
          type="submit"
          className={`bg-primary-600 hover:bg-primary-700 text-white rounded-r-full px-3 sm:px-6 py-2 sm:py-3 transition-all hover:scale-105 active:scale-95 ${
            !message.trim() || !isConnected ? 'opacity-70 cursor-not-allowed' : 'shadow-md'
          }`}
          disabled={!message.trim() || !isConnected}
        >
          <div className={message.trim() && isConnected ? "animate-bounce-subtle" : ""}>
            <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </button>
      </div>
      
      <div 
        className="flex justify-center mt-1 sm:mt-2 animate-fade-in"
      >
        <div 
          className="text-[10px] sm:text-xs text-gray-400 flex items-center hover:scale-105 hover:text-primary-600 transition-all"
        >
          <span 
            className={`block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
          ></span>
          {isConnected ? 'Chat aman & anonim kok 👌' : 'Menunggu koneksi...'}
        </div>
      </div>
    </form>
  );
};

export default ChatInput; 