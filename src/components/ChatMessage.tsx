import React, { useState } from 'react';
import { Message } from '../types';
import { useUser } from '../contexts/UserContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  senderGender?: 'male' | 'female';
}

// Emoji reactions
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👀', '🙌'];

const ChatMessage: React.FC<ChatMessageProps> = ({ message, senderGender }) => {
  const { user } = useUser();
  const isOwnMessage = user?.id === message.userId;
  const isSystemMessage = message.userId === 'system';
  const [isHovered, setIsHovered] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  
  // Tampilkan pesan sistem dengan format khusus
  if (isSystemMessage) {
    return (
      <div 
        className="flex justify-center my-4 animate-fade-in"
      >
        <div 
          className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 rounded-full px-5 py-2 text-sm max-w-[80%] text-center shadow-sm hover:scale-[1.03] transition-transform"
        >
          {message.text}
        </div>
      </div>
    );
  }
  
  // Tentukan warna berdasarkan gender
  const getBubbleColor = () => {
    if (isOwnMessage) {
      return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
    } else {
      return senderGender === 'female' 
        ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-gray-800' 
        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-gray-800';
    }
  };

  const handleDoubleClick = () => {
    if (!reaction) {
      setReaction('❤️');
    } else {
      setReaction(null);
    }
  };

  return (
    <div
      className={`flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } mb-4 relative animate-fade-in`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowReactions(false);
      }}
    >
      {showReactions && (
        <div 
          className="absolute -top-8 bg-white rounded-full shadow-md p-1 flex gap-1 z-10 animate-scale-in"
        >
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              className="hover:bg-gray-100 rounded-full p-1 cursor-pointer hover:scale-[1.2] active:scale-[0.9] transition-transform"
              onClick={() => setReaction(emoji === reaction ? null : emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {!isOwnMessage && (
        <div 
          className={`w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center ${
            senderGender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
          } text-white text-xs font-bold shadow-md hover:scale-[1.1] hover:rotate-[5deg] transition-transform`}
        >
          {senderGender === 'female' ? 'F' : 'M'}
        </div>
      )}
      
      <div className="relative group">
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-3 ${getBubbleColor()} ${
            isOwnMessage
              ? 'rounded-br-none'
              : 'rounded-bl-none'
          } shadow-md hover:scale-[1.02] transition-transform`}
          onDoubleClick={handleDoubleClick}
        >
          <div className="text-sm">{message.text}</div>
          <div
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-primary-100' : 'text-gray-500'
            } flex items-center gap-1`}
          >
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            
            {isHovered && !showReactions && (
              <button 
                className="ml-1 opacity-60 hover:opacity-100 scale-0 group-hover:scale-100 transition-transform"
                onClick={() => setShowReactions(true)}
              >
                😀
              </button>
            )}
          </div>
        </div>
        
        {reaction && (
          <div 
            className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-md p-1 z-10 animate-scale-in"
          >
            {reaction}
          </div>
        )}
      </div>
      
      {isOwnMessage && (
        <div 
          className={`w-8 h-8 rounded-full ml-2 flex-shrink-0 flex items-center justify-center ${
            user?.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
          } text-white text-xs font-bold shadow-md hover:scale-[1.1] hover:rotate-[-5deg] transition-transform`}
        >
          {user?.gender === 'female' ? 'F' : 'M'}
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 