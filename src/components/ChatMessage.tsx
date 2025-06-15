import React from 'react';
import { Message } from '../types';
import { useUser } from '../contexts/UserContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  senderGender?: 'male' | 'female';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, senderGender }) => {
  const { user } = useUser();
  const isOwnMessage = user?.id === message.userId;
  const isSystemMessage = message.userId === 'system';
  
  // Tampilkan pesan sistem dengan format khusus
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 rounded-full px-4 py-2 text-xs max-w-[80%] text-center">
          {message.text}
        </div>
      </div>
    );
  }
  
  // Tentukan warna berdasarkan gender
  const getBubbleColor = () => {
    if (isOwnMessage) {
      return 'bg-primary-600 text-white';
    } else {
      return senderGender === 'female' 
        ? 'bg-pink-100 text-gray-800 border border-pink-200' 
        : 'bg-blue-100 text-gray-800 border border-blue-200';
    }
  };

  return (
    <div
      className={`flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      {!isOwnMessage && (
        <div className={`w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center ${
          senderGender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
        } text-white text-xs font-bold`}>
          {senderGender === 'female' ? 'F' : 'M'}
        </div>
      )}
      
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${getBubbleColor()} ${
          isOwnMessage
            ? 'rounded-br-none'
            : 'rounded-bl-none'
        } shadow-sm`}
      >
        <div className="text-sm">{message.text}</div>
        <div
          className={`text-xs mt-1 ${
            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
          }`}
        >
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </div>
      </div>
      
      {isOwnMessage && (
        <div className={`w-8 h-8 rounded-full ml-2 flex-shrink-0 flex items-center justify-center ${
          user?.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
        } text-white text-xs font-bold`}>
          {user?.gender === 'female' ? 'F' : 'M'}
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 