import { io } from "socket.io-client";
import { Message } from "../types";

// URL server Socket.io - menggunakan IP lokal untuk menghindari masalah DNS
const SOCKET_URL = "http://127.0.0.1:5000";

console.log("Connecting to Socket.io server at:", SOCKET_URL);

// ID room global yang digunakan oleh semua user
const GLOBAL_ROOM_ID = 'global-chat-room';

// Buat koneksi Socket.io dengan opsi reconnection yang lebih agresif
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'], // Coba websocket terlebih dahulu, lalu polling
});

// Log koneksi Socket.io
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
  // Coba koneksi ulang setelah 5 detik
  setTimeout(() => {
    if (!socket.connected) {
      console.log("Attempting to reconnect socket...");
      socket.connect();
    }
  }, 5000);
});

// Fungsi untuk menghubungkan socket
export const connectSocket = () => {
  try {
    if (!socket.connected) {
      console.log("Connecting to socket server...");
      socket.connect();
    }
  } catch (error) {
    console.error("Error connecting to socket:", error);
  }
};

// Fungsi untuk memutuskan koneksi socket
export const disconnectSocket = () => {
  try {
    if (socket.connected) {
      socket.disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting socket:", error);
  }
};

// Fungsi untuk mengirim pesan
export const sendMessage = (message: string, roomId: string, userId: string, userAvatar?: string, userName?: string) => {
  try {
    const messageData: Message = {
      id: Math.random().toString(36).substring(2, 9), // ID akan diganti di server
      text: message,
      userId,
      timestamp: new Date().toISOString(),
      roomId,
      senderAvatar: userAvatar,
      senderName: userName
    };
    
    socket.emit("send_message", messageData);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Fungsi untuk bergabung ke ruang chat
export const joinRoom = (roomId: string, userId: string) => {
  try {
    socket.emit("join_room", { roomId, userId });
    
    // Setelah join room, minta riwayat chat
    requestChatHistory(roomId);
  } catch (error) {
    console.error("Error joining room:", error);
  }
};

// Fungsi untuk meninggalkan ruang chat
export const leaveRoom = (roomId: string, userId: string) => {
  try {
    socket.emit("leave_room", { roomId, userId });
  } catch (error) {
    console.error("Error leaving room:", error);
  }
};

// Fungsi untuk meminta riwayat chat
export const requestChatHistory = (roomId: string) => {
  try {
    socket.emit("get_chat_history", { roomId });
  } catch (error) {
    console.error("Error requesting chat history:", error);
  }
}; 