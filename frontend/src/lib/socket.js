import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
}

export function joinSession(sessionId) {
  const s = getSocket();
  s.connect();
  s.emit("join-session", sessionId);
  return s;
}
