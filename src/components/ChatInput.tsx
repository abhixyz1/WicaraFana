import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';

const ChatInput: React.FC = () => {
  const { sendMessage } = useChat();
  const { isDark } = useTheme();
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    
    // Set new height based on scrollHeight (with max height)
    const newHeight = Math.min(e.target.scrollHeight, 120);
    e.target.style.height = `${newHeight}px`;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === '' || isSending) return;
    
    setIsSending(true);
    
    try {
      await sendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 transition-colors duration-300">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent resize-none transition-all duration-200 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center">
            <button
              type="button"
              onClick={() => setMessage(prev => prev + '😊')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
              title="Add emoji"
            >
              😊
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={message.trim() === '' || isSending}
          className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
            message.trim() === '' || isSending
              ? 'bg-gray-300 dark:bg-dark-600 cursor-not-allowed'
              : 'bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 active:scale-95'
          } text-white`}
        >
          {isSending ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
        <span>Tekan <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded border border-gray-300 dark:border-dark-600 font-sans">Enter</kbd> untuk kirim, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded border border-gray-300 dark:border-dark-600 font-sans">Shift+Enter</kbd> untuk baris baru</span>
      </div>
    </div>
  );
};

export default ChatInput; 