import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border border-gray-300 rounded-l-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          autoFocus
        />
        <button
          type="submit"
          className={`bg-primary-600 hover:bg-primary-700 text-white rounded-r-full px-6 py-3 transition-colors ${
            !message.trim() ? 'opacity-70 cursor-not-allowed' : 'shadow-md'
          }`}
          disabled={!message.trim()}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex justify-center mt-2">
        <div className="text-xs text-gray-400 flex items-center">
          <span className="block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          Pesan dikirim secara anonim
        </div>
      </div>
    </form>
  );
};

export default ChatInput; 