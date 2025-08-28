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
        // Load user's studios
        loadStudios();
      } else {
        setCurrentView('login');
      }
    }
  }, [user, loading]);

  const loadStudios = async () => {
    // 임시 데이터 - 실제로는 API 호출
    setStudios([
      {
        id: '1',
        name: '드림 스튜디오',
        description: '웹툰 제작 전문 스튜디오',
        inviteCode: 'DREAM2024',
        memberCount: 5,
        projectCount: 3,
        owner: 'admin',
        createdAt: '2024-01-01'
      }
    ]);
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await signup(username, email, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다');
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('login');
    setSelectedStudio(null);
    setSelectedProject(null);
    setStudios([]);
    setProjects([]);
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
          setSelectedStudio={setSelectedStudio}
          setCurrentView={setCurrentView}
          user={user}
          onLogout={handleLogout}
        />
      );

    case 'project':
      return (
        <ProjectListView
          studio={selectedStudio}
          projects={projects}
          setProjects={setProjects}
          setStoryboard={setStoryboard}
          setCurrentView={setCurrentView}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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