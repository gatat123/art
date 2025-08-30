import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface CommentData {
  id: number;
  scene_id: string;
  user_id: number;
  content: string;
  parent_id?: string;
  annotation_data?: string;
  image_type?: string;
  tag?: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  username: string;
  avatar_url?: string;
}

interface UseWebSocketProps {
  sceneId: string | null;
  onCommentAdded?: (comment: CommentData) => void;
  onCommentUpdated?: (comment: CommentData) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentResolved?: (commentId: string, resolved: boolean) => void;
  onUserTyping?: (userId: number, username: string, isTyping: boolean) => void;
}

export const useWebSocket = ({
  sceneId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  onCommentResolved,
  onUserTyping
}: UseWebSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuth();
  const currentSceneRef = useRef<string | null>(null);

  // Socket 연결 초기화
  useEffect(() => {
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    // 댓글 이벤트 리스너
    socket.on('comment-added', (data) => {
      if (onCommentAdded) {
        onCommentAdded(data.comment);
      }
    });

    socket.on('comment-updated', (data) => {
      if (onCommentUpdated) {
        onCommentUpdated(data.comment);
      }
    });

    socket.on('comment-deleted', (data) => {
      if (onCommentDeleted) {
        onCommentDeleted(data.commentId);
      }
    });

    socket.on('comment-resolved', (data) => {
      if (onCommentResolved) {
        onCommentResolved(data.commentId, data.resolved);
      }
    });

    socket.on('user-typing', (data) => {
      if (onUserTyping) {
        onUserTyping(data.userId, data.username, data.isTyping);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onCommentAdded, onCommentUpdated, onCommentDeleted, onCommentResolved, onUserTyping]);

  // 씬 룸 참가/퇴장 관리
  useEffect(() => {
    if (!socketRef.current || !sceneId) return;

    // 이전 씬에서 퇴장
    if (currentSceneRef.current && currentSceneRef.current !== sceneId) {
      socketRef.current.emit('leave-scene', currentSceneRef.current);
    }

    // 새 씬에 참가
    socketRef.current.emit('join-scene', sceneId);
    currentSceneRef.current = sceneId;

    return () => {
      if (socketRef.current && currentSceneRef.current) {
        socketRef.current.emit('leave-scene', currentSceneRef.current);
      }
    };
  }, [sceneId]);

  // 댓글 추가 이벤트 발송
  const emitCommentAdded = useCallback((comment: CommentData) => {
    if (socketRef.current && sceneId) {
      socketRef.current.emit('comment-added', {
        sceneId,
        comment
      });
    }
  }, [sceneId]);

  // 댓글 수정 이벤트 발송
  const emitCommentUpdated = useCallback((comment: CommentData) => {
    if (socketRef.current && sceneId) {
      socketRef.current.emit('comment-updated', {
        sceneId,
        comment
      });
    }
  }, [sceneId]);

  // 댓글 삭제 이벤트 발송
  const emitCommentDeleted = useCallback((commentId: string) => {
    if (socketRef.current && sceneId) {
      socketRef.current.emit('comment-deleted', {
        sceneId,
        commentId
      });
    }
  }, [sceneId]);

  // 댓글 해결 상태 변경 이벤트 발송
  const emitCommentResolved = useCallback((commentId: string, resolved: boolean) => {
    if (socketRef.current && sceneId) {
      socketRef.current.emit('comment-resolved', {
        sceneId,
        commentId,
        resolved
      });
    }
  }, [sceneId]);

  // 사용자 타이핑 이벤트 발송
  const emitTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && sceneId) {
      socketRef.current.emit('typing', {
        sceneId,
        isTyping
      });
    }
  }, [sceneId]);

  return {
    emitCommentAdded,
    emitCommentUpdated,
    emitCommentDeleted,
    emitCommentResolved,
    emitTyping,
    isConnected: socketRef.current?.connected || false
  };
};
