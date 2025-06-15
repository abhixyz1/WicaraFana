import { io } from "socket.io-client";

// Replace with your actual server URL when deployed
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL);

export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const sendMessage = (message: string, roomId: string, userId: string) => {
  socket.emit("send_message", {
    message,
    roomId,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export const joinRoom = (roomId: string, userId: string) => {
  socket.emit("join_room", { roomId, userId });
};

export const leaveRoom = (roomId: string, userId: string) => {
  socket.emit("leave_room", { roomId, userId });
}; 