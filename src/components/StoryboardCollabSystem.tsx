import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, MessageCircle, Check, Clock, User, ChevronLeft, ChevronRight, 
  MoreHorizontal, Send, Image, FileText, Layers, Home, FolderOpen,
  Download, Eye, EyeOff, AlertCircle, CheckCircle, XCircle, 
  ArrowLeft, Share2, Bell, Search, Filter, Users, Calendar,
  Pencil, Trash2, Copy, RefreshCw, Lock, Unlock, Star,
  Plus, Shield, LogIn, Hash, Edit2, X, Reply
} from 'lucide-react';
import SketchCanvas from './SketchCanvas';
import CreateProjectModal from './CreateProjectModal';
import ChannelListView from './ChannelListView';
import ProjectListView from './ProjectListView';
import SceneView from './SceneView';

const StoryboardCollabSystem = () => {
  // 상태 관리
  const [currentView, setCurrentView] = useState('channel-list');
  const [currentChannel, setCurrentChannel] = useState<any>(null);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [showSketch, setShowSketch] = useState(true);
  const [showArtwork, setShowArtwork] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSketchCanvas, setShowSketchCanvas] = useState(false);
  const [pendingSketch, setPendingSketch] = useState<any>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  // 채널 데이터
  const [channels, setChannels] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('channels');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          name: '우리의 영상툰 프로젝트',
          password: '1234',
          createdAt: '2024-05-20',
          projectCount: 2
        }
      ];
    }
    return [];
  });

  const [channelAuth, setChannelAuth] = useState<Record<string, boolean>>({});
  const [newChannel, setNewChannel] = useState({ name: '', password: '' });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 프로젝트 리스트 (채널별)
  const [projects, setProjects] = useState([
    {
      id: 1,
      channelId: 1,
      title: "우리가 몰랐던 이야기",
      episode: "EP.01",
      status: "in_progress",
      progress: 60,
      dueDate: "2024-06-01",
      assignee: "김그림",
      lastUpdated: "2시간 전",
      totalScenes: 5,
      completedScenes: 3,
      author: "나",
      artist: "김그림",
      createdAt: "2024-05-20"
    },
    {
      id: 2,
      channelId: 1,
      title: "밤의 비밀",
      episode: "EP.02",
      status: "review",
      progress: 90,
      dueDate: "2024-05-28",
      assignee: "이아트",
      lastUpdated: "30분 전",
      totalScenes: 4,
      completedScenes: 4,
      author: "나",
      artist: "이아트",
      createdAt: "2024-05-18"
    }
  ]);

  // 현재 프로젝트 데이터
  const [storyboard, setStoryboard] = useState({
    id: 1,
    title: "우리가 몰랐던 이야기",
    episode: "EP.01",
    status: "in_progress",
    author: "나",
    artist: "김그림",
    createdAt: "2024-05-20",
    dueDate: "2024-06-01",
    scenes: [
      {
        id: 1,
        title: "프롤로그",
        status: "artwork_uploaded",
        narration: "그날 밤, 나는 혼자 집으로 돌아가고 있었다. 어두운 골목길이 유독 길게 느껴졌다.",
        description: "어두운 골목길, 주인공 실루엣, 불안한 분위기",
        sound: "BGM: 긴장감 있는 배경음악, SFX: 발소리",
        sketchUrl: "/sketch1.jpg",
        artworkUrl: "/artwork1.jpg",
        feedback: [],
        versions: [
          { id: 1, type: 'sketch', uploadedAt: '2024-05-20 10:00', author: '나' },
          { id: 2, type: 'artwork_v1', uploadedAt: '2024-05-21 14:00', author: '김그림' },
          { id: 3, type: 'artwork_v2', uploadedAt: '2024-05-22 16:00', author: '김그림' }
        ]
      }
    ]
  });

  // View 렌더링
  if (currentView === 'channel-list') {
    return (
      <ChannelListView
        channels={channels}
        channelAuth={channelAuth}
        newChannel={newChannel}
        authPassword={authPassword}
        authError={authError}
        setChannels={setChannels}
        setChannelAuth={setChannelAuth}
        setCurrentChannel={setCurrentChannel}
        setCurrentView={setCurrentView}
        setNewChannel={setNewChannel}
        setAuthPassword={setAuthPassword}
        setAuthError={setAuthError}
      />
    );
  }

  if (currentView === 'project') {
    return (
      <ProjectListView
        currentChannel={currentChannel}
        projects={projects}
        setProjects={setProjects}
        channels={channels}
        setChannels={setChannels}
        setCurrentView={setCurrentView}
        setCurrentProject={setCurrentProject}
        setStoryboard={setStoryboard}
        notifications={notifications}
        showCreateProject={showCreateProject}
        setShowCreateProject={setShowCreateProject}
      />
    );
  }

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
};

export default StoryboardCollabSystem;
