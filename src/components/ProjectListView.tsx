import React from 'react';
import { 
  ArrowLeft, Hash, Bell, Filter, FolderOpen, User, Calendar 
} from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';

type ViewType = 'login' | 'studios' | 'project' | 'scene';

interface Project {
  id: number;
  channelId: number;
  title: string;
  episode: string;
  status: string;
  progress: number;
  dueDate: string;
  assignee: string;
  lastUpdated: string;
  totalScenes: number;
  completedScenes: number;
  author: string;
  artist: string;
  createdAt: string;
}

interface ProjectListViewProps {
  currentChannel: any;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  channels: any[];
  setChannels: (channels: any[]) => void;
  setCurrentView: (view: ViewType) => void;
  setCurrentProject: (project: Project) => void;
  setStoryboard: (storyboard: any) => void;
  notifications: number;
  showCreateProject: boolean;
  setShowCreateProject: (show: boolean) => void;
}
const ProjectListView: React.FC<ProjectListViewProps> = ({
  currentChannel,
  projects,
  setProjects,
  channels,
  setChannels,
  setCurrentView,
  setCurrentProject,
  setStoryboard,
  notifications,
  showCreateProject,
  setShowCreateProject
}) => {
  const channelProjects = projects.filter(p => p.channelId === currentChannel?.id);

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

  const createProject = (projectData: any) => {
    const newProject = {
      ...projectData,
      channelId: currentChannel.id,
      author: projectData.author || "나",
      artist: projectData.artist || "",
      createdAt: new Date().toISOString().split('T')[0],
      scenes: Array.from({ length: projectData.totalScenes }, (_, i) => ({
        id: Date.now() + i,
        title: `씬 ${i + 1}`,
        status: 'waiting_sketch',
        narration: '',
        description: '',
        sound: '',
        sketchUrl: null,
        artworkUrl: null,
        feedback: [],
        versions: []
      }))
    };
    
    setProjects([...projects, newProject]);
    setShowCreateProject(false);
    
    const updatedChannels = channels.map(ch => 
      ch.id === currentChannel.id 
        ? { ...ch, projectCount: ch.projectCount + 1 }
        : ch
    );
    setChannels(updatedChannels);
    if (typeof window !== 'undefined') {
      localStorage.setItem('channels', JSON.stringify(updatedChannels));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('studios')}
                className="flex items-center space-x-2 text-gray-600 hover:text-black"
              >
                <ArrowLeft size={20} />
                <span>채널 목록</span>
              </button>
              <div className="flex items-center space-x-2">
                <Hash size={20} />
                <h1 className="text-2xl font-bold">{currentChannel?.name}</h1>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                {channelProjects.length}개 프로젝트
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded relative">
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowCreateProject(true)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                새 프로젝트
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            <Filter size={16} />
            <span>필터</span>
          </button>
          <button className="px-3 py-1 bg-black text-white rounded text-sm">전체</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded text-sm">진행중</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded text-sm">검토중</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded text-sm">완료</button>
        </div>
      </div>

      <div className="p-6">
        {channelProjects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">아직 프로젝트가 없습니다</p>
            <button 
              onClick={() => setShowCreateProject(true)}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              첫 프로젝트 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channelProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => {
                  setCurrentProject(project);
                  setStoryboard({
                    ...project,
                    scenes: (project as any).scenes || []
                  });
                  setCurrentView('scene');
                }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{project.title}</h3>
                    <p className="text-gray-500 text-sm">{project.episode}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(project.status).bg} ${getStatusStyle(project.status).text}`}>
                    {getStatusStyle(project.status).label}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">진행률</span>
                    <span className="font-medium">{project.completedScenes}/{project.totalScenes} 씬</span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-black rounded-full h-2" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <User size={14} />
                      <span className="text-gray-600">{project.assignee}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span className="text-gray-600">{project.dueDate}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    마지막 업데이트: {project.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onCreate={createProject}
        channelName={currentChannel?.name}
      />
    </div>
  );
};

export default ProjectListView;
