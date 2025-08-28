import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from './AuthForm';
import StudioList from './StudioList';
import ProjectListView from './ProjectListView';
import SceneView from './SceneView';

type ViewType = 'login' | 'studios' | 'project' | 'scene';

const MainApp: React.FC = () => {
  const { user, loading, login, signup, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedStudio, setSelectedStudio] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [currentScene, setCurrentScene] = useState(0);
  
  // Studio and Project state
  const [studios, setStudios] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [storyboard, setStoryboard] = useState<any>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('storyboards');
  const [showSketch, setShowSketch] = useState(true);
  const [showArtwork, setShowArtwork] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [showSketchCanvas, setShowSketchCanvas] = useState(false);
  const [pendingSketch, setPendingSketch] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentView('studios');
        loadStudios();
      } else {
        setCurrentView('login');
      }
    }
  }, [user, loading]);

  // 어드민 체크
  const isAdmin = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
  };

  const loadStudios = async () => {
    // 기본 스튜디오 데이터
    const defaultStudios = [
      {
        id: 1,
        name: '드림 스튜디오',
        description: '웹툰 제작 전문 스튜디오',
        inviteCode: 'DREAM2024',
        memberCount: 5,
        projectCount: 3,
        owner: 'admin',
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        name: '크리에이티브 랩',
        description: '창의적인 콘텐츠 제작소',
        inviteCode: 'CREATE99',
        memberCount: 8,
        projectCount: 7,
        owner: 'designer',
        createdAt: '2024-02-15'
      }
    ];

    // 어드민이면 모든 스튜디오 보기, 일반 사용자는 제한된 스튜디오만
    if (isAdmin()) {
      setStudios([
        ...defaultStudios,
        {
          id: 3,
          name: '마스터 스튜디오',
          description: '프리미엄 프로젝트 전용',
          inviteCode: 'MASTER00',
          memberCount: 3,
          projectCount: 10,
          owner: 'HSG202',
          createdAt: '2024-03-01'
        }
      ]);
    } else {
      setStudios(defaultStudios);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      // AuthForm에서 이미 role 설정을 처리함
      await login(username, password);
    } catch (error: any) {
      throw new Error('로그인에 실패했습니다');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await signup(username, email, password);
    } catch (error: any) {
      throw new Error('회원가입에 실패했습니다');
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('userRole');
    setCurrentView('login');
    setSelectedStudio(null);
    setSelectedProject(null);
    setStudios([]);
    setProjects([]);
  };

  const handleSelectStudio = (studio: any) => {
    setSelectedStudio(studio);
    setCurrentView('project');
    loadProjects(studio.id);
  };

  const loadProjects = (studioId: number) => {
    // 임시 프로젝트 데이터
    const sampleProjects = [
      {
        id: 1,
        title: '환상의 숲',
        description: '판타지 웹툰 프로젝트',
        status: 'in-progress',
        scenes: 12,
        lastUpdated: '2024-12-19',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: 2,
        title: '도시의 영웅',
        description: '액션 웹툰 프로젝트',
        status: 'review',
        scenes: 8,
        lastUpdated: '2024-12-18',
        thumbnail: '/api/placeholder/300/200'
      }
    ];
    setProjects(sampleProjects);
  };

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    loadStoryboard(project.id);
    setCurrentView('scene');
  };

  const loadStoryboard = (projectId: number) => {
    // 샘플 스토리보드 데이터
    setStoryboard({
      id: projectId,
      title: selectedProject?.title || '프로젝트',
      scenes: [
        {
          id: 1,
          title: '오프닝',
          description: '주인공 등장',
          narration: '어느 평화로운 마을에...',
          sound: '새소리, 바람소리',
          status: 'completed',
          sketchUrl: '/api/placeholder/600/400',
          artworkUrl: '/api/placeholder/600/400'
        },
        {
          id: 2,
          title: '갈등 시작',
          description: '문제 발생',
          narration: '갑자기 나타난 몬스터...',
          sound: '긴장감 있는 BGM',
          status: 'in-progress',
          sketchUrl: '/api/placeholder/600/400',
          artworkUrl: null
        },
        {
          id: 3,
          title: '해결',
          description: '주인공의 활약',
          narration: '용감하게 맞서는 주인공',
          sound: '전투 효과음',
          status: 'draft_pending',
          sketchUrl: null,
          artworkUrl: null
        }
      ]
    });

    // 샘플 댓글 데이터
    setComments([
      {
        id: 1,
        sceneId: 0,
        author: '김작가',
        avatar: 'KJ',
        content: '이 장면 정말 좋네요!',
        time: '2시간 전',
        type: 'comment',
        resolved: false,
        replies: []
      },
      {
        id: 2,
        sceneId: 0,
        author: '이편집',
        avatar: 'LE',
        content: '색감 조정이 필요할 것 같습니다',
        time: '1시간 전',
        type: 'revision',
        resolved: false,
        replies: []
      }
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Render based on current view
  switch (currentView) {
    case 'login':
      return (
        <AuthForm
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      );

    case 'studios':
      return (
        <StudioList
          studios={studios}
          setStudios={setStudios}
          onSelectStudio={handleSelectStudio}
          onLogout={handleLogout}
        />
      );

    case 'project':
      return (
        <ProjectListView
          channelName={selectedStudio?.name || '스튜디오'}
          channelId={selectedStudio?.id || 0}
          projects={projects}
          setProjects={setProjects}
          onSelectProject={handleSelectProject}
          currentView={currentView}
          setCurrentView={setCurrentView}
          showCreateProject={showCreateProject}
          setShowCreateProject={setShowCreateProject}
        />
      );

    case 'scene':
      return (
        <SceneView
          storyboard={storyboard}
          setStoryboard={setStoryboard}
          currentScene={currentScene}
          setCurrentScene={setCurrentScene}
          currentView={currentView}
          setCurrentView={setCurrentView}
          comments={comments}
          setComments={setComments}
          notifications={notifications}
          setNotifications={setNotifications}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showSketch={showSketch}
          setShowSketch={setShowSketch}
          showArtwork={showArtwork}
          setShowArtwork={setShowArtwork}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          showSketchCanvas={showSketchCanvas}
          setShowSketchCanvas={setShowSketchCanvas}
          pendingSketch={pendingSketch}
          setPendingSketch={setPendingSketch}
          selectedCommentId={selectedCommentId}
          setSelectedCommentId={setSelectedCommentId}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          replyText={replyText}
          setReplyText={setReplyText}
          newComment={newComment}
          setNewComment={setNewComment}
        />
      );

    default:
      return <div>Unknown view</div>;
  }
};

export default MainApp;