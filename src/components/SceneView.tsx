import React, { useRef, useEffect, useState } from 'react';
import { 
  Upload, MessageCircle, Check, ChevronLeft, ChevronRight, 
  MoreHorizontal, Send, Image, Download, Eye, AlertCircle, CheckCircle, 
  ArrowLeft, Share2, Bell, Edit2, X, Reply, Brush, Plus, CheckCheck
} from 'lucide-react';
import SketchCanvas from './SketchCanvas';
import AnnotationCanvas from './AnnotationCanvas';

type ViewType = 'login' | 'studios' | 'project' | 'scene';
type ImageViewMode = 'sketch' | 'artwork' | null;

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  
  // 개선된 상태 관리
  const [imageViewMode, setImageViewMode] = useState<ImageViewMode>('sketch');
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newSceneDescription, setNewSceneDescription] = useState('');
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotations, setAnnotations] = useState<{ [key: number]: string }>({});
  const [showSketchOverlay, setShowSketchOverlay] = useState<number | null>(null);

  useEffect(() => {
    // 초기 댓글 데이터 설정
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
      },
      {
        id: 2,
        sceneId: 1,
        author: "나",
        avatar: "나",
        time: "오후 2:15",
        content: "주인공 표정이 좀 더 불안해 보였으면 좋겠어요. 눈썹을 조금 더 올려주세요.",
        type: "revision",
        resolved: false,
        sketchData: null,
        parentId: null,
        replies: [
          {
            id: 3,
            sceneId: 1,
            author: "김그림",
            avatar: "김",
            time: "오후 2:30",
            content: "수정했습니다! 확인 부탁드려요.",
            parentId: 2
          }
        ]
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
      'revision_complete': { bg: 'bg-purple-100', text: 'text-purple-600', label: '수정 완료' },
      'approved': { bg: 'bg-green-100', text: 'text-green-600', label: '승인 완료' },
      'in_progress': { bg: 'bg-purple-100', text: 'text-purple-600', label: '작업 중' }
    };
    return styles[status] || styles['waiting_sketch'];
  };

  // 파일 업로드 핸들러
  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedScenes = [...storyboard.scenes];
      updatedScenes[currentScene].sketchUrl = URL.createObjectURL(file);
      updatedScenes[currentScene].status = 'sketch_uploaded';
      setStoryboard({ ...storyboard, scenes: updatedScenes });
      alert('초안이 업로드되었습니다.');
    }
  };

  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedScenes = [...storyboard.scenes];
      updatedScenes[currentScene].artworkUrl = URL.createObjectURL(file);
      updatedScenes[currentScene].status = 'artwork_uploaded';
      setStoryboard({ ...storyboard, scenes: updatedScenes });
      alert('아트워크가 업로드되었습니다.');
    }
  };

  // 씬 상태 업데이트
  const updateSceneStatus = (status: string) => {
    const updatedScenes = [...storyboard.scenes];
    updatedScenes[currentScene].status = status;
    setStoryboard({ ...storyboard, scenes: updatedScenes });
  };

  // 새로운 씬 추가 함수
  const addNewScene = () => {
    if (newSceneTitle.trim()) {
      const newScene = {
        id: storyboard.scenes.length + 1,
        title: newSceneTitle,
        description: newSceneDescription,
        sketchUrl: null,
        artworkUrl: null,
        status: 'waiting_sketch',
        comments: []
      };
      
      const updatedScenes = [...storyboard.scenes, newScene];
      setStoryboard({ ...storyboard, scenes: updatedScenes });
      setShowAddSceneModal(false);
      setNewSceneTitle('');
      setNewSceneDescription('');
      setCurrentScene(updatedScenes.length - 1);
    }
  };

  // 주석 저장 핸들러
  const handleAnnotationSave = (annotationData: string) => {
    setAnnotations({
      ...annotations,
      [currentScene]: annotationData
    });
    setShowAnnotation(false);
    
    // 댓글에 주석 추가
    const comment = {
      id: comments.length + 1,
      sceneId: currentSceneData.id,
      author: "나",
      avatar: "나",
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      content: "(주석이 추가되었습니다)",
      type: "annotation",
      resolved: false,
      annotationData: annotationData,
      parentId: null,
      replies: []
    };
    setComments([...comments, comment]);
  };

  // 댓글 추가
  const addComment = () => {
    if (newComment.trim() || pendingSketch) {
      const comment = {
        id: comments.length + 1,
        sceneId: currentSceneData.id,
        author: "나",
        avatar: "나",
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        content: newComment || "(스케치만 포함)",
        type: "general",
        resolved: false,
        sketchData: pendingSketch,
        parentId: null,
        replies: []
      };
      setComments([...comments, comment]);
      setNewComment('');
      setPendingSketch(null);
      setNotifications(notifications + 1);
    }
  };

  // 답글 추가
  const addReply = (parentId: number) => {
    if (replyText.trim()) {
      const reply = {
        id: comments.length + 100,
        sceneId: currentSceneData.id,
        author: "나",
        avatar: "나",
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        content: replyText,
        parentId: parentId
      };
      
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyText('');
      setReplyTo(null);
    }
  };

  // 댓글 해결 처리
  const toggleResolve = (commentId: number) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, resolved: !comment.resolved };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  // 주석 오버레이 토글
  const toggleAnnotationOverlay = (commentId: number) => {
    if (showSketchOverlay === commentId) {
      setShowSketchOverlay(null);
      setSelectedCommentId(null);
    } else {
      const comment = comments.find(c => c.id === commentId);
      if (comment?.annotationData || comment?.sketchData) {
        setShowSketchOverlay(commentId);
        setSelectedCommentId(commentId);
      }
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 왼쪽 사이드바 */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* 프로젝트 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={() => setCurrentView('project')}
            className="flex items-center space-x-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>프로젝트 목록</span>
          </button>
          <h2 className="font-bold text-lg">{storyboard.title}</h2>
          <p className="text-gray-500 text-sm">{storyboard.episode}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(storyboard.status).bg} ${getStatusStyle(storyboard.status).text}`}>
              {getStatusStyle(storyboard.status).label}
            </span>
            <span className="text-xs text-gray-500">마감: {storyboard.dueDate}</span>
          </div>
        </div>

        {/* 씬 리스트 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1">
              씬 목록
            </div>
            {storyboard.scenes?.map((scene: any, index: number) => (
              <button
                key={scene.id}
                onClick={() => setCurrentScene(index)}
                className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                  currentScene === index 
                    ? 'bg-black text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {index + 1}. {scene.title}
                    </span>
                  </div>
                  {scene.status === 'approved' && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  {scene.status === 'feedback_requested' && (
                    <AlertCircle size={16} className="text-orange-500" />
                  )}
                </div>
                <div className={`text-xs mt-1 ${currentScene === index ? 'text-gray-300' : 'text-gray-500'}`}>
                  {getStatusStyle(scene.status).label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 하단 액션 - 씬 추가 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => setShowAddSceneModal(true)}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center justify-center space-x-2"
          >
            <Plus size={18} />
            <span>씬 추가</span>
          </button>
        </div>
      </div>

      {/* 메인 뷰어 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 툴바 */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <div className="flex items-center space-x-4 flex-1">
            <h3 className="font-bold">
              씬 {currentScene + 1}: {currentSceneData.title}
            </h3>
            <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(currentSceneData.status).bg} ${getStatusStyle(currentSceneData.status).text}`}>
              {getStatusStyle(currentSceneData.status).label}
            </span>
            
            {/* 개선된 이미지 선택 버튼 - 라디오 버튼 방식 */}
            <div className="flex items-center space-x-2 ml-8">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="imageView" 
                  value="sketch"
                  checked={imageViewMode === 'sketch'}
                  onChange={() => setImageViewMode('sketch')}
                  className="mr-1"
                />
                <Eye size={14} />
                <span className="text-sm">초안</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="imageView" 
                  value="artwork"
                  checked={imageViewMode === 'artwork'}
                  onChange={() => setImageViewMode('artwork')}
                  className="mr-1"
                />
                <Eye size={14} />
                <span className="text-sm">아트워크</span>
              </label>
              <button 
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1 rounded text-sm ${
                  compareMode ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                비교 모드
              </button>
              <button 
                onClick={() => setShowAnnotation(true)}
                className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 flex items-center space-x-1"
              >
                <Edit2 size={14} />
                <span>주석</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 워크플로우 개선 - 역할별 액션 버튼 */}
            {currentSceneData.status === 'waiting_sketch' && (
              <>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={handleSketchUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
                >
                  <Upload size={16} />
                  <span>초안 업로드</span>
                </button>
              </>
            )}
            
            {currentSceneData.status === 'sketch_uploaded' && (
              <>
                <input 
                  ref={artworkInputRef}
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={handleArtworkUpload}
                />
                <button 
                  onClick={() => artworkInputRef.current?.click()}
                  className="px-4 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center space-x-1"
                >
                  <Upload size={16} />
                  <span>아트워크 업로드</span>
                </button>
              </>
            )}
            
            {currentSceneData.status === 'artwork_uploaded' && (
              <>
                <button 
                  onClick={() => updateSceneStatus('feedback_requested')}
                  className="px-4 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  수정 요청
                </button>
                <button 
                  onClick={() => updateSceneStatus('approved')}
                  className="px-4 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  승인
                </button>
              </>
            )}
            
            {/* 새로운 상태: 수정 완료 버튼 */}
            {currentSceneData.status === 'feedback_requested' && (
              <button 
                onClick={() => updateSceneStatus('revision_complete')}
                className="px-4 py-1.5 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 flex items-center space-x-1"
              >
                <CheckCheck size={16} />
                <span>수정 완료</span>
              </button>
            )}
            
            {currentSceneData.status === 'revision_complete' && (
              <button 
                onClick={() => updateSceneStatus('approved')}
                className="px-4 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                최종 승인
              </button>
            )}
            
            <button className="p-2 hover:bg-gray-100 rounded">
              <Download size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Share2 size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 - 개선된 이미지 뷰어 */}
        <div className="flex-1 flex">
          {/* 이미지 뷰어 영역 */}
          <div className="flex-1 bg-gray-100 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {compareMode ? (
                // 비교모드 - 양쪽에 동시 표시
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <h4 className="font-medium mb-2">초안</h4>
                    {currentSceneData.sketchUrl ? (
                      <div className="relative">
                        <img src={currentSceneData.sketchUrl} alt="초안" className="w-full rounded-lg shadow-lg" />
                        {annotations[currentScene] && showSketchOverlay && (
                          <img 
                            src={annotations[currentScene]} 
                            alt="주석" 
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-12 text-center">
                        <p className="text-gray-400">초안 미업로드</p>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <h4 className="font-medium mb-2">아트워크</h4>
                    {currentSceneData.artworkUrl ? (
                      <div className="relative">
                        <img src={currentSceneData.artworkUrl} alt="아트워크" className="w-full rounded-lg shadow-lg" />
                        {annotations[currentScene] && showSketchOverlay && (
                          <img 
                            src={annotations[currentScene]} 
                            alt="주석" 
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-12 text-center">
                        <p className="text-gray-400">아트워크 미업로드</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // 일반 모드 - 선택된 이미지만 표시
                <div className="relative">
                  {imageViewMode === 'sketch' && currentSceneData.sketchUrl && (
                    <div className="relative">
                      <img src={currentSceneData.sketchUrl} alt="초안" className="w-full rounded-lg shadow-lg" />
                      {annotations[currentScene] && showSketchOverlay && (
                        <img 
                          src={annotations[currentScene]} 
                          alt="주석" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60"
                        />
                      )}
                    </div>
                  )}
                  {imageViewMode === 'artwork' && currentSceneData.artworkUrl && (
                    <div className="relative">
                      <img src={currentSceneData.artworkUrl} alt="아트워크" className="w-full rounded-lg shadow-lg" />
                      {annotations[currentScene] && showSketchOverlay && (
                        <img 
                          src={annotations[currentScene]} 
                          alt="주석" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60"
                        />
                      )}
                    </div>
                  )}
                  {!currentSceneData.sketchUrl && !currentSceneData.artworkUrl && (
                    <div className="bg-white rounded-lg p-12 text-center">
                      <p className="text-gray-400">이미지가 업로드되지 않았습니다</p>
                    </div>
                  )}
                  
                  {/* 주석/스케치 오버레이 */}
                  {showSketchOverlay !== null && (
                    <div className="absolute inset-0 pointer-events-none">
                      {comments.find(c => c.id === showSketchOverlay)?.sketchData && (
                        <img 
                          src={comments.find(c => c.id === showSketchOverlay)?.sketchData || ''} 
                          alt="스케치 오버레이" 
                          className="w-full h-full object-contain opacity-60"
                        />
                      )}
                      {comments.find(c => c.id === showSketchOverlay)?.annotationData && (
                        <img 
                          src={comments.find(c => c.id === showSketchOverlay)?.annotationData || ''} 
                          alt="주석 오버레이" 
                          className="w-full h-full object-contain opacity-60"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 댓글 사이드바 */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">피드백</h3>
                <span className="text-sm text-gray-500">{filteredComments.length}개</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredComments.map(comment => (
                <div key={comment.id} className="mb-4">
                  <div className={`p-3 rounded-lg ${comment.resolved ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">
                          {comment.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{comment.author}</div>
                          <div className="text-xs text-gray-500">{comment.time}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleResolve(comment.id)}
                        className={`text-sm ${comment.resolved ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {comment.resolved ? <CheckCircle size={16} /> : <Check size={16} />}
                      </button>
                    </div>
                    
                    <p className="text-sm mb-2">{comment.content}</p>
                    
                    {(comment.sketchData || comment.annotationData) && (
                      <div className="mb-2">
                        <button
                          onClick={() => toggleAnnotationOverlay(comment.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            showSketchOverlay === comment.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {showSketchOverlay === comment.id ? '주석 숨기기' : '주석 보기'}
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-xs text-gray-500 hover:text-black flex items-center space-x-1"
                    >
                      <Reply size={12} />
                      <span>답글</span>
                    </button>
                    
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className="text-sm">
                            <div className="flex items-center space-x-1 mb-1">
                              <span className="font-medium">{reply.author}</span>
                              <span className="text-xs text-gray-500">{reply.time}</span>
                            </div>
                            <p>{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {replyTo === comment.id && (
                      <div className="mt-2 flex space-x-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글 입력..."
                          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                          autoFocus
                        />
                        <button
                          onClick={() => addReply(comment.id)}
                          className="px-2 py-1 bg-black text-white rounded text-sm"
                        >
                          전송
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 댓글 입력 영역 */}
            <div className="p-4 border-t border-gray-200">
              {pendingSketch && (
                <div className="mb-2 p-2 bg-gray-50 rounded flex items-center justify-between">
                  <span className="text-xs text-gray-600">스케치 첨부됨</span>
                  <button
                    onClick={() => setPendingSketch(null)}
                    className="text-gray-400 hover:text-black"
                  >
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
                  placeholder="피드백 입력..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded"
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                  onClick={addComment}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 스케치 캔버스 모달 */}
      {showSketchCanvas && (
        <SketchCanvas 
          onSave={(imageData) => {
            setPendingSketch(imageData);
            setShowSketchCanvas(false);
          }}
          onClose={() => setShowSketchCanvas(false)}
        />
      )}
      
      {/* 주석 캔버스 모달 */}
      {showAnnotation && (
        <AnnotationCanvas 
          backgroundImage={
            imageViewMode === 'sketch' 
              ? currentSceneData.sketchUrl 
              : currentSceneData.artworkUrl
          }
          onSave={handleAnnotationSave}
          onClose={() => setShowAnnotation(false)}
        />
      )}
      
      {/* 씬 추가 모달 */}
      {showAddSceneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">새 씬 추가</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">씬 제목</label>
              <input
                type="text"
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="예: 주인공 등장"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">씬 설명</label>
              <textarea
                value={newSceneDescription}
                onChange={(e) => setNewSceneDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded h-24 resize-none"
                placeholder="씬에 대한 상세 설명을 입력하세요"
              />
            </div>
            <div className="flex justify-end space-x-2">
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
                onClick={addNewScene}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
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