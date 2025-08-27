import React, { useRef, useEffect } from 'react';
import { 
  Upload, MessageCircle, Check, ChevronLeft, ChevronRight, 
  MoreHorizontal, Send, Image, Download, Eye, AlertCircle, CheckCircle, 
  ArrowLeft, Share2, Bell, Edit2, X, Reply
} from 'lucide-react';
import SketchCanvas from './SketchCanvas';

interface SceneViewProps {
  storyboard: any;
  setStoryboard: (storyboard: any) => void;
  currentScene: number;
  setCurrentScene: (scene: number) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  comments: any[];
  setComments: (comments: any[]) => void;
  notifications: number;
  setNotifications: (notifications: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showSketch: boolean;
  setShowSketch: (show: boolean) => void;
  showArtwork: boolean;
  setShowArtwork: (show: boolean) => void;
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  showSketchCanvas: boolean;
  setShowSketchCanvas: (show: boolean) => void;
  pendingSketch: string | null;
  setPendingSketch: (sketch: string | null) => void;
  selectedCommentId: number | null;
  setSelectedCommentId: (id: number | null) => void;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
}
const SceneView: React.FC<SceneViewProps> = (props) => {
  const { 
    storyboard, setStoryboard, currentScene, setCurrentScene,
    currentView, setCurrentView, comments, setComments,
    notifications, setNotifications, activeTab, setActiveTab,
    showSketch, setShowSketch, showArtwork, setShowArtwork,
    compareMode, setCompareMode, showSketchCanvas, setShowSketchCanvas,
    pendingSketch, setPendingSketch, selectedCommentId, setSelectedCommentId,
    replyTo, setReplyTo, replyText, setReplyText, newComment, setNewComment
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setComments([
      {
        id: 1,
        sceneId: 1,
        author: "김그림",
        avatar: "김",
        time: "오후 2:13",
        content: "초안 확인했습니다. 전체적인 구도는 좋은 것 같아요!",
        type: "general",
        resolved: false,
        sketchData: null,
        parentId: null,
        replies: []
      }
    ]);
  }, [currentScene, setComments]);

  const currentSceneData = storyboard.scenes?.[currentScene] || {};
  const filteredComments = comments.filter(c => c.sceneId === currentSceneData.id && !c.parentId);

  const getStatusStyle = (status: string) => {
    const styles: Record<string, any> = {
      'waiting_sketch': { bg: 'bg-gray-100', text: 'text-gray-600', label: '초안 대기' },
      'sketch_uploaded': { bg: 'bg-blue-100', text: 'text-blue-600', label: '초안 완료' },
      'artwork_uploaded': { bg: 'bg-yellow-100', text: 'text-yellow-600', label: '아트워크 검토중' },
      'feedback_requested': { bg: 'bg-orange-100', text: 'text-orange-600', label: '수정 요청' },
      'approved': { bg: 'bg-green-100', text: 'text-green-600', label: '승인 완료' },
      'in_progress': { bg: 'bg-purple-100', text: 'text-purple-600', label: '작업 중' },
      'review': { bg: 'bg-indigo-100', text: 'text-indigo-600', label: '검토 중' }
    };
    return styles[status] || styles['waiting_sketch'];
  };

  return <div>Scene View Component</div>;
};

export default SceneView;
