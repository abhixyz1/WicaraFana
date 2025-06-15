import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { Message, ChatRoom } from '../types';
import { socket, joinRoom, leaveRoom } from '../services/socket';
import { useUser } from './UserContext';

interface ChatContextType {
  messages: Message[];
  currentRoom: ChatRoom | null;
  joinRandomRoom: () => void;
  sendMessage: (text: string) => void;
  leaveCurrentRoom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const { user } = useUser();

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receive_message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for room expiration
    socket.on('room_expired', (roomId: string) => {
      if (currentRoom && currentRoom.id === roomId) {
        setCurrentRoom(null);
        setMessages([]);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('room_expired');
    };
  }, [currentRoom]);

  const joinRandomRoom = () => {
    if (!user) return;
    
    // For now, we'll create a new room each time
    // In a real app, you might want to match users to existing rooms
    const roomId = uuidv4();
    const now = new Date();
    const expiresAt = addHours(now, 3).toISOString(); // Room expires after 3 hours
    
    const newRoom: ChatRoom = {
      id: roomId,
      users: [user.id],
      createdAt: now.toISOString(),
      expiresAt,
    };
    
    setCurrentRoom(newRoom);
    setMessages([]);
    joinRoom(roomId, user.id);
  };

  const sendMessage = (text: string) => {
    if (!user || !currentRoom) return;
    
    const newMessage: Message = {
      id: uuidv4(),
      text,
      userId: user.id,
      timestamp: new Date().toISOString(),
      roomId: currentRoom.id,
    };
    
    // Add message to local state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    // Send message through socket
    socket.emit('send_message', newMessage);
  };

  const leaveCurrentRoom = () => {
    if (!user || !currentRoom) return;
    
    leaveRoom(currentRoom.id, user.id);
    setCurrentRoom(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ messages, currentRoom, joinRandomRoom, sendMessage, leaveCurrentRoom }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 