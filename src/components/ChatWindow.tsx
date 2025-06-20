import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { formatDistanceToNow } from 'date-fns';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import ThemeToggle from './ThemeToggle';

interface UserMap {
  [userId: string]: User;
}

interface ChatWindowProps {
  onExitChat: () => void;
}

// Fun emojis for chat
const FUN_EMOJIS = ['🚀', '✨', '🔥', '💯', '🎉', '🤙', '😎', '👀', '🍕', '☕'];

// Fun phrases for chat
const CHAT_PHRASES = [
  "Chat seru dimulai!",
  "Ngobrol santai yuk!",
  "Cerita apa hari ini?",
  "Spill the tea!",
  "Bagi-bagi cerita dong!",
  "Lagi ngapain nih?",
  "Kuliah online ya?",
  "Tugas numpuk ga?",
  "Udah makan belum?",
  "Ceritain dong!"
];

const ChatWindow: React.FC<ChatWindowProps> = ({ onExitChat }) => {
  const { messages, currentRoom, sendMessage, joinRandomRoom, isConnected, connectionError } = useChat();
  const { isDark } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserMap>({});
  const [randomEmoji, setRandomEmoji] = useState<string>(FUN_EMOJIS[0]);
  const [chatPhrase, setChatPhrase] = useState<string>(CHAT_PHRASES[0]);
  const [isExitHovered, setIsExitHovered] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Listen for online users count
  useEffect(() => {
    const handleOnlineUsers = (data: { count: number }) => {
      setOnlineCount(data.count);
    };
    
    socket.on('online_users', handleOnlineUsers);
    
    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, []);
  
  // Change emoji every 5 seconds
  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setRandomEmoji(FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)]);
    }, 5000);
    
    return () => clearInterval(emojiInterval);
  }, []);
  
  // Change chat phrase every 10 seconds
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setChatPhrase(CHAT_PHRASES[Math.floor(Math.random() * CHAT_PHRASES.length)]);
    }, 10000);
    
    return () => clearInterval(phraseInterval);
  }, []);

  // Auto-join room if there's no current room
  useEffect(() => {
    if (!currentRoom && isConnected) {
      joinRandomRoom();
    }
  }, [currentRoom, isConnected, joinRandomRoom]);
  
  // Process user data from messages
  const processUserData = useCallback(() => {
    if (!currentRoom) return;
    
    const otherUsers: UserMap = {};
    messages.forEach(message => {
      if (!otherUsers[message.userId] && !users[message.userId] && message.userId !== 'system') {
        otherUsers[message.userId] = {
          id: message.userId,
          avatar: message.senderAvatar || '',
          characterName: message.senderName || 'Pengguna Anonim',
          isOnline: true
        };
      }
    });
    
    if (Object.keys(otherUsers).length > 0) {
      setUsers(prev => ({ ...prev, ...otherUsers }));
    }
  }, [currentRoom, messages, users]);
  
  // Process user data from messages
  useEffect(() => {
    processUserData();
  }, [processUserData]);

  // Handle scroll to bottom and scroll button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isNearBottom);
    };
    
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      
      // Initial scroll to bottom
      scrollToBottom();
    }
    
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tampilkan loading state jika belum terhubung ke server
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="card p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3">Menghubungkan ke Server...</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Mohon tunggu sebentar, kami sedang mencoba menghubungkan ke server chat.</p>
          <div className="flex justify-center mb-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-primary-600 dark:bg-primary-300 rounded-full animation-delay-400"></div>
            </div>
          </div>
          {connectionError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              <p className="font-medium">Gagal terhubung ke server:</p>
              <p>{connectionError}</p>
              <p className="mt-2 text-xs">Pastikan server berjalan dengan menjalankan file <code className="bg-gray-100 dark:bg-dark-700 px-1 py-0.5 rounded">start-server.bat</code> di folder <code className="bg-gray-100 dark:bg-dark-700 px-1 py-0.5 rounded">wicara-fana-server</code></p>
              <p className="mt-1 text-xs">Mencoba menghubungkan kembali...</p>
            </div>
          )}
          <button 
            onClick={() => navigate('/')}
            className="btn-outline"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  // Tampilkan loading state jika belum ada room
  if (!currentRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="card p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3">Menghubungkan ke Chat...</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Mohon tunggu sebentar, kami sedang menghubungkan ke ruang chat global.</p>
          <div className="flex justify-center mb-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-primary-600 dark:bg-primary-300 rounded-full animation-delay-400"></div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="btn-outline"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate time remaining until expiration (pesan akan hilang setelah 3 jam)
  const threeHoursFromNow = new Date();
  threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
  const timeRemaining = formatDistanceToNow(threeHoursFromNow);

  return (
    <div 
      className="flex flex-col h-full w-full max-w-4xl mx-auto shadow-lg rounded-xl overflow-hidden relative z-10 bg-white dark:bg-dark-800 transition-colors duration-300"
    >
      <div 
        className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 text-white p-3 sm:p-4 flex justify-between items-center border-b border-primary-800 dark:border-primary-950"
      >
        <div>
          <div 
            className="flex items-center gap-2"
          >
            <h2 className="text-lg sm:text-xl font-bold">Wicara Fana</h2>
            <span className="text-lg sm:text-xl animate-bounce-subtle">{randomEmoji}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <p 
              className="text-xs sm:text-sm opacity-90"
            >
              Pesan hilang dalam {timeRemaining}
            </p>
            <span className="badge-green">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1 animate-pulse"></span>
              {onlineCount} online
            </span>
            
            {/* Connection status indicator */}
            <span className={`badge ${
              isConnected 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${
                isConnected ? "bg-green-500 dark:bg-green-400 animate-pulse" : "bg-red-500 dark:bg-red-400"
              }`}></span>
              {isConnected ? "Terhubung" : "Terputus"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          
          <button
            onClick={onExitChat}
            onMouseEnter={() => setIsExitHovered(true)}
            onMouseLeave={() => setIsExitHovered(false)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 dark:bg-dark-700 dark:hover:bg-dark-600 text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors flex items-center"
          >
            <span>Keluar</span>
            <span
              className={`inline-block ml-1 ${isExitHovered ? 'rotate-90' : ''} transition-transform`}
            >
              🚪
            </span>
          </button>
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-dark-900 transition-colors duration-300"
      >
        {!isConnected && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-3 mb-4 text-red-600 dark:text-red-400 text-sm">
            <p className="font-medium">Koneksi terputus</p>
            <p>Mencoba menghubungkan kembali ke server...</p>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500"
          >
            <div 
              className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-sm text-center max-w-md border border-gray-100 dark:border-dark-700"
            >
              <p 
                className="text-base sm:text-lg font-medium mb-2 text-primary-600 dark:text-primary-400"
              >
                {chatPhrase}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Mulai ngobrol dengan kirim pesan! Semua pesan akan hilang setelah 3 jam.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
            >
              <ChatMessage 
                message={message} 
                senderAvatar={users[message.userId]?.avatar}
                senderName={users[message.userId]?.characterName}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 bg-primary-500 dark:bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-all duration-300 animate-bounce-subtle"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      <ChatInput />
      
      <div 
        className="bg-gray-50 dark:bg-dark-900 p-2 text-center border-t border-gray-200 dark:border-dark-700"
      >
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Created by <a href="https://github.com/abhixyz1" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">@abhixyz1</a>
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;