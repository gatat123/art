import React, { useRef, useEffect, useState } from 'react';
import { 
  Upload, MessageCircle, Check, ChevronLeft, ChevronRight, 
  MoreHorizontal, Send, Image, Download, Eye, AlertCircle, CheckCircle, 
  ArrowLeft, Share2, Bell, Edit2, X, Reply, Brush, Plus, CheckCheck, Tag,
  History, Clock, ChevronDown, Camera
} from 'lucide-react';
import SketchCanvas from './SketchCanvas';
import AnnotationCanvas from './AnnotationCanvas';

type ViewType = 'login' | 'studios' | 'project' | 'scene';
type ImageViewMode = 'sketch' | 'artwork' | null;
type CommentTag = 'revision' | 'comment';

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
    currentView, setCurrentView, comments, setComments,
    notifications, setNotifications, activeTab, setActiveTab,
    showSketch, setShowSketch, showArtwork, setShowArtwork,
    compareMode, setCompareMode, showSketchCanvas, setShowSketchCanvas,
    pendingSketch, setPendingSketch, selectedCommentId, setSelectedCommentId,
    replyTo, setReplyTo, replyText, setReplyText, newComment, setNewComment
  } = props;

  // 파일 업로드를 위한 ref
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  // 버전 관리 상태
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      type: 'sketch',
      url: '/api/placeholder/600/400',
      timestamp: '2024-12-20 10:00',
      author: '김작가',
      message: '초안 첫 버전',
      isCurrent: false
    },
    {
      id: 'v2',
      type: 'artwork',
      url: '/api/placeholder/600/400',
      timestamp: '2024-12-20 14:00',
      author: '김그림',
      message: '아트워크 초안',
      isCurrent: false
    },
    {
      id: 'v3',
      type: 'artwork',
      url: '/api/placeholder/600/400',
      timestamp: '2024-12-20 18:00',
      author: '김그림',
      message: '수정 요청 반영',
      isCurrent: true
    }
  ]);

  const [imageViewMode, setImageViewMode] = useState<ImageViewMode>('sketch');
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotations, setAnnotations] = useState<{[key: string]: any}>({});
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newSceneDescription, setNewSceneDescription] = useState('');
  const [showSketchOverlay, setShowSketchOverlay] = useState<number | null>(null);

  const currentSceneData = storyboard?.scenes?.[currentScene] || {
    title: '씬 1',
    description: '씬 설명',
    narration: '나레이션 내용',
    sound: '사운드 효과',
    status: 'draft_pending',
    sketchUrl: null,
    artworkUrl: null,
    feedback: []
  };

  const filteredComments = comments.filter(c => c.sceneId === currentScene);

  // 파일 업로드 핸들러
  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const addComment = () => {
    if (newComment.trim() || pendingSketch) {
      const comment = {
        id: comments.length + 1,
        sceneId: currentScene,
        author: '나',
        avatar: 'ME',
        content: newComment,
        time: '방금',
        type: 'comment' as CommentTag,
        resolved: false,
        replies: [],
        sketchData: pendingSketch,
        imageType: pendingSketch ? imageViewMode : null // 어떤 이미지에 대한 스케치인지 표시
      };
      setComments([...comments, comment]);
      setNewComment('');
      setPendingSketch(null);
    }
  };

  const addReply = (commentId: number) => {
    if (replyText.trim()) {
      const updatedComments = comments.map(c => {
        if (c.id === commentId) {
          const reply = {
            id: Date.now(),
            author: '나',
            avatar: 'ME',
            content: replyText,
            time: '방금'
          };
          return {
            ...c,
            replies: [...(c.replies || []), reply]
          };
        }
        return c;
      });
      setComments(updatedComments);
      setReplyText('');
      setReplyTo(null);
    }
  };

  const toggleResolve = (commentId: number) => {
    const updatedComments = comments.map(c => 
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    );
    setComments(updatedComments);
  };

  const toggleSketchOverlay = (commentId: number) => {
    setShowSketchOverlay(showSketchOverlay === commentId ? null : commentId);
    setSelectedCommentId(selectedCommentId === commentId ? null : commentId);
  };

  const handleImageViewModeChange = (mode: ImageViewMode) => {
    setImageViewMode(mode);
    if (mode === 'sketch') {
      setShowSketch(true);
      setShowArtwork(false);
    } else if (mode === 'artwork') {
      setShowSketch(false);
      setShowArtwork(true);
    }
  };

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
    // 버전에 따라 이미지 업데이트
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
  };

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
            {storyboard?.scenes?.map((scene: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentScene(index)}
                className={`w-full text-left p-3 rounded-lg ${
                  currentScene === index 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">씬 {index + 1}</span>
                  {scene.status === 'completed' && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
                <p className="text-xs opacity-75 mt-1">{scene.title}</p>
              </button>
            ))}
            
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
            
            {/* 버전 히스토리 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <History size={16} />
                <span className="text-sm">버전 히스토리</span>
                <ChevronDown size={16} className={`transform transition-transform ${showVersionHistory ? 'rotate-180' : ''}`} />
              </button>

              {/* 버전 히스토리 드롭다운 - 버튼 바로 아래에 위치 */}
              {showVersionHistory && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-sm">버전 히스토리</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => handleVersionSelect(version)}
                        className={`w-full p-3 hover:bg-gray-50 border-b border-gray-100 text-left ${
                          version.isCurrent ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                version.type === 'sketch' ? 'bg-gray-200' : 'bg-green-200'
                              }`}>
                                {version.type === 'sketch' ? '초안' : '아트워크'}
                              </span>
                              {version.isCurrent && (
                                <span className="text-xs text-blue-600 font-semibold">현재 버전</span>
                              )}
                            </div>
                            <p className="text-sm font-medium mt-1">{version.message}</p>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{version.timestamp}</span>
                              <span>•</span>
                              <span>{version.author}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 이미지 뷰 토글 - 라디오 버튼 방식 */}
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

            {/* 주석 토글 - 비교 모드가 아닐 때만 표시 */}
            {!compareMode && (
              <button
                onClick={() => setShowAnnotation(!showAnnotation)}
                className={`px-4 py-2 rounded ${
                  showAnnotation ? 'bg-purple-500 text-white' : 'bg-gray-100'
                }`}
              >
                <Brush size={16} className="inline mr-2" />
                {imageViewMode === 'sketch' ? '초안 주석' : '아트워크 주석'}
              </button>
            )}
          </div>
        </div>

        {/* 메인 뷰 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 씬 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm text-gray-500 mb-2">나레이션</h4>
                  <p className="text-gray-800">{currentSceneData.narration}</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500 mb-2">장면 설명</h4>
                  <p className="text-gray-800">{currentSceneData.description}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-sm text-gray-500 mb-2">사운드</h4>
                <p className="text-gray-800">{currentSceneData.sound}</p>
              </div>
            </div>

            {/* 이미지 뷰어 */}
            <div className={`grid ${compareMode ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
              {/* 초안 */}
              {(showSketch || compareMode) && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">초안 (스케치)</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => sketchInputRef.current?.click()}
                          className="p-1 hover:bg-gray-200 rounded flex items-center space-x-1"
                          title="초안 업로드"
                        >
                          <Upload size={16} />
                          <span className="text-xs">업로드</span>
                        </button>
                        {currentSceneData.sketchUrl && (
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Download size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {currentSceneData.sketchUrl ? (
                      <>
                        <img 
                          src={currentSceneData.sketchUrl} 
                          alt="초안"
                          className="w-full h-full object-contain"
                        />
                        {/* 비교 모드일 때는 주석 오버레이 표시 안 함 */}
                        {!compareMode && showAnnotation && annotations[`scene_${currentScene}_sketch`] && (
                          <div className="absolute inset-0 pointer-events-none">
                            <img 
                              src={annotations[`scene_${currentScene}_sketch`]}
                              alt="초안 주석"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div 
                        onClick={() => sketchInputRef.current?.click()}
                        className="text-center text-gray-400 cursor-pointer hover:text-gray-600"
                      >
                        <Camera size={48} className="mx-auto mb-2" />
                        <p>초안을 업로드하세요</p>
                        <p className="text-xs mt-1">클릭하여 이미지 선택</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 아트워크 */}
              {(showArtwork || compareMode) && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">아트워크 (최종)</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => artworkInputRef.current?.click()}
                          className="p-1 hover:bg-gray-200 rounded flex items-center space-x-1"
                          title="아트워크 업로드"
                        >
                          <Upload size={16} />
                          <span className="text-xs">업로드</span>
                        </button>
                        {currentSceneData.artworkUrl && (
                          <>
                            {!compareMode && (
                              <button 
                                onClick={() => setShowSketchCanvas(true)}
                                className="p-1 hover:bg-gray-200 rounded flex items-center space-x-1"
                                title="스케치 추가"
                              >
                                <Brush size={16} />
                              </button>
                            )}
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Download size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {currentSceneData.artworkUrl ? (
                      <>
                        <img 
                          src={currentSceneData.artworkUrl} 
                          alt="아트워크"
                          className="w-full h-full object-contain"
                        />
                        {/* 비교 모드일 때는 주석 오버레이 표시 안 함 */}
                        {!compareMode && showAnnotation && annotations[`scene_${currentScene}_artwork`] && (
                          <div className="absolute inset-0 pointer-events-none">
                            <img 
                              src={annotations[`scene_${currentScene}_artwork`]}
                              alt="아트워크 주석"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div 
                        onClick={() => artworkInputRef.current?.click()}
                        className="text-center text-gray-400 cursor-pointer hover:text-gray-600"
                      >
                        <Camera size={48} className="mx-auto mb-2" />
                        <p>아트워크를 업로드하세요</p>
                        <p className="text-xs mt-1">클릭하여 이미지 선택</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 피드백 섹션 */}
            {currentSceneData.feedback && currentSceneData.feedback.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-sm text-yellow-800 mb-2">수정 요청 사항</h4>
                <ul className="space-y-1">
                  {currentSceneData.feedback.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                      <span className="text-sm text-yellow-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6">
          <button 
            onClick={() => setCurrentScene(Math.max(0, currentScene - 1))}
            disabled={currentScene === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            <span>이전 씬</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {storyboard?.scenes?.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentScene(index)}
                className={`w-2 h-2 rounded-full ${
                  currentScene === index ? 'bg-black w-8' : 'bg-gray-300'
                } transition-all`}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentScene(Math.min(storyboard.scenes.length - 1, currentScene + 1))}
            disabled={currentScene === storyboard.scenes.length - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>다음 씬</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 오른쪽 패널 - 댓글 */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="h-14 border-b border-gray-200 flex items-center px-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'comments' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-400'
              }`}
            >
              댓글 ({filteredComments.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'activity' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-400'
              }`}
            >
              활동
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'comments' && (
            <div className="p-4 space-y-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle size={32} className="mx-auto mb-2" />
                  <p>아직 댓글이 없습니다</p>
                </div>
              ) : (
                filteredComments.map(comment => (
                  <div key={comment.id} className="space-y-2">
                    <div 
                      className={`flex space-x-3 p-2 rounded ${
                        selectedCommentId === comment.id ? 'bg-gray-100' : ''
                      }`}
                    >
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
                          {comment.resolved && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded">
                              해결됨
                            </span>
                          )}
                          {comment.sketchData && (
                            <button 
                              onClick={() => toggleSketchOverlay(comment.id)}
                              className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded flex items-center space-x-1"
                            >
                              <Brush size={10} />
                              <span>{comment.imageType === 'sketch' ? '초안' : '아트워크'} 스케치</span>
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        
                        {/* 스케치 오버레이 표시 */}
                        {showSketchOverlay === comment.id && comment.sketchData && (
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
                            onClick={() => setReplyTo(comment.id)}
                            className="text-xs text-gray-400 hover:text-black flex items-center space-x-1"
                          >
                            <Reply size={12} />
                            <span>답글</span>
                          </button>
                          {!comment.resolved && (
                            <button 
                              onClick={() => toggleResolve(comment.id)}
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
                        {comment.replies.map((reply: any) => (
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
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addReply(comment.id);
                            }
                          }}
                          placeholder="답글을 입력하세요..."
                          className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-black"
                          autoFocus
                        />
                        <button
                          onClick={() => addReply(comment.id)}
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => setReplyTo(null)}
                          className="px-2 py-1 text-gray-400 hover:text-black"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">김그림</span>님이 아트워크를 업로드했습니다
                    </p>
                    <p className="text-xs text-gray-500">30분 전</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">나</span>님이 댓글을 남겼습니다
                    </p>
                    <p className="text-xs text-gray-500">1시간 전</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'comments' && (
          <div className="border-t border-gray-200 p-4">
            {pendingSketch && (
              <div className="mb-2 p-2 bg-purple-50 rounded flex items-center justify-between">
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
                onClick={() => setShowSketchCanvas(true)}
                className="p-2 hover:bg-gray-100 rounded"
                title="스케치 추가"
              >
                <Brush size={20} />
              </button>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComment()}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-black"
              />
              <button
                onClick={addComment}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 스케치 캔버스 모달 */}
      {showSketchCanvas && !compareMode && (
        <SketchCanvas
          imageUrl={currentSceneData.artworkUrl || currentSceneData.sketchUrl}
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
          onSave={(annotationData) => {
            const key = `scene_${currentScene}_${imageViewMode}`;
            setAnnotations({...annotations, [key]: annotationData});
            setShowAnnotation(false);
          }}
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
                onClick={() => {
                  if (newSceneTitle.trim()) {
                    const newScene = {
                      id: storyboard.scenes.length + 1,
                      title: newSceneTitle,
                      description: newSceneDescription,
                      narration: '',
                      sound: '',
                      status: 'draft_pending',
                      sketchUrl: null,
                      artworkUrl: null
                    };
                    setStoryboard({
                      ...storyboard,
                      scenes: [...storyboard.scenes, newScene]
                    });
                    setCurrentScene(storyboard.scenes.length);
                    setNewSceneTitle('');
                    setNewSceneDescription('');
                    setShowAddSceneModal(false);
                  }
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneView;