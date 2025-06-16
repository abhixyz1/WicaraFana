export interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: string;
  roomId: string;
  senderAvatar?: string;
  senderName?: string;
}

export interface User {
  id: string;
  avatar: string;
  characterName: string;
  isOnline: boolean;
}

export interface ChatRoom {
  id: string;
  users: string[];
  createdAt: string;
  expiresAt: string;
} 