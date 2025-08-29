import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from './AuthForm';
import StudioList from './StudioList';
import ProjectListView from './ProjectListView';
import SceneView from './SceneView';
import { ErrorBoundary } from './ErrorBoundary';

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
    // 실제 데이터는 API에서 로드하도록 변경 예정
    // 현재는 빈 배열로 시작
    setStudios([]);
    
    // 어드민용 마스터 스튜디오는 유지
    if (isAdmin()) {
      setStudios([
        {
          id: 1,
          name: '마스터 스튜디오',
          description: '프리미엄 프로젝트 전용',
          inviteCode: 'MASTER00',
          memberCount: 0,
          projectCount: 0,
          owner: 'HSG202',
          createdAt: new Date().toISOString().split('T')[0]
        }
      ]);
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
    // 실제 데이터는 API에서 로드하도록 변경 예정
    // 현재는 빈 배열로 시작
    setProjects([]);
  };

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    loadStoryboard(project.id);
    setCurrentView('scene');
  };

  const loadStoryboard = (projectId: number) => {
    // 실제 데이터는 API에서 로드하도록 변경 예정
    // 기본 구조만 유지
    setStoryboard({
      id: projectId,
      title: selectedProject?.title || '새 프로젝트',
      scenes: [
        {
          id: 1,
          title: '씬 1',
          description: '',
          narration: '',
          sound: '',
          status: 'draft_pending',
          sketchUrl: null,
          artworkUrl: null
        }
      ]
    });

    // 빈 댓글 배열로 시작
    setComments([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Render based on current view
  return (
    <ErrorBoundary>
      {(() => {
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
      })()}
    </ErrorBoundary>
  );
};

export default MainApp;