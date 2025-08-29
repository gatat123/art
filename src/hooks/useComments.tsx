import { useState, useCallback, useMemo } from 'react';

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

  const addComment = useCallback((comment: Omit<Comment, 'id' | 'time'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now(),
      time: '방금',
    };
    setComments(prev => [...prev, newComment]);
    return newComment;
  }, []);

  const addReply = useCallback((commentId: number, replyContent: string) => {
    if (!replyContent.trim()) return;

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
  }, []);

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
