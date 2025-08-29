import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Upload, MessageCircle, Check, ChevronLeft, ChevronRight, 
  MoreHorizontal, Send, Image, Download, Eye, AlertCircle, CheckCircle, 
  ArrowLeft, Share2, Bell, Edit2, X, Reply, Brush, Plus, CheckCheck, Tag,
  History, Clock, ChevronDown, Camera
} from 'lucide-react';
import SketchCanvas from './SketchCanvas';
import AnnotationCanvas from './AnnotationCanvas';
import { CommentSection } from './CommentSection';
import { useComments } from '@/hooks/useComments';

type ViewType = 'login' | 'studios' | 'project' | 'scene';
type ImageViewMode = 'sketch' | 'artwork' | null;

interface Version {
  id: string;
  type: 'sketch' | 'artwork';
  url: string;
  timestamp: string;
  author: string;
  message?: string;
  isCurrent?: boolean;
}

interface SceneViewProps {
  storyboard: any;
  setStoryboard: (storyboard: any) => void;
  currentScene: number;
  setCurrentScene: (scene: number) => void;
  currentView: string;
  setCurrentView: (view: ViewType) => void;
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
    currentView, setCurrentView, comments: propsComments, setComments: setPropsComments,
    notifications, setNotifications, activeTab, setActiveTab,
    showSketch, setShowSketch, showArtwork, setShowArtwork,
    compareMode, setCompareMode, showSketchCanvas, setShowSketchCanvas,
    pendingSketch, setPendingSketch, selectedCommentId, setSelectedCommentId,
    replyTo: propsReplyTo, setReplyTo: setPropsReplyTo, 
    replyText: propsReplyText, setReplyText: setPropsReplyText,
    newComment, setNewComment
  } = props;

  // 파일 업로드를 위한 ref
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  // 버전 관리 상태
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [imageViewMode, setImageViewMode] = useState<ImageViewMode>('sketch');
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotations, setAnnotations] = useState<{[key: string]: any}>({});
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newSceneDescription, setNewSceneDescription] = useState('');
  const [showSketchOverlay, setShowSketchOverlay] = useState<number | null>(null);
  const [showAnnotationOverlay, setShowAnnotationOverlay] = useState<number | null>(null);
  const [selectedCommentType, setSelectedCommentType] = useState<'comment' | 'revision' | 'annotation'>('comment');
  const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({});

  // useComments 훅 사용
  const {
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
    getFilteredComments
  } = useComments(propsComments);

  // props와 동기화
  useEffect(() => {
    setPropsComments(comments);
  }, [comments, setPropsComments]);

  useEffect(() => {
    setPropsReplyTo(replyTo);
  }, [replyTo, setPropsReplyTo]);

  useEffect(() => {
    setPropsReplyText(replyText);
  }, [replyText, setPropsReplyText]);

  // 메모이제이션된 현재 씬 데이터
  const currentSceneData = useMemo(() => {
    return storyboard?.scenes?.[currentScene] || {
      title: '씬 1',
      description: '씬 설명',
      narration: '나레이션 내용',
      sound: '사운드 효과',
      status: 'draft_pending',
      sketchUrl: null,
      artworkUrl: null,
      feedback: []
    };
  }, [storyboard, currentScene]);

  // 필터링된 댓글
  const filteredComments = useMemo(() => 
    getFilteredComments(currentScene), 
    [currentScene, getFilteredComments]
  );

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + / : 비교 모드 토글
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setCompareMode(!compareMode);
        if (!compareMode) {
          setShowSketch(true);
          setShowArtwork(true);
        }
      }
      // Ctrl + B : 주석 모드 토글
      if (e.ctrlKey && e.key === 'b' && !compareMode) {
        e.preventDefault();
        setShowAnnotation(!showAnnotation);
      }
      // Ctrl + S : 저장 (나중에 구현)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        console.log('Save functionality to be implemented');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compareMode, showAnnotation, setCompareMode, setShowSketch, setShowArtwork]);

  // 파일 업로드 핸들러
  const handleSketchUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const updatedScenes = [...(storyboard.scenes || [])];
        updatedScenes[currentScene] = {
          ...updatedScenes[currentScene],
          sketchUrl: url
        };
        setStoryboard({ ...storyboard, scenes: updatedScenes });
        setImageLoadError({ ...imageLoadError, sketch: false });
        
        // 버전 히스토리에 추가
        const newVersion: Version = {
          id: `v${versions.length + 1}`,
          type: 'sketch',
          url: url,
          timestamp: new Date().toLocaleString('ko-KR'),
          author: '나',
          message: '초안 업로드',
          isCurrent: true
        };
        setVersions([...versions.map(v => ({ ...v, isCurrent: false })), newVersion]);
      };
      reader.readAsDataURL(file);
    }
  }, [storyboard, currentScene, setStoryboard, versions, imageLoadError]);

  const handleArtworkUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const updatedScenes = [...(storyboard.scenes || [])];
        updatedScenes[currentScene] = {
          ...updatedScenes[currentScene],
          artworkUrl: url
        };
        setStoryboard({ ...storyboard, scenes: updatedScenes });
        setImageLoadError({ ...imageLoadError, artwork: false });
        
        // 버전 히스토리에 추가
        const newVersion: Version = {
          id: `v${versions.length + 1}`,
          type: 'artwork',
          url: url,
          timestamp: new Date().toLocaleString('ko-KR'),
          author: '나',
          message: '아트워크 업로드',
          isCurrent: true
        };
        setVersions([...versions.map(v => ({ ...v, isCurrent: false })), newVersion]);
      };
      reader.readAsDataURL(file);
    }
  }, [storyboard, currentScene, setStoryboard, versions, imageLoadError]);

  const handleAddComment = useCallback(() => {
    if (newComment.trim() || pendingSketch) {
      const comment = {
        sceneId: currentScene,
        author: '나',
        avatar: 'ME',
        content: newComment,
        type: selectedCommentType,
        resolved: false,
        replies: [],
        sketchData: pendingSketch,
        imageType: pendingSketch ? imageViewMode : null
      };
      addComment(comment);
      setNewComment('');
      setPendingSketch(null);
      setSelectedCommentType('comment'); // 기본값으로 리셋
    }
  }, [newComment, pendingSketch, currentScene, selectedCommentType, imageViewMode, addComment, setNewComment, setPendingSketch]);

  // 주석 저장 시 댓글로 자동 추가
  const handleAnnotationSave = useCallback((annotationData: string, comment: string) => {
    const key = `scene_${currentScene}_${imageViewMode}`;
    setAnnotations({...annotations, [key]: annotationData});
    
    // 댓글로 자동 추가
    const annotationComment = {
      sceneId: currentScene,
      author: '나',
      avatar: 'ME',
      content: comment,
      type: 'annotation' as const,
      resolved: false,
      replies: [],
      annotationData: annotationData,
      imageType: imageViewMode
    };
    addComment(annotationComment);
    setShowAnnotation(false);
  }, [currentScene, imageViewMode, annotations, addComment]);

  const handleImageViewModeChange = useCallback((mode: ImageViewMode) => {
    setImageViewMode(mode);
    if (mode === 'sketch') {
      setShowSketch(true);
      setShowArtwork(false);
    } else if (mode === 'artwork') {
      setShowSketch(false);
      setShowArtwork(true);
    }
  }, [setShowSketch, setShowArtwork]);

  const handleVersionSelect = useCallback((version: Version) => {
    setSelectedVersion(version);
    const updatedScenes = [...(storyboard.scenes || [])];
    if (version.type === 'sketch') {
      updatedScenes[currentScene] = {
        ...updatedScenes[currentScene],
        sketchUrl: version.url
      };
    } else {
      updatedScenes[currentScene] = {
        ...updatedScenes[currentScene],
        artworkUrl: version.url
      };
    }
    setStoryboard({ ...storyboard, scenes: updatedScenes });
    setShowVersionHistory(false);
  }, [storyboard, currentScene, setStoryboard]);

  const handleAddScene = useCallback(() => {
    if (newSceneTitle.trim()) {
      const newScene = {
        id: storyboard.scenes.length + 1,
        title: newSceneTitle,
        description: newSceneDescription || '',
        narration: '',
        sound: '',
        status: 'draft_pending',
        sketchUrl: null,
        artworkUrl: null,
        feedback: []
      };
      const updatedScenes = [...(storyboard.scenes || []), newScene];
      setStoryboard({
        ...storyboard,
        scenes: updatedScenes
      });
      setCurrentScene(updatedScenes.length - 1);
      setNewSceneTitle('');
      setNewSceneDescription('');
      setShowAddSceneModal(false);
    }
  }, [newSceneTitle, newSceneDescription, storyboard, setStoryboard, setCurrentScene]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 숨겨진 파일 업로드 인풋 */}
      <input
        ref={sketchInputRef}
        type="file"
        accept="image/*"
        onChange={handleSketchUpload}
        className="hidden"
      />
      <input
        ref={artworkInputRef}
        type="file"
        accept="image/*"
        onChange={handleArtworkUpload}
        className="hidden"
      />
      {/* 스케치 캔버스 모달 */}
      {showSketchCanvas && !compareMode && (
        <SketchCanvas
          imageUrl={imageViewMode === 'sketch' ? currentSceneData.sketchUrl : currentSceneData.artworkUrl}
          onSave={(sketchData) => {
            setPendingSketch(sketchData);
            setShowSketchCanvas(false);
          }}
          onClose={() => setShowSketchCanvas(false)}
        />
      )}

      {/* 주석 캔버스 */}
      {showAnnotation && !compareMode && (
        <AnnotationCanvas
          imageUrl={imageViewMode === 'sketch' ? currentSceneData.sketchUrl : currentSceneData.artworkUrl}
          onSave={handleAnnotationSave}
          onClose={() => setShowAnnotation(false)}
        />
      )}

      {/* 씬 추가 모달 */}
      {showAddSceneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">새 씬 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">씬 제목</label>
                <input
                  type="text"
                  value={newSceneTitle}
                  onChange={(e) => setNewSceneTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="씬 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">씬 설명</label>
                <textarea
                  value={newSceneDescription}
                  onChange={(e) => setNewSceneDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  placeholder="씬 설명을 입력하세요"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddSceneModal(false);
                  setNewSceneTitle('');
                  setNewSceneDescription('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                취소
              </button>
              <button
                onClick={handleAddScene}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 단축키 안내 툴팁 */}
      <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs space-y-1 opacity-0 hover:opacity-100 transition-opacity">
        <p>단축키 안내</p>
        <p>Ctrl + / : 비교 모드</p>
        <p>Ctrl + B : 주석 모드</p>
        <p>Ctrl + S : 저장 (준비중)</p>
      </div>
    </div>
  );
};

export default SceneView;