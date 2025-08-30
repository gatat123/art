import jwt from 'jsonwebtoken';

export function setupSocketHandlers(io) {
  // Socket.io 인증 미들웨어
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.username} connected`);

    // 씬 룸 참가
    socket.on('join-scene', (sceneId) => {
      socket.join(`scene-${sceneId}`);
      console.log(`User ${socket.username} joined scene-${sceneId}`);
    });

    // 씬 룸 퇴장
    socket.on('leave-scene', (sceneId) => {
      socket.leave(`scene-${sceneId}`);
      console.log(`User ${socket.username} left scene-${sceneId}`);
    });

    // 댓글 추가 이벤트 브로드캐스트
    socket.on('comment-added', (data) => {
      const { sceneId, comment } = data;
      // 본인을 제외한 같은 씬의 모든 사용자에게 전송
      socket.to(`scene-${sceneId}`).emit('comment-added', {
        comment: {
          ...comment,
          username: socket.username,
          user_id: socket.userId
        }
      });
    });

    // 댓글 수정 이벤트 브로드캐스트
    socket.on('comment-updated', (data) => {
      const { sceneId, comment } = data;
      socket.to(`scene-${sceneId}`).emit('comment-updated', {
        comment: {
          ...comment,
          username: socket.username,
          user_id: socket.userId
        }
      });
    });

    // 댓글 삭제 이벤트 브로드캐스트
    socket.on('comment-deleted', (data) => {
      const { sceneId, commentId } = data;
      socket.to(`scene-${sceneId}`).emit('comment-deleted', {
        commentId,
        deletedBy: socket.username
      });
    });

    // 댓글 해결 상태 변경 이벤트
    socket.on('comment-resolved', (data) => {
      const { sceneId, commentId, resolved } = data;
      socket.to(`scene-${sceneId}`).emit('comment-resolved', {
        commentId,
        resolved,
        resolvedBy: socket.username
      });
    });

    // 주석 추가/업데이트 이벤트
    socket.on('annotation-updated', (data) => {
      const { sceneId, commentId, annotationData } = data;
      socket.to(`scene-${sceneId}`).emit('annotation-updated', {
        commentId,
        annotationData,
        updatedBy: socket.username
      });
    });

    // 사용자 타이핑 표시
    socket.on('typing', (data) => {
      const { sceneId, isTyping } = data;
      socket.to(`scene-${sceneId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping
      });
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.username} disconnected`);
    });
  });
}
