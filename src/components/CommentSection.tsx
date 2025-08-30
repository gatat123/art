import React from 'react';
import { MessageCircle, Tag, Edit2, Clock, Send, Brush, X } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { Comment, CommentTag } from '@/hooks/useComments';

interface CommentSectionProps {
  comments: Comment[];
  currentScene: number;
  selectedCommentType: CommentTag;
  setSelectedCommentType: (type: CommentTag) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  pendingSketch: string | null;
  setPendingSketch: (sketch: string | null) => void;
  imageViewMode: 'sketch' | 'artwork' | null;
  onAddComment: () => void;
  onToggleResolve: (commentId: number) => void;
  selectedCommentId: number | null;
  setSelectedCommentId: (id: number | null) => void;
  showSketchOverlay: number | null;
  setShowSketchOverlay: (id: number | null) => void;
  showAnnotationOverlay: number | null;
  setShowAnnotationOverlay: (id: number | null) => void;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onAddReply: (commentId: number, text: string) => void;
  onShowSketchCanvas: () => void;
  commentFilter: CommentTag | 'all';
  setCommentFilter: (filter: CommentTag | 'all') => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentScene,
  selectedCommentType,
  setSelectedCommentType,
  newComment,
  setNewComment,
  pendingSketch,
  setPendingSketch,
  imageViewMode,
  onAddComment,
  onToggleResolve,
  selectedCommentId,
  setSelectedCommentId,
  showSketchOverlay,
  setShowSketchOverlay,
  showAnnotationOverlay,
  setShowAnnotationOverlay,
  replyTo,
  setReplyTo,
  replyText,
  setReplyText,
  onAddReply,
  onShowSketchCanvas,
  commentFilter,
  setCommentFilter,
}) => {
  // Remove the filter logic here since it's already filtered in the parent
  const filteredComments = comments;

  const toggleSketchOverlay = (commentId: number) => {
    setShowSketchOverlay(showSketchOverlay === commentId ? null : commentId);
    setSelectedCommentId(selectedCommentId === commentId ? null : commentId);
  };

  const toggleAnnotationOverlay = (commentId: number) => {
    setShowAnnotationOverlay(showAnnotationOverlay === commentId ? null : commentId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex space-x-6">
          <button className="pb-2 text-sm font-medium text-black border-b-2 border-black">
            댓글 ({filteredComments.length})
          </button>
        </div>

        {/* 댓글 필터 */}
        {filteredComments.length > 0 && (
          <div className="flex items-center space-x-2">
            <Tag size={16} className="text-gray-400" />
            <select
              className="text-sm border-0 focus:outline-none text-gray-600"
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value as CommentTag | 'all')}
            >
              <option value="all">모든 댓글</option>
              <option value="comment">일반 댓글</option>
              <option value="revision">수정요청</option>
              <option value="annotation">주석</option>
            </select>
          </div>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle size={32} className="mx-auto mb-2" />
              <p>{commentFilter === 'all' ? '아직 댓글이 없습니다' : '해당 유형의 댓글이 없습니다'}</p>
            </div>
          ) : (
            filteredComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onToggleResolve={onToggleResolve}
                onToggleSketchOverlay={toggleSketchOverlay}
                onToggleAnnotationOverlay={toggleAnnotationOverlay}
                onReply={setReplyTo}
                isSelected={selectedCommentId === comment.id}
                showSketchOverlay={showSketchOverlay === comment.id}
                showAnnotationOverlay={showAnnotationOverlay === comment.id}
                replyTo={replyTo}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onAddReply={onAddReply}
                onCancelReply={() => setReplyTo(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* 댓글 입력 */}
      <div className="border-t border-gray-200 p-4 space-y-3 flex-shrink-0">
        {/* 태그 선택 버튼 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">태그:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCommentType('comment')}
              className={`px-3 py-1 text-sm rounded ${
                selectedCommentType === 'comment'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageCircle size={14} className="inline mr-1" />
              일반 댓글
            </button>
            <button
              onClick={() => setSelectedCommentType('revision')}
              className={`px-3 py-1 text-sm rounded ${
                selectedCommentType === 'revision'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Edit2 size={14} className="inline mr-1" />
              수정요청
            </button>
          </div>
        </div>

        {pendingSketch && (
          <div className="p-2 bg-purple-50 rounded flex items-center justify-between">
            <span className="text-xs text-purple-600">
              {imageViewMode === 'sketch' ? '초안' : '아트워크'}에 스케치가 추가됨
            </span>
            <button onClick={() => setPendingSketch(null)} className="text-purple-600 hover:text-purple-800">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onShowSketchCanvas}
            className="p-2 hover:bg-gray-100 rounded"
            title="스케치 추가"
          >
            <Brush size={20} />
          </button>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-black"
          />
          <button
            onClick={onAddComment}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
