import { useState, useCallback, useMemo } from 'react';
import { commentsApi } from '@/lib/api';

export type CommentTag = 'revision' | 'comment' | 'annotation';

export interface Comment {
  id: number;
  sceneId: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  type: CommentTag;
  resolved: boolean;
  replies?: Reply[];
  sketchData?: string | null;
  annotationData?: string | null;
  imageType?: 'sketch' | 'artwork' | null;
}

export interface Reply {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

export const useComments = (initialComments: Comment[] = []) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentFilter, setCommentFilter] = useState<CommentTag | 'all'>('all');

  const addComment = useCallback(async (comment: Omit<Comment, 'id' | 'time'>) => {
    try {
      const token = localStorage.getItem('token');
      
      if (token && !token.startsWith('demo-')) {
        // 백엔드 API 호출
        const response = await commentsApi.createComment({
          scene_id: comment.sceneId,
          content: comment.content,
          parent_id: null,
          type: comment.type,
          sketchData: comment.sketchData,
          annotationData: comment.annotationData,
          imageType: comment.imageType
        });
        
        const newComment: Comment = {
          ...comment,
          id: response.id,
          time: '방금',
        };
        setComments(prev => [...prev, newComment]);
        return newComment;
      } else {
        // 데모 모드: 로컬 처리
        const newComment: Comment = {
          ...comment,
          id: Date.now(),
          time: '방금',
        };
        setComments(prev => [...prev, newComment]);
        return newComment;
      }
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      // 에러 발생 시에도 로컬에서 처리
      const newComment: Comment = {
        ...comment,
        id: Date.now(),
        time: '방금',
      };
      setComments(prev => [...prev, newComment]);
      return newComment;
    }
  }, []);

  const addReply = useCallback(async (commentId: number, replyContent: string) => {
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      
      if (token && !token.startsWith('demo-')) {
        // 백엔드 API 호출
        const response = await commentsApi.createComment({
          scene_id: comments.find(c => c.id === commentId)?.sceneId || 0,
          content: replyContent,
          parent_id: commentId
        });
        
        const reply: Reply = {
          id: response.id,
          author: '나',
          avatar: 'ME',
          content: replyContent,
          time: '방금',
        };

        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            };
          }
          return comment;
        }));
      } else {
        // 데모 모드: 로컬 처리
        const reply: Reply = {
          id: Date.now(),
          author: '나',
          avatar: 'ME',
          content: replyContent,
          time: '방금',
        };

        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('답글 추가 실패:', error);
      // 에러 발생 시에도 로컬에서 처리
      const reply: Reply = {
        id: Date.now(),
        author: '나',
        avatar: 'ME',
        content: replyContent,
        time: '방금',
      };

      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        return comment;
      }));
    }
  }, [comments]);

  const toggleResolve = useCallback((commentId: number) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId 
        ? { ...comment, resolved: !comment.resolved }
        : comment
    ));
  }, []);

  const getFilteredComments = useCallback((sceneId: number) => {
    return comments.filter(comment => {
      const matchesScene = comment.sceneId === sceneId;
      const matchesFilter = commentFilter === 'all' || comment.type === commentFilter;
      return matchesScene && matchesFilter;
    });
  }, [comments, commentFilter]);

  return {
    comments,
    setComments,
    addComment,
    addReply,
    toggleResolve,
    replyTo,
    setReplyTo,
    replyText,
    setReplyText,
    commentFilter,
    setCommentFilter,
    getFilteredComments,
  };
};
