import React, { useState } from 'react';
import { Message } from '../types';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { id } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  senderAvatar?: string;
  senderName?: string;
}

// Emoji reactions
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👀', '🙌'];

const ChatMessage: React.FC<ChatMessageProps> = ({ message, senderAvatar, senderName }) => {
  const { user } = useUser();
  const isOwnMessage = user?.id === message.userId;
  const isSystemMessage = message.userId === 'system';
  const [isHovered, setIsHovered] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  
  // Format waktu Indonesia
  const formatTimeIndonesia = (timestamp: string) => {
    try {
      // Format waktu Indonesia (WIB)
      return formatInTimeZone(
        new Date(timestamp), 
        'Asia/Jakarta', 
        'HH:mm, dd MMM yyyy', 
        { locale: id }
      );
    } catch (error) {
      // Fallback jika ada error
      return format(
        new Date(timestamp),
        'HH:mm, dd MMM yyyy',
        { locale: id }
      );
    }
  };
  
  // Tampilkan pesan sistem dengan format khusus
  if (isSystemMessage) {
    return (
      <div 
        className="flex justify-center my-2 sm:my-4 animate-fade-in"
      >
        <div 
          className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 rounded-full px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm max-w-[85%] sm:max-w-[80%] text-center shadow-sm hover:scale-[1.03] transition-transform"
        >
          {message.text}
        </div>
      </div>
    );
  }
  
  // Tentukan warna bubble berdasarkan pengirim
  const getBubbleColor = () => {
    if (isOwnMessage) {
      return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
    } else {
      return 'bg-gradient-to-r from-blue-100 to-blue-200 text-gray-800';
    }
  };

  // Tentukan warna teks nama pengirim berdasarkan bubble
  const getSenderNameStyle = () => {
    if (isOwnMessage) {
      return 'text-white font-bold';
    } else {
      return 'text-blue-800 font-bold';
    }
  };

  // Handler untuk double click pada pesan
  const handleDoubleClick = () => {
    if (!reaction) {
      setReaction('❤️');
    } else {
      setReaction(null);
    }
  };

  // Handler untuk klik pada emoji reaksi
  const handleReactionClick = (emoji: string) => {
    if (reaction === emoji) {
      setReaction(null);
    } else {
      setReaction(emoji);
    }
    setShowReactions(false);
  };

  return (
    <div
      className={`flex ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } mb-3 sm:mb-4 relative animate-fade-in`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTimeout(() => {
          if (!showReactions) {
            setShowReactions(false);
          }
        }, 300);
      }}
    >
      {showReactions && (
        <div 
          className="absolute -top-10 bg-white rounded-full shadow-md p-1 flex gap-1 z-10 animate-scale-in"
          style={{
            left: isOwnMessage ? 'auto' : '40px',
            right: isOwnMessage ? '40px' : 'auto'
          }}
        >
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              className={`hover:bg-gray-100 rounded-full p-1.5 cursor-pointer hover:scale-[1.2] active:scale-[0.9] transition-transform text-sm ${
                reaction === emoji ? 'bg-primary-100' : ''
              }`}
              onClick={() => handleReactionClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {!isOwnMessage && (
        <div className="flex flex-col items-center mr-1 sm:mr-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md hover:scale-[1.1] transition-transform">
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
                ?
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="relative group max-w-[75%] sm:max-w-[70%]">
        <div
          className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${getBubbleColor()} ${
            isOwnMessage
              ? 'rounded-br-none'
              : 'rounded-bl-none'
          } shadow-md hover:scale-[1.02] transition-transform break-words`}
          onDoubleClick={handleDoubleClick}
        >
          {!isOwnMessage && senderName && (
            <div className="text-xs sm:text-sm font-semibold mb-1.5 pb-1 border-b border-gray-200 border-opacity-30 flex items-center">
              <span className={getSenderNameStyle()}>{senderName}</span>
            </div>
          )}
          <div className="text-xs sm:text-sm overflow-hidden break-words">{message.text}</div>
          <div
            className={`text-[10px] sm:text-xs mt-1 ${
              isOwnMessage ? 'text-primary-100' : 'text-gray-500'
            } flex items-center gap-1`}
          >
            {formatTimeIndonesia(message.timestamp)}
            
            {isHovered && !showReactions && (
              <button 
                className="ml-1 opacity-60 hover:opacity-100 transition-transform text-xs sm:text-sm"
                onClick={() => setShowReactions(true)}
                aria-label="Tampilkan emoji"
              >
                😀
              </button>
            )}
          </div>
        </div>
        
        {reaction && (
          <div 
            className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-md p-1.5 z-10 animate-bounce-subtle text-sm"
            onClick={() => setReaction(null)}
          >
            {reaction}
          </div>
        )}
      </div>
      
      {isOwnMessage && (
        <div className="flex flex-col items-center ml-1 sm:ml-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md hover:scale-[1.1] transition-transform">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.characterName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white text-xs font-bold">
                ?
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 