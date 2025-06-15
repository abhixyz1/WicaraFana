import { io } from "socket.io-client";
import { Message } from "../types";

// URL server Socket.io
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

// Buat koneksi Socket.io
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
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
});

// Fungsi untuk menghubungkan socket
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Fungsi untuk memutuskan koneksi socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Fungsi untuk mengirim pesan
export const sendMessage = (message: string, roomId: string, userId: string) => {
  const messageData: Message = {
    id: Math.random().toString(36).substring(2, 9), // ID akan diganti di server
    text: message,
    userId,
    timestamp: new Date().toISOString(),
    roomId,
  };
  
  socket.emit("send_message", messageData);
};

// Fungsi untuk bergabung ke ruang chat
export const joinRoom = (roomId: string, userId: string) => {
  socket.emit("join_room", { roomId, userId });
};

// Fungsi untuk meninggalkan ruang chat
export const leaveRoom = (roomId: string, userId: string) => {
  socket.emit("leave_room", { roomId, userId });
}; 