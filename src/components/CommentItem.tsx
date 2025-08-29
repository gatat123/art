import React, { memo } from 'react';
import { MessageCircle, Check, X, Reply, Brush, Edit2, Tag, Clock, Send } from 'lucide-react';
import { Comment, CommentTag } from '@/hooks/useComments';

interface CommentItemProps {
  comment: Comment;
  onToggleResolve: (commentId: number) => void;
  onToggleSketchOverlay: (commentId: number) => void;
  onToggleAnnotationOverlay: (commentId: number) => void;
  onReply: (commentId: number) => void;
  isSelected: boolean;
  showSketchOverlay: boolean;
  showAnnotationOverlay: boolean;
  replyTo: number | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onAddReply: (commentId: number, text: string) => void;
  onCancelReply: () => void;
}

export const CommentItem = memo<CommentItemProps>(({
  comment,
  onToggleResolve,
  onToggleSketchOverlay,
  onToggleAnnotationOverlay,
  onReply,
  isSelected,
  showSketchOverlay,
  showAnnotationOverlay,
  replyTo,
  replyText,
  onReplyTextChange,
  onAddReply,
  onCancelReply,
}) => {
  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onAddReply(comment.id, replyText);
      onCancelReply();
    }
  };

  return (
    <div className="space-y-2">
      <div className={`flex space-x-3 p-2 rounded ${isSelected ? 'bg-gray-100' : ''}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
          {comment.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">{comment.author}</span>
            <span className="text-xs text-gray-400">{comment.time}</span>
            
            {comment.type === 'revision' && (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded">
                수정요청
              </span>
            )}
            
            {comment.type === 'annotation' && (
              <button
                onClick={() => onToggleAnnotationOverlay(comment.id)}
                className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded flex items-center space-x-1"
              >
                <Brush size={10} />
                <span>{comment.imageType === 'sketch' ? '초안' : '아트워크'} 주석</span>
              </button>
            )}
            
            {comment.resolved && (
              <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded">
                해결됨
              </span>
            )}
            
            {comment.sketchData && (
              <button
                onClick={() => onToggleSketchOverlay(comment.id)}
                className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded flex items-center space-x-1"
              >
                <Brush size={10} />
                <span>{comment.imageType === 'sketch' ? '초안' : '아트워크'} 스케치</span>
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-700">{comment.content}</p>
          
          {showSketchOverlay && comment.sketchData && (
            <div className="mt-2 p-2 bg-purple-50 rounded">
              <img
                src={comment.sketchData}
                alt="스케치"
                className="w-full rounded"
              />
              <p className="text-xs text-purple-600 mt-1 text-center">
                {comment.imageType === 'sketch' ? '초안' : '아트워크'}에 대한 스케치
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-3 mt-2">
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-400 hover:text-black flex items-center space-x-1"
            >
              <Reply size={12} />
              <span>답글</span>
            </button>
            {!comment.resolved && (
              <button
                onClick={() => onToggleResolve(comment.id)}
                className="text-xs text-gray-400 hover:text-green-600 flex items-center gap-1"
              >
                <Check size={12} />
                해결
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                {reply.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-xs">{reply.author}</span>
                  <span className="text-xs text-gray-400">{reply.time}</span>
                </div>
                <p className="text-xs text-gray-700">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {replyTo === comment.id && (
        <div className="ml-11 flex space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleReplySubmit();
              }
            }}
            placeholder="답글을 입력하세요..."
            className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-black"
            autoFocus
          />
          <button
            onClick={handleReplySubmit}
            className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
          >
            <Send size={14} />
          </button>
          <button
            onClick={onCancelReply}
            className="px-2 py-1 text-gray-400 hover:text-black"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
});

CommentItem.displayName = 'CommentItem';
