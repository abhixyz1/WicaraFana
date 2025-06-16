import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { formatDistanceToNow } from 'date-fns';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserMap>({});
  const [randomEmoji, setRandomEmoji] = useState<string>(FUN_EMOJIS[0]);
  const [chatPhrase, setChatPhrase] = useState<string>(CHAT_PHRASES[0]);
  const [isExitHovered, setIsExitHovered] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
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
  }, [currentRoom, isConnected]);
  
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
  
  // Simulasi data pengguna lain (dalam aplikasi nyata, ini akan berasal dari server)
  useEffect(() => {
    processUserData();
  }, [processUserData]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Tampilkan loading state jika belum terhubung ke server
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-primary-700 mb-3">Menghubungkan ke Server...</h2>
          <p className="text-gray-600 mb-4">Mohon tunggu sebentar, kami sedang mencoba menghubungkan ke server chat.</p>
          <div className="flex justify-center mb-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animation-delay-400"></div>
            </div>
          </div>
          {connectionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              <p className="font-medium">Gagal terhubung ke server:</p>
              <p>{connectionError}</p>
              <p className="mt-2 text-xs">Pastikan server berjalan dengan menjalankan file <code className="bg-gray-100 px-1 py-0.5 rounded">start-server.bat</code> di folder <code className="bg-gray-100 px-1 py-0.5 rounded">wicara-fana-server</code></p>
              <p className="mt-1 text-xs">Mencoba menghubungkan kembali...</p>
            </div>
          )}
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-700 transition-colors"
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
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-primary-700 mb-3">Menghubungkan ke Chat...</h2>
          <p className="text-gray-600 mb-4">Mohon tunggu sebentar, kami sedang menghubungkan ke ruang chat global.</p>
          <div className="flex justify-center mb-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animation-delay-400"></div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-700 transition-colors"
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

  // Debug function to test messaging
  const testSendMessage = () => {
    sendMessage('Test message from debugging function');
  };

  return (
    <div 
      className="flex flex-col h-full w-full max-w-4xl mx-auto shadow-md rounded-lg overflow-hidden relative z-10"
    >
      <div 
        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 sm:p-3 flex justify-between items-center border-b border-primary-800"
      >
        <div>
          <div 
            className="flex items-center gap-2"
          >
            <h2 className="text-lg sm:text-xl font-bold">Wicara Fana</h2>
            <span className="text-lg sm:text-xl">{randomEmoji}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <p 
              className="text-xs sm:text-sm opacity-90"
            >
              Pesan hilang dalam {timeRemaining}
            </p>
            <span className="inline-flex items-center bg-green-500 bg-opacity-30 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              {onlineCount} online
            </span>
            
            {/* Connection status indicator */}
            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
              isConnected 
                ? "bg-green-500 bg-opacity-30 text-white" 
                : "bg-red-500 bg-opacity-30 text-white"
            }`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}></span>
              {isConnected ? "Terhubung" : "Terputus"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Debug button - remove in production */}
          
          <button
            onClick={onExitChat}
            onMouseEnter={() => setIsExitHovered(true)}
            onMouseLeave={() => setIsExitHovered(false)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors"
          >
            <span>Cabut Dulu</span>
            <span
              className={`inline-block ml-1 ${isExitHovered ? 'rotate-90' : ''} transition-transform`}
            >
              🚪
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-gray-50">
        {!isConnected && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-red-600 text-sm">
            <p className="font-medium">Koneksi terputus</p>
            <p>Mencoba menghubungkan kembali ke server...</p>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <div 
              className="bg-white p-4 rounded-lg shadow-sm text-center max-w-md border border-gray-100"
            >
              <p 
                className="text-base sm:text-lg font-medium mb-2 text-primary-600"
              >
                {chatPhrase}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Mulai ngobrol dengan kirim pesan! Semua pesan akan hilang setelah 3 jam.</p>
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

      <ChatInput />
      
      <div 
        className="bg-gray-50 p-1 sm:p-2 text-center border-t border-gray-200"
      >
        <p className="text-xs text-gray-400">
          Created by <a href="https://github.com/abhixyz1" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">@abhixyz1</a>
        </p>
      </div>
    </div>
  );
};

export default ChatWindow; 