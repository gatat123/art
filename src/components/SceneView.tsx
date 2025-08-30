import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Upload, MessageCircle, Check, ChevronLeft, ChevronRight, 
  MoreHorizontal, Send, Image, Download, Eye, AlertCircle, CheckCircle, 
  ArrowLeft, Share2, Bell, Edit2, X, Reply, Brush, Plus, CheckCheck, Tag,
  History, Clock, ChevronDown, Camera, Expand
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
  onSceneCountUpdate?: (projectId: number, newCount: number) => void;
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
    newComment, setNewComment, onSceneCountUpdate
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
  const [editingInfo, setEditingInfo] = useState(false);
  const [editedSceneInfo, setEditedSceneInfo] = useState({
    title: '',
    description: '',
    narration: '',
    sound: ''
  });
  
  // 이미지 확대 관련 상태
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomImageType, setZoomImageType] = useState<'sketch' | 'artwork' | null>(null);
  const [showSketchOverlay, setShowSketchOverlay] = useState<number | null>(null);
  const [showAnnotationOverlay, setShowAnnotationOverlay] = useState<number | null>(null);
  const [activityLog, setActivityLog] = useState<Array<{id: number; type: string; user: string; time: string; content: string}>>([]);
  const [selectedCommentType, setSelectedCommentType] = useState<'comment' | 'revision' | 'annotation'>('comment');
  const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({});

  // 활동 로그 추가 함수 - 다른 함수들보다 먼저 정의
  const addActivity = useCallback((type: string, content: string) => {
    const activity = {
      id: Date.now(),
      type,
      user: '나',
      time: new Date().toLocaleString('ko-KR'),
      content
    };
    setActivityLog(prev => [activity, ...prev]);
  }, []);

  // 스케치/주석 오버레이 토글 함수
  const toggleSketchOverlay = useCallback((commentId: number) => {
    setShowSketchOverlay(showSketchOverlay === commentId ? null : commentId);
    setSelectedCommentId(selectedCommentId === commentId ? null : commentId);
  }, [showSketchOverlay, selectedCommentId]);

  const toggleAnnotationOverlay = useCallback((commentId: number) => {
    setShowAnnotationOverlay(showAnnotationOverlay === commentId ? null : commentId);
  }, [showAnnotationOverlay]);

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

  // 씬 삭제 함수
  const handleDeleteScene = useCallback(async (sceneId: number) => {
    if (!confirm('정말로 이 씬을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      // 로컬 상태 업데이트
      const updatedScenes = storyboard.scenes.filter((_: any, index: number) => index !== sceneId);
      setStoryboard({ ...storyboard, scenes: updatedScenes });
      
      // 현재 씬이 삭제된 경우 다른 씬으로 이동
      if (currentScene === sceneId) {
        setCurrentScene(Math.max(0, sceneId - 1));
      } else if (currentScene > sceneId) {
        setCurrentScene(currentScene - 1);
      }
      
      // 활동 기록 추가
      addActivity('delete_scene', `씬 ${sceneId + 1}이(가) 삭제되었습니다`);
      
      // 프로젝트의 씬 카운트 업데이트
      if (onSceneCountUpdate && storyboard.id) {
        onSceneCountUpdate(storyboard.id, updatedScenes.length);
      }
    } catch (error) {
      console.error('씬 삭제 실패:', error);
      alert('씬 삭제 중 오류가 발생했습니다.');
    }
  }, [storyboard, currentScene, setStoryboard, setCurrentScene, addActivity, onSceneCountUpdate]);

  // 씬 완료 처리 함수
  const handleSceneComplete = useCallback(async (sceneId: number) => {
    try {
      const updatedScenes = [...(storyboard.scenes || [])];
      const newStatus = updatedScenes[sceneId].status === 'completed' ? 'in_progress' : 'completed';
      
      updatedScenes[sceneId] = {
        ...updatedScenes[sceneId],
        status: newStatus
      };
      
      setStoryboard({ ...storyboard, scenes: updatedScenes });
      
      // 활동 기록
      addActivity(
        newStatus === 'completed' ? 'complete_scene' : 'reopen_scene',
        `씬 ${sceneId + 1} ${newStatus === 'completed' ? '완료됨' : '재진행'}`
      );
    } catch (error) {
      console.error('씬 상태 업데이트 실패:', error);
    }
  }, [storyboard, setStoryboard, addActivity]);

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
        addActivity('upload', '초안 이미지가 업로드되었습니다');
      };
      reader.readAsDataURL(file);
    }
  }, [storyboard, currentScene, setStoryboard, versions, imageLoadError, addActivity]);

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
        addActivity('upload', '아트워크 이미지가 업로드되었습니다');
      };
      reader.readAsDataURL(file);
    }
  }, [storyboard, currentScene, setStoryboard, versions, imageLoadError, addActivity]);

  // 이미지 확대 핸들러
  const handleImageZoom = useCallback((imageUrl: string | null, imageType: 'sketch' | 'artwork') => {
    if (imageUrl) {
      setZoomImageUrl(imageUrl);
      setZoomImageType(imageType);
      setShowZoomModal(true);
    }
  }, []);

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
      
      // 스케치 데이터가 있으면 실제 이미지로 저장
      if (pendingSketch && imageViewMode) {
        const updatedScenes = [...(storyboard.scenes || [])];
        if (imageViewMode === 'sketch') {
          updatedScenes[currentScene] = {
            ...updatedScenes[currentScene],
            sketchUrl: pendingSketch
          };
          addActivity('sketch', '초안에 스케치가 추가되었습니다');
        } else {
          updatedScenes[currentScene] = {
            ...updatedScenes[currentScene],
            artworkUrl: pendingSketch
          };
          addActivity('artwork', '아트워크에 스케치가 추가되었습니다');
        }
        setStoryboard({ ...storyboard, scenes: updatedScenes });
      }
      
      addActivity('comment', `${selectedCommentType === 'revision' ? '수정요청' : selectedCommentType === 'annotation' ? '주석' : '댓글'}이 추가되었습니다`);
      setNewComment('');
      setPendingSketch(null);
      setSelectedCommentType('comment'); // 기본값으로 리셋
    }
  }, [newComment, pendingSketch, currentScene, selectedCommentType, imageViewMode, addComment, setNewComment, setPendingSketch, storyboard, setStoryboard, addActivity]);

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
    addActivity('annotation', `${imageViewMode === 'sketch' ? '초안' : '아트워크'}에 주석이 추가되었습니다`);
    setShowAnnotation(false);
  }, [currentScene, imageViewMode, annotations, addComment, addActivity]);

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
      
      // 프로젝트의 씬 카운트 업데이트
      if (onSceneCountUpdate && storyboard.id) {
        onSceneCountUpdate(storyboard.id, updatedScenes.length);
      }
    }
  }, [newSceneTitle, newSceneDescription, storyboard, setStoryboard, setCurrentScene, onSceneCountUpdate]);

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

      {/* 왼쪽 패널 - 씬 리스트 */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={() => setCurrentView('project' as ViewType)}
            className="flex items-center space-x-2 text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} />
            <span>프로젝트로 돌아가기</span>
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold mb-4">씬 목록</h3>
          <div className="space-y-2">
            {storyboard?.scenes?.map((scene: any, index: number) => {
              // 해당 씬에 수정요청 댓글이 있는지 확인
              const hasRevisionRequest = comments.some(
                comment => comment.sceneId === index && comment.type === 'revision' && !comment.resolved
              );
              
              return (
                <div key={index} className="relative group">
                  <button
                    onClick={() => setCurrentScene(index)}
                    className={`w-full text-left p-3 rounded-lg ${
                      currentScene === index 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">씬 {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        {hasRevisionRequest && (
                          <span 
                            className="w-2 h-2 bg-red-500 rounded-full animate-pulse" 
                            title="수정요청이 있습니다" 
                          />
                        )}
                        {scene.status === 'completed' && (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs opacity-75 mt-1">{scene.title}</p>
                  </button>
                  
                  {/* 삭제 버튼 - 호버 시에만 표시 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScene(index);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    title="씬 삭제"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
            
            <button 
              onClick={() => setShowAddSceneModal(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-black text-gray-500 hover:text-black flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>씬 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col relative">
        {/* 상단 툴바 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">씬 {currentScene + 1}: {currentSceneData.title}</h2>
            
            {/* 완료 버튼 */}
            <button
              onClick={() => handleSceneComplete(currentScene)}
              className={`px-3 py-1 rounded text-sm ${
                currentSceneData.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {currentSceneData.status === 'completed' ? '✓ 완료됨' : '완료'}
            </button>
            
            {/* 버전 히스토리 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                title="버전 히스토리 보기"
              >
                <History size={16} />
                <span className="text-sm">버전 히스토리</span>
                <ChevronDown size={16} className={`transform transition-transform ${showVersionHistory ? 'rotate-180' : ''}`} />
              </button>

              {/* 버전 히스토리 드롭다운 */}
              {showVersionHistory && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-sm">버전 히스토리</h3>
                  </div>
                  
                  {versions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      아직 버전 히스토리가 없습니다
                    </div>
                  ) : (
                    <>
                      {/* 초안 버전 섹션 */}
                      <div className="p-2">
                        <div className="text-xs text-gray-500 font-medium mb-2">초안</div>
                        {versions.filter(v => v.type === 'sketch').length === 0 ? (
                          <p className="text-xs text-gray-400 px-3 py-2">버전 없음</p>
                        ) : (
                          versions.filter(v => v.type === 'sketch').map((version) => (
                            <button
                              key={version.id}
                              onClick={() => handleVersionSelect(version)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm ${
                                version.isCurrent ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>v{version.id.slice(1)}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(version.timestamp).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">{version.author}</div>
                              {version.isCurrent && (
                                <span className="text-xs text-blue-600 font-medium">현재 버전</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                      
                      {/* 아트워크 버전 섹션 */}
                      <div className="p-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 font-medium mb-2">아트워크</div>
                        {versions.filter(v => v.type === 'artwork').length === 0 ? (
                          <p className="text-xs text-gray-400 px-3 py-2">버전 없음</p>
                        ) : (
                          versions.filter(v => v.type === 'artwork').map((version) => (
                            <button
                              key={version.id}
                              onClick={() => handleVersionSelect(version)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm ${
                                version.isCurrent ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>v{version.id.slice(1)}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(version.timestamp).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">{version.author}</div>
                              {version.isCurrent && (
                                <span className="text-xs text-green-600 font-medium">현재 버전</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 이미지 뷰 토글 */}
            <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="imageView"
                  checked={imageViewMode === 'sketch'}
                  onChange={() => handleImageViewModeChange('sketch')}
                  className="sr-only"
                />
                <span className={`px-3 py-1 rounded text-sm ${
                  imageViewMode === 'sketch' ? 'bg-white shadow' : ''
                }`}>
                  초안
                </span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="imageView"
                  checked={imageViewMode === 'artwork'}
                  onChange={() => handleImageViewModeChange('artwork')}
                  className="sr-only"
                />
                <span className={`px-3 py-1 rounded text-sm ${
                  imageViewMode === 'artwork' ? 'bg-white shadow' : ''
                }`}>
                  아트워크
                </span>
              </label>
            </div>

            {/* 비교 모드 토글 */}
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (!compareMode) {
                  setShowSketch(true);
                  setShowArtwork(true);
                }
              }}
              className={`px-4 py-2 rounded ${
                compareMode ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              <Eye size={16} className="inline mr-2" />
              비교 모드
            </button>

            {/* 주석 토글 */}
            {!compareMode && (
              <button
                onClick={() => setShowAnnotation(!showAnnotation)}
                className={`px-4 py-2 rounded ${
                  showAnnotation ? 'bg-purple-500 text-white' : 'bg-gray-100'
                }`}
              >
                <Brush size={16} className="inline mr-2" />
                주석
              </button>
            )}
          </div>
        </div>

        {/* 메인 이미지 영역 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* 이미지 뷰어 */}
            <div className="flex-1 relative bg-gray-100 overflow-hidden">
              {compareMode ? (
                // 비교 모드
                <div className="flex h-full">
                  <div className="flex-1 relative">
                    <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 rounded text-sm z-10">
                      초안
                    </div>
                    {currentSceneData.sketchUrl && (
                      <button
                        onClick={() => handleImageZoom(currentSceneData.sketchUrl, 'sketch')}
                        className="absolute top-4 left-20 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-lg shadow-md z-10"
                        title="이미지 확대"
                      >
                        <Expand size={16} />
                      </button>
                    )}
                    {currentSceneData.sketchUrl ? (
                      <img 
                        src={currentSceneData.sketchUrl} 
                        alt="스케치" 
                        className="w-full h-full object-contain"
                        onError={() => setImageLoadError({ ...imageLoadError, sketchCompare: true })}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <Upload size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-400">초안 없음</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-px bg-gray-300" />
                  <div className="flex-1 relative">
                    <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded text-sm z-10">
                      아트워크
                    </div>
                    {currentSceneData.artworkUrl && (
                      <button
                        onClick={() => handleImageZoom(currentSceneData.artworkUrl, 'artwork')}
                        className="absolute top-4 right-24 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-lg shadow-md z-10"
                        title="이미지 확대"
                      >
                        <Expand size={16} />
                      </button>
                    )}
                    {currentSceneData.artworkUrl ? (
                      <img 
                        src={currentSceneData.artworkUrl} 
                        alt="아트워크" 
                        className="w-full h-full object-contain"
                        onError={() => setImageLoadError({ ...imageLoadError, artworkCompare: true })}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <Upload size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-400">아트워크 없음</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // 단일 이미지 모드
                <div className="h-full relative">
                  {imageViewMode === 'sketch' ? (
                    currentSceneData.sketchUrl ? (
                      imageLoadError.sketch ? (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                          <div className="text-center">
                            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                            <p className="text-gray-600 mb-2">이미지를 불러올 수 없습니다</p>
                            <button
                              onClick={() => sketchInputRef.current?.click()}
                              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                              다시 업로드
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-full">
                          <img 
                            src={currentSceneData.sketchUrl} 
                            alt="스케치" 
                            className="w-full h-full object-contain"
                            onError={() => setImageLoadError({ ...imageLoadError, sketch: true })}
                          />
                          {/* 주석 오버레이 표시 */}
                          {showAnnotationOverlay && comments.find(c => c.id === showAnnotationOverlay && c.imageType === 'sketch')?.annotationData && (
                            <div className="absolute inset-0 pointer-events-none">
                              <img
                                src={comments.find(c => c.id === showAnnotationOverlay)?.annotationData}
                                alt="주석 오버레이"
                                className="w-full h-full object-contain"
                                style={{ mixBlendMode: 'multiply' }}
                              />
                            </div>
                          )}
                          {/* 재업로드 버튼 */}
                          <button
                            onClick={() => sketchInputRef.current?.click()}
                            className="absolute top-4 right-4 px-3 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-lg shadow-md flex items-center space-x-2 text-sm"
                            title="새로운 초안 업로드"
                          >
                            <Upload size={16} />
                            <span>재업로드</span>
                          </button>
                          {/* 확대 버튼 */}
                          <button
                            onClick={() => handleImageZoom(currentSceneData.sketchUrl, 'sketch')}
                            className="absolute top-4 right-24 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-lg shadow-md"
                            title="이미지 확대"
                          >
                            <Expand size={16} />
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <Upload size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-400 mb-4">초안을 업로드하세요</p>
                          <button
                            onClick={() => sketchInputRef.current?.click()}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center space-x-2"
                          >
                            <Upload size={20} />
                            <span>파일 선택</span>
                          </button>
                          <button
                            onClick={() => setShowSketchCanvas(true)}
                            className="px-6 py-3 mt-2 border border-black text-black rounded-lg hover:bg-gray-50 flex items-center space-x-2 w-full justify-center"
                          >
                            <Camera size={20} />
                            <span>직접 그리기</span>
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    currentSceneData.artworkUrl ? (
                      imageLoadError.artwork ? (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                          <div className="text-center">
                            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                            <p className="text-gray-600 mb-2">이미지를 불러올 수 없습니다</p>
                            <button
                              onClick={() => artworkInputRef.current?.click()}
                              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                              다시 업로드
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-full">
                          <img 
                            src={currentSceneData.artworkUrl} 
                            alt="아트워크" 
                            className="w-full h-full object-contain"
                            onError={() => setImageLoadError({ ...imageLoadError, artwork: true })}
                          />
                          {/* 주석 오버레이 표시 */}
                          {showAnnotationOverlay && comments.find(c => c.id === showAnnotationOverlay && c.imageType === 'artwork')?.annotationData && (
                            <div className="absolute inset-0 pointer-events-none">
                              <img
                                src={comments.find(c => c.id === showAnnotationOverlay)?.annotationData}
                                alt="주석 오버레이"
                                className="w-full h-full object-contain"
                                style={{ mixBlendMode: 'multiply' }}
                              />
                            </div>
                          )}
                          {/* 재업로드 버튼 */}
                          <button
                            onClick={() => artworkInputRef.current?.click()}
                            className="absolute top-4 right-4 px-3 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-lg shadow-md flex items-center space-x-2 text-sm"
                            title="새로운 아트워크 업로드"
                          >
                            <Upload size={16} />
                            <span>재업로드</span>
                          </button>
                          {/* 확대 버튼 */}
                          <button
                            onClick={() => handleImageZoom(currentSceneData.artworkUrl, 'artwork')}
                            className="absolute top-4 right-24 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-lg shadow-md"
                            title="이미지 확대"
                          >
                            <Expand size={16} />
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <Upload size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-400 mb-4">아트워크를 업로드하세요</p>
                          <button
                            onClick={() => artworkInputRef.current?.click()}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center space-x-2"
                          >
                            <Upload size={20} />
                            <span>파일 선택</span>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 사이드바 */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500'
              }`}
            >
              정보
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 relative ${
                activeTab === 'comments'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500'
              }`}
            >
              댓글
              {filteredComments.filter(c => !c.resolved).length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {filteredComments.filter(c => !c.resolved).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'activity'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500'
              }`}
            >
              활동
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">씬 정보</h3>
                {!editingInfo ? (
                  <button
                    onClick={() => {
                      setEditingInfo(true);
                      setEditedSceneInfo({
                        title: currentSceneData.title || '',
                        description: currentSceneData.description || '',
                        narration: currentSceneData.narration || '',
                        sound: currentSceneData.sound || ''
                      });
                    }}
                    className="text-sm text-gray-600 hover:text-black flex items-center space-x-1"
                  >
                    <Edit2 size={14} />
                    <span>편집</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const updatedScenes = [...(storyboard.scenes || [])];
                        updatedScenes[currentScene] = {
                          ...updatedScenes[currentScene],
                          ...editedSceneInfo
                        };
                        setStoryboard({ ...storyboard, scenes: updatedScenes });
                        setEditingInfo(false);
                        addActivity('edit', '씬 정보가 수정되었습니다');
                      }}
                      className="text-sm px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingInfo(false)}
                      className="text-sm px-3 py-1 text-gray-600 hover:text-black"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">씬 제목</label>
                  {editingInfo ? (
                    <input
                      type="text"
                      value={editedSceneInfo.title}
                      onChange={(e) => setEditedSceneInfo({...editedSceneInfo, title: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                  ) : (
                    <p className="text-sm">{currentSceneData.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">설명</label>
                  {editingInfo ? (
                    <textarea
                      value={editedSceneInfo.description}
                      onChange={(e) => setEditedSceneInfo({...editedSceneInfo, description: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{currentSceneData.description}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">나레이션</label>
                  {editingInfo ? (
                    <textarea
                      value={editedSceneInfo.narration}
                      onChange={(e) => setEditedSceneInfo({...editedSceneInfo, narration: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm">{currentSceneData.narration}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">사운드</label>
                  {editingInfo ? (
                    <input
                      type="text"
                      value={editedSceneInfo.sound}
                      onChange={(e) => setEditedSceneInfo({...editedSceneInfo, sound: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                  ) : (
                    <p className="text-sm">{currentSceneData.sound}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">상태</label>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    currentSceneData.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : currentSceneData.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentSceneData.status === 'completed' ? '완료' : 
                     currentSceneData.status === 'in_progress' ? '진행중' : '대기중'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'comments' && (
            <CommentSection
              comments={filteredComments}
              currentScene={currentScene}
              onAddComment={handleAddComment}
              onToggleResolve={toggleResolve}
              onAddReply={addReply}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyText={replyText}
              setReplyText={setReplyText}
              newComment={newComment}
              setNewComment={setNewComment}
              selectedCommentType={selectedCommentType}
              setSelectedCommentType={setSelectedCommentType}
              commentFilter={commentFilter}
              setCommentFilter={setCommentFilter}
              imageViewMode={imageViewMode}
              pendingSketch={pendingSketch}
              setPendingSketch={setPendingSketch}
              showSketchCanvas={showSketchCanvas}
              setShowSketchCanvas={setShowSketchCanvas}
              selectedCommentId={selectedCommentId}
              setSelectedCommentId={setSelectedCommentId}
              showSketchOverlay={showSketchOverlay}
              setShowSketchOverlay={setShowSketchOverlay}
              showAnnotationOverlay={showAnnotationOverlay}
              setShowAnnotationOverlay={setShowAnnotationOverlay}
              onShowSketchCanvas={() => setShowSketchCanvas(true)}
            />
          )}

          {activeTab === 'activity' && (
            <div className="p-4">
              {activityLog.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2" />
                  <p>활동 기록이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.type === 'comment' ? 'bg-blue-500' :
                        activity.type === 'sketch' ? 'bg-purple-500' :
                        activity.type === 'artwork' ? 'bg-green-500' :
                        activity.type === 'annotation' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-gray-700">{activity.content}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

      {/* 이미지 확대 모달 */}
      {showZoomModal && zoomImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full p-8">
            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                setShowZoomModal(false);
                setZoomImageUrl(null);
                setZoomImageType(null);
              }}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
              title="닫기"
            >
              <X size={24} />
            </button>
            
            {/* 이미지 타입 표시 */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {zoomImageType === 'sketch' ? '초안' : '아트워크'}
            </div>
            
            {/* 확대된 이미지 */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={zoomImageUrl}
                alt={zoomImageType === 'sketch' ? '초안 확대' : '아트워크 확대'}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SceneView;