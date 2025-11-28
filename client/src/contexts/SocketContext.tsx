import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinIdeaRoom: (ideaId: string) => void;
  leaveIdeaRoom: (ideaId: string) => void;
  sendComment: (data: any) => void;
  sendVote: (data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          token,
        },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket((prevSocket) => {
        if (prevSocket) {
          prevSocket.close();
          setIsConnected(false);
        }
        return null;
      });
    }
  }, [isAuthenticated, token]);

  const joinIdeaRoom = (ideaId: string) => {
    if (socket) {
      socket.emit('join-idea', ideaId);
    }
  };

  const leaveIdeaRoom = (ideaId: string) => {
    if (socket) {
      socket.emit('leave-idea', ideaId);
    }
  };

  const sendComment = (data: any) => {
    if (socket) {
      socket.emit('new-comment', data);
    }
  };

  const sendVote = (data: any) => {
    if (socket) {
      socket.emit('new-vote', data);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinIdeaRoom,
    leaveIdeaRoom,
    sendComment,
    sendVote,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}; 