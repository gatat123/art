import React, { useState } from 'react';
import { Plus, Users, FolderOpen, LogOut, Settings, ChevronRight } from 'lucide-react';

interface Studio {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  memberCount: number;
  projectCount: number;
  owner: string;
  createdAt: string;
}

type ViewType = 'login' | 'studios' | 'project' | 'scene';

interface StudioListProps {
  studios: Studio[];
  setStudios: (studios: Studio[]) => void;
  setSelectedStudio: (studio: Studio) => void;
  setCurrentView: (view: ViewType) => void;
  user: any;
  onLogout: () => void;
}

const StudioList: React.FC<StudioListProps> = ({
  studios,
  setStudios,
  setSelectedStudio,
  setCurrentView,
  user,
  onLogout
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [studioName, setStudioName] = useState('');
  const [studioDescription, setStudioDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreateStudio = () => {
    if (!studioName) return;
    
    const newStudio: Studio = {
      id: Date.now(),
      name: studioName,
      description: studioDescription,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      memberCount: 1,
      projectCount: 0,
      owner: user?.username || 'Me',
      createdAt: new Date().toISOString()
    };
    
    setStudios([...studios, newStudio]);
    setShowCreateModal(false);
    setStudioName('');
    setStudioDescription('');
  };

  const handleJoinStudio = () => {
    if (!inviteCode) return;
    
    // 실제로는 API 호출로 스튜디오 정보를 가져와야 함
    const joinedStudio: Studio = {
      id: Date.now(),
      name: '참여한 스튜디오',
      description: '초대 코드로 참여한 스튜디오',
      inviteCode: inviteCode,
      memberCount: 5,
      projectCount: 2,
      owner: 'Other User',
      createdAt: new Date().toISOString()
    };
    
    setStudios([...studios, joinedStudio]);
    setShowJoinModal(false);
    setInviteCode('');
  };

  const handleSelectStudio = (studio: Studio) => {
    setSelectedStudio(studio);
    setCurrentView('project');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Storyboard Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, <span className="font-medium">{user?.username}</span>님
              </span>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="로그아웃"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">내 스튜디오</h2>
          <p className="text-gray-600">스튜디오를 선택하거나 새로 만들어보세요</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus size={20} />
            스튜디오 만들기
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Users size={20} />
            초대 코드로 참여
          </button>
        </div>

        {/* Studios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <div
              key={studio.id}
              onClick={() => handleSelectStudio(studio)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{studio.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{studio.description}</p>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{studio.memberCount}명</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderOpen size={16} />
                    <span>{studio.projectCount}개</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">소유자: {studio.owner}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {studio.inviteCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {studios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 참여한 스튜디오가 없습니다
            </h3>
            <p className="text-gray-600">
              새 스튜디오를 만들거나 초대 코드로 참여해보세요
            </p>
          </div>
        )}
      </main>

      {/* Create Studio Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">새 스튜디오 만들기</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  스튜디오 이름
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="예: 드림 스튜디오"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택)
                </label>
                <textarea
                  value={studioDescription}
                  onChange={(e) => setStudioDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  rows={3}
                  placeholder="스튜디오에 대한 간단한 설명"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateStudio}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                만들기
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Studio Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">스튜디오 참여하기</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                초대 코드
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="예: DREAM2024"
                maxLength={10}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleJoinStudio}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                참여하기
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioList;