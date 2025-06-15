import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { formatDistanceToNow } from 'date-fns';
import { User } from '../types';

interface UserMap {
  [userId: string]: User;
}

const ChatWindow: React.FC = () => {
  const { messages, currentRoom, leaveCurrentRoom } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserMap>({});
  
  // Simulasi data pengguna lain (dalam aplikasi nyata, ini akan berasal dari server)
  useEffect(() => {
    if (currentRoom) {
      // Buat pengguna acak untuk setiap pesan yang bukan dari pengguna saat ini
      const otherUsers: UserMap = {};
      messages.forEach(message => {
        if (!otherUsers[message.userId] && !users[message.userId]) {
          otherUsers[message.userId] = {
            id: message.userId,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            avatar: '',
            isOnline: true
          };
        }
      });
      
      setUsers(prev => ({ ...prev, ...otherUsers }));
    }
  }, [messages, currentRoom]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return null;
  }

  // Calculate time remaining until expiration
  const expiresAt = new Date(currentRoom.expiresAt);
  const timeRemaining = formatDistanceToNow(expiresAt);

  return (
    <div className="flex flex-col h-full max-w-4xl w-full mx-auto shadow-xl rounded-xl overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div>
          <h2 className="text-xl font-semibold">Wicara Fana</h2>
          <p className="text-sm opacity-90">
            Chat berakhir dalam {timeRemaining}
          </p>
        </div>
        <button
          onClick={leaveCurrentRoom}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg px-4 py-2 text-sm transition-colors backdrop-blur-sm"
        >
          Keluar Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-lg mb-2">Belum ada pesan</p>
              <p className="text-sm">Mulai percakapan dengan mengirim pesan!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              senderGender={users[message.userId]?.gender}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput />
      
      <div className="bg-gray-50 p-2 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Created by <a href="https://github.com/abhixyz1" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">@abhixyz1</a>
        </p>
      </div>
    </div>
  );
};

export default ChatWindow; 