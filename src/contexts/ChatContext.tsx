import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { Message, ChatRoom } from '../types';
import { socket, joinRoom, leaveRoom, connectSocket } from '../services/socket';
import { useUser } from './UserContext';

interface ChatContextType {
  messages: Message[];
  currentRoom: ChatRoom | null;
  joinRandomRoom: () => void;
  sendMessage: (text: string) => void;
  leaveCurrentRoom: () => void;
  isConnected: boolean;
  connectionError: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Token storage key
const TOKEN_STORAGE_KEY = 'wicaraFanaToken';

// ID room global yang digunakan oleh semua user
const GLOBAL_ROOM_ID = 'global-chat-room';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [shouldAutoJoin, setShouldAutoJoin] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user } = useUser();

  // Menangani koneksi socket
  useEffect(() => {
    // Menangani event koneksi
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log("Socket connected in ChatContext:", socket.id);
    };

    // Menangani event disconnect
    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log("Socket disconnected in ChatContext. Reason:", reason);
      
      // Set error jika disconnect bukan karena client
      if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
        setConnectionError("Koneksi ke server terputus: " + reason);
      }
    };

    // Menangani error koneksi
    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setConnectionError(error.message);
      console.error("Socket connection error in ChatContext:", error);
      
      // Tampilkan pesan yang lebih spesifik
      if (error.message.includes("xhr poll error")) {
        setConnectionError("Tidak dapat terhubung ke server. Pastikan server berjalan di http://127.0.0.1:5000");
      }
    };

    // Daftarkan event listener
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Koneksikan socket dengan timeout
    console.log("Attempting to connect to socket server...");
    connectSocket();
    
    // Coba koneksi ulang setiap 5 detik jika gagal
    const reconnectInterval = setInterval(() => {
      if (!socket.connected) {
        console.log("Reconnecting to socket server...");
        connectSocket();
      } else {
        clearInterval(reconnectInterval);
      }
    }, 5000);

    // Cleanup event listener
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      clearInterval(reconnectInterval);
    };
  }, []);

  // Leave current room function
  const leaveCurrentRoom = useCallback(() => {
    if (!user || !currentRoom) return;
    
    try {
      // Leave the room
      leaveRoom(currentRoom.id, user.id);
      
      // Reset state
      setCurrentRoom(null);
      setMessages([]);
      
      // Remove roomId from token
      try {
        const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedTokenData) {
          const tokenData = JSON.parse(storedTokenData);
          delete tokenData.roomId;
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
        }
      } catch (error) {
        console.error("Error removing roomId from token:", error);
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }, [user, currentRoom]);

  // Menangani logout - ketika user menjadi null, keluar dari ruang chat
  useEffect(() => {
    if (!user && currentRoom) {
      // User telah logout, keluar dari ruang chat
      leaveCurrentRoom();
    }
  }, [user, currentRoom, leaveCurrentRoom]);

  // Check if there's a stored room in token when component mounts
  useEffect(() => {
    if (user && shouldAutoJoin && isConnected) {
      try {
        // Selalu gunakan global room
        const roomId = GLOBAL_ROOM_ID;
        
        // Create room object
        const now = new Date();
        const expiresAt = addHours(now, 3).toISOString(); // Room expires after 3 hours
        
        const room: ChatRoom = {
          id: roomId,
          users: [user.id],
          createdAt: now.toISOString(),
          expiresAt,
        };
        
        setCurrentRoom(room);
        joinRoom(roomId, user.id);
        
        // Add reconnect message
        const reconnectMessage: Message = {
          id: uuidv4(),
          text: "Anda telah terhubung ke ruang chat.",
          userId: "system",
          timestamp: new Date().toISOString(),
          roomId: roomId,
        };
        
        setMessages([reconnectMessage]);
        
        // Simpan roomId ke token
        const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedTokenData) {
          const tokenData = JSON.parse(storedTokenData);
          tokenData.roomId = roomId;
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
        }
      } catch (error) {
        console.error("Error checking stored room:", error);
      }
    }
  }, [user, shouldAutoJoin, isConnected]);

  // Menangani pesan masuk dan riwayat chat
  useEffect(() => {
    // Listen for incoming messages
    const handleReceiveMessage = (message: Message) => {
      console.log('Received message:', message);
      
      // Filter pesan yang lebih lama dari 3 jam
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      
      // Hanya tambahkan pesan jika timestamp-nya kurang dari 3 jam
      if (new Date(message.timestamp) >= threeHoursAgo) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    // Listen for room expiration
    const handleRoomExpired = (roomId: string) => {
      if (currentRoom && currentRoom.id === roomId) {
        setCurrentRoom(null);
        setMessages([]);
        
        // Remove roomId from token
        try {
          const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
          if (storedTokenData) {
            const tokenData = JSON.parse(storedTokenData);
            delete tokenData.roomId;
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
          }
        } catch (error) {
          console.error("Error removing roomId from token:", error);
        }
      }
    };
    
    // Listen for history messages
    const handleChatHistory = (historyMessages: Message[]) => {
      console.log('Received chat history:', historyMessages);
      
      // Filter pesan yang lebih lama dari 3 jam
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      
      const recentMessages = historyMessages.filter(msg => 
        new Date(msg.timestamp) >= threeHoursAgo
      );
      
      setMessages(recentMessages);
    };

    // Register event listeners
    socket.on('receive_message', handleReceiveMessage);
    socket.on('room_expired', handleRoomExpired);
    socket.on('chat_history', handleChatHistory);

    // Cleanup event listeners
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('room_expired', handleRoomExpired);
      socket.off('chat_history', handleChatHistory);
    };
  }, [currentRoom]);

  // Join random room function with retry mechanism
  const joinRandomRoom = useCallback(() => {
    if (!user) return;
    
    // Enable auto-join
    setShouldAutoJoin(true);
    
    // Selalu gunakan global room
    const roomId = GLOBAL_ROOM_ID;
    const now = new Date();
    const expiresAt = addHours(now, 3).toISOString(); // Room expires after 3 hours
    
    const newRoom: ChatRoom = {
      id: roomId,
      users: [user.id],
      createdAt: now.toISOString(),
      expiresAt,
    };
    
    setCurrentRoom(newRoom);
    
    // Ensure socket is connected before joining
    if (!socket.connected) {
      connectSocket();
      
      // Wait for connection before joining
      const checkConnection = setInterval(() => {
        if (socket.connected) {
          clearInterval(checkConnection);
          joinRoom(roomId, user.id);
        }
      }, 1000);
      
      // Clear interval after 10 seconds to prevent infinite loop
      setTimeout(() => clearInterval(checkConnection), 10000);
    } else {
      joinRoom(roomId, user.id);
    }
    
    // Pesan welcome akan ditambahkan ketika menerima chat history
    
    // Save roomId to token
    try {
      const storedTokenData = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedTokenData) {
        const tokenData = JSON.parse(storedTokenData);
        tokenData.roomId = roomId;
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
      }
    } catch (error) {
      console.error("Error saving roomId to token:", error);
    }
  }, [user]);

  // Send message function
  const sendMessage = useCallback((text: string) => {
    if (!user || !currentRoom) return;
    
    try {
      // Kirim pesan dengan informasi karakter pengguna
      socket.emit('send_message', {
        id: uuidv4(),
        text,
        userId: user.id,
        timestamp: new Date().toISOString(),
        roomId: currentRoom.id,
        senderAvatar: user.avatar,
        senderName: user.characterName
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [user, currentRoom]);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      currentRoom, 
      joinRandomRoom, 
      sendMessage, 
      leaveCurrentRoom,
      isConnected,
      connectionError
    }}>
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