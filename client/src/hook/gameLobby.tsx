import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Player {
  socket_id: string;
  user_id: string;
  user_name: string;
  user_profile: string;
  isOnline: boolean;
}

export interface GameData {
  quizId: string;
  hostId: string;
}

export interface UseLobbyProps {
  action: 'create' | 'join';
  gameData?: GameData;
}

export interface LobbyState {
  roomId: number | null;
  isHost: boolean;
  players: Player[];
  messages: string[];
  lobbyStatus: string;
  error: string | null;
  socketId: string | null;
  joinRoom: (roomId: string, username:string) => void;
  sendMessage: (message: string) => void;
  startGame: () => void;
}

const SERVER_URL = 'http://localhost:3000';

export const useLobby = ({ action, gameData }: UseLobbyProps): LobbyState => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    if (action === 'create' && gameData) {
      setIsHost(true);
      newSocket.emit('create-room', gameData);
    } else {
      setIsHost(false);
    }

    newSocket.on('room-created', (createdRoomId: number) => {
      setRoomId(createdRoomId);
    });

    newSocket.on('join-successful', (data: { roomId: number; players: Player[] }) => {
      setRoomId(data.roomId);
      setPlayers(data.players);
    });

    newSocket.on('update-room-state', (room: { participants: Player[] }) => {
      setPlayers(room.participants);
    });

    newSocket.on('new-message', (message: string) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    newSocket.on('start-game', (data) => {
      console.log('Game is starting with data:', data);
    });

    newSocket.on('error-message', (errorMessage: string) => {
      setError(`Error: ${errorMessage}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [action, gameData]); 

  const lobbyStatus = !isHost && players.length < 2 
    ? 'Waiting for more players...' 
    : '🎉 Room is ready!';


  const joinRoom = (joinRoomIdStr: string, username: string) => {
    const parsedRoomId = parseInt(joinRoomIdStr.trim(), 10);
    const trimmedUsername = username.trim();

    if (!socket) {
      setError("Socket not connected.");
      return;
    }
    if (isNaN(parsedRoomId) || !trimmedUsername) {
      setError('Please enter a valid Room ID and your name.');
      return;
    }
    
    setError(null); 
    const joinData = {
      roomId: parsedRoomId,
      username: trimmedUsername,
      user_id: 'guest' + Math.random().toString(36).substring(2, 9),
      user_profile: `https://api.dicebear.com/7.x/adventurer/svg?seed=${trimmedUsername}`
    };
    socket.emit('join-room', joinData);
  };

  const sendMessage = (message: string) => {
    const trimmedMessage = message.trim();
    if (socket && roomId && trimmedMessage) {
      socket.emit('host-message', { roomId, message: trimmedMessage });
    }
  };
  
  const startGame = () => {
    if(socket && isHost && roomId){
      socket.emit('start-game',{roomId});
    }
  }

  return {
    roomId,
    isHost,
    players,
    messages,
    lobbyStatus,
    error,
    socketId: socket?.id || null,
    joinRoom,
    sendMessage,
    startGame,
  };
};