import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from './AuthForm';
import StudioList from './StudioList';
import ProjectListView from './ProjectListView';
import SceneView from './SceneView';
import { ErrorBoundary } from './ErrorBoundary';
import { studiosApi, projectsApi, scenesApi } from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState('comments');
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
  const [loadingData, setLoadingData] = useState(false);

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

  // 초대코드 생성 함수
  const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const loadStudios = async () => {
    setLoadingData(true);
    try {
      const data = await studiosApi.list();
      
      const formattedStudios = data.map((studio: any) => ({
        id: studio.id,
        name: studio.name,
        description: studio.description || '',
        inviteCode: studio.invite_code || generateInviteCode(),
        memberCount: studio.member_count || 1,
        projectCount: studio.project_count || 0,
        owner: studio.creator_name || user?.username || 'Unknown',
        createdAt: studio.created_at
      }));
      
      setStudios(formattedStudios);
      
      // 어드민용 마스터 스튜디오는 별도로 추가
      if (isAdmin() && !formattedStudios.some((s: any) => s.id === 1)) {
        const masterStudio = {
          id: 1,
          name: '마스터 스튜디오',
          description: '프리미엄 프로젝트 전용',
          inviteCode: 'MASTER00',
          memberCount: 0,
          projectCount: 0,
          owner: 'HSG202',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setStudios([masterStudio, ...formattedStudios]);
      }
    } catch (error) {
      console.error('스튜디오 로드 실패:', error);
      // 오류 발생 시 어드민용 마스터 스튜디오만 표시
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
    } finally {
      setLoadingData(false);
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

  const loadProjects = async (studioId: number) => {
    setLoadingData(true);
    try {
      const data = await projectsApi.list(studioId.toString());
      setProjects(data.map((project: any) => ({
        id: project.id,
        channelId: project.studio_id || studioId,
        title: project.title,
        episode: `EP${project.id}`,
        status: project.status || 'waiting_sketch',
        progress: 0,
        dueDate: project.deadline || '',
        assignee: project.creator_name || '',
        lastUpdated: project.updated_at || project.created_at,
        totalScenes: project.scene_count || 0,
        completedScenes: 0,
        author: project.creator_name || '',
        artist: '',
        createdAt: project.created_at
      })));
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      setProjects([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectProject = async (project: any) => {
    setSelectedProject(project);
    await loadStoryboard(project.id);
    setCurrentView('scene');
  };

  const loadStoryboard = async (projectId: number) => {
    setLoadingData(true);
    try {
      const scenes = await scenesApi.list(projectId.toString());
      
      if (scenes.length === 0) {
        // 씬이 없으면 기본 씬 생성
        const newScene = await scenesApi.create({
          project_id: projectId.toString(),
          scene_number: 1,
          title: '씬 1',
          description: '',
          dialogue: '',
          action_description: ''
        });
        
        setStoryboard({
          id: projectId,
          title: selectedProject?.title || '새 프로젝트',
          scenes: [{
            id: newScene.id,
            title: newScene.title,
            description: newScene.description || '',
            narration: newScene.dialogue || '',
            sound: newScene.action_description || '',
            status: newScene.status || 'draft_pending',
            sketchUrl: null,
            artworkUrl: null,
            images: [],
            comments: []
          }]
        });
      } else {
        // 기존 씬들 로드
        const formattedScenes = await Promise.all(scenes.map(async (scene: any) => {
          try {
            const sceneDetail = await scenesApi.get(scene.id.toString());
            return {
              id: scene.id,
              title: scene.title,
              description: scene.description || '',
              narration: scene.dialogue || '',
              sound: scene.action_description || '',
              status: scene.status || 'draft_pending',
              sketchUrl: sceneDetail.images?.find((img: any) => img.type === 'draft')?.file_path || null,
              artworkUrl: sceneDetail.images?.find((img: any) => img.type === 'artwork')?.file_path || null,
              images: sceneDetail.images || [],
              comments: sceneDetail.comments || []
            };
          } catch (error) {
            console.error(`씬 ${scene.id} 상세 정보 로드 실패:`, error);
            return {
              id: scene.id,
              title: scene.title,
              description: scene.description || '',
              narration: scene.dialogue || '',
              sound: scene.action_description || '',
              status: scene.status || 'draft_pending',
              sketchUrl: null,
              artworkUrl: null,
              images: [],
              comments: []
            };
          }
        }));
        
        setStoryboard({
          id: projectId,
          title: selectedProject?.title || '새 프로젝트',
          scenes: formattedScenes
        });
        
        // 현재 씬의 댓글 설정
        if (formattedScenes[currentScene]) {
          setComments(formattedScenes[currentScene].comments);
        }
      }
    } catch (error) {
      console.error('스토리보드 로드 실패:', error);
      // 오류 발생 시 기본 구조 설정
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
            artworkUrl: null,
            images: [],
            comments: []
          }
        ]
      });
      setComments([]);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
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
                onSceneCountUpdate={(projectId: number, newCount: number) => {
                  // 프로젝트 목록에서 씬 카운트 업데이트
                  setProjects(projects.map(p => 
                    p.id === projectId ? { ...p, totalScenes: newCount } : p
                  ));
                }}
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