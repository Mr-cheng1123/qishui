import { useState, useCallback, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  GameRoom,
  SuitcaseCard
} from '@/types/game';

// 本地存储的玩家ID
const getStoredPlayerId = (): string => {
  let id = localStorage.getItem('soda_smuggler_player_id');
  if (!id) {
    id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('soda_smuggler_player_id', id);
  }
  return id;
};

// 服务器地址 - 动态检测
const getServerUrl = () => {
  // 如果设置了环境变量，使用环境变量
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  
  // 如果在生产环境，尝试使用同域名
  if (import.meta.env.PROD) {
    // 生产环境默认使用同源地址（适合单域名部署）
    return window.location.origin;
  }
  
  // 默认本地开发服务器
  return 'http://localhost:3001';
};

const SERVER_URL = getServerUrl();

export function useGame() {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => getStoredPlayerId());
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  // 初始化 Socket 连接
  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError('');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('无法连接到服务器，请检查网络连接');
      setIsConnecting(false);
    });

    socket.on('room_created', ({ code, playerId: newPlayerId }) => {
      setRoomCode(code);
      setPlayerId(newPlayerId);
      localStorage.setItem('soda_smuggler_player_id', newPlayerId);
      setIsConnecting(false);
    });

    socket.on('room_joined', ({ code, playerId: newPlayerId }) => {
      setRoomCode(code);
      setPlayerId(newPlayerId);
      localStorage.setItem('soda_smuggler_player_id', newPlayerId);
      setIsConnecting(false);
    });

    socket.on('room_update', (updatedRoom: GameRoom) => {
      // 将普通对象转换为 Map
      const roomWithMap = {
        ...updatedRoom,
        travelerStates: new Map(Object.entries(updatedRoom.travelerStates || {}))
      };
      setRoom(roomWithMap);
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setIsConnecting(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((playerName: string, avatar: string) => {
    if (!socketRef.current) return '';
    
    setIsConnecting(true);
    setError('');
    
    socketRef.current.emit('create_room', { playerName, avatar });
    return roomCode;
  }, [roomCode]);

  const joinRoom = useCallback((code: string, playerName: string, avatar: string) => {
    if (!socketRef.current) return false;
    
    setIsConnecting(true);
    setError('');
    
    socketRef.current.emit('join_room', { code, playerName, avatar });
    return true;
  }, []);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      // 重新连接以创建新的 socket 会话
      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true
      });
      socketRef.current = socket;
      
      socket.on('room_update', (updatedRoom: GameRoom) => {
        const roomWithMap = {
          ...updatedRoom,
          travelerStates: new Map(Object.entries(updatedRoom.travelerStates || {}))
        };
        setRoom(roomWithMap);
      });
    }
    setRoom(null);
    setRoomCode('');
  }, []);

  const startGame = useCallback(() => {
    if (!socketRef.current) return false;
    socketRef.current.emit('start_game');
    return true;
  }, []);

  const selectCards = useCallback((luggageIds: string[], bribeId: string) => {
    if (!socketRef.current) return false;
    socketRef.current.emit('select_cards', { luggageIds, bribeId });
    return true;
  }, []);

  const useActionToken = useCallback((tokenIndex: number, targetPlayerId?: string) => {
    if (!socketRef.current) return false;
    socketRef.current.emit('use_action_token', { tokenIndex, targetPlayerId });
    return true;
  }, []);

  const finishGuardActions = useCallback(() => {
    if (!socketRef.current) return false;
    socketRef.current.emit('finish_guard_actions');
    return true;
  }, []);

  const getMyHand = useCallback((): SuitcaseCard[] => {
    if (!room) return [];
    const me = room.players.find(p => p.id === playerId);
    return (me as any)?.hand || [];
  }, [room, playerId]);

  const isMyTurn = useCallback((): boolean => {
    if (!room) return false;
    return room.currentBorderGuardId === playerId;
  }, [room, playerId]);

  const amIBorderGuard = useCallback((): boolean => {
    if (!room) return false;
    const me = room.players.find(p => p.id === playerId);
    return me?.isBorderGuard || false;
  }, [room, playerId]);

  return {
    room,
    playerId,
    error,
    isConnecting,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    selectCards,
    useActionToken,
    finishGuardActions,
    getMyHand,
    isMyTurn,
    amIBorderGuard
  };
}
