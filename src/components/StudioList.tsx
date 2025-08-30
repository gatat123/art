import React, { useState } from 'react';
import { 
  Plus, Users, Briefcase, Settings, LogOut, Grid, 
  List, Search, MoreVertical, Copy, RefreshCw, Check
} from 'lucide-react';

type ViewType = 'login' | 'studios' | 'project' | 'scene';

interface Studio {
  id: number;
  name: string;
  description: string;
  inviteCode: string;
  memberCount: number;
  projectCount: number;
  owner: string;
  createdAt: string;
  joinedAt?: string;  // 참가 시간 추가
}

interface StudioListProps {
  studios: Studio[];
  setStudios: (studios: Studio[]) => void;
  onSelectStudio: (studio: Studio) => void;
  onLogout: () => void;
}

const StudioList: React.FC<StudioListProps> = ({ 
  studios, 
  setStudios, 
  onSelectStudio, 
  onLogout 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedStudioForInvite, setSelectedStudioForInvite] = useState<Studio | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioDescription, setNewStudioDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const username = localStorage.getItem('username') || 'User';
  const userRole = localStorage.getItem('userRole') || 'user';
  const isAdmin = userRole === 'admin';

  // 초대코드 생성 함수
  const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // 초대코드 복사 함수
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 새 초대코드 생성
  const regenerateInviteCode = (studioId: number) => {
    const newCode = generateInviteCode();
    setStudios(studios.map(studio => 
      studio.id === studioId 
        ? { ...studio, inviteCode: newCode }
        : studio
    ));
    return newCode;
  };

  const handleCreateStudio = () => {
    if (newStudioName.trim()) {
      const newStudio: Studio = {
        id: Date.now(),
        name: newStudioName,
        description: newStudioDescription,
        inviteCode: generateInviteCode(),
        memberCount: 1,
        projectCount: 0,
        owner: username,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStudios([...studios, newStudio]);
      setNewStudioName('');
      setNewStudioDescription('');
      setShowCreateModal(false);
    }
  };

  const handleJoinStudio = () => {
    if (!joinCode.trim()) {
      alert('초대코드를 입력해주세요.');
      return;
    }

    // 데모 초대코드 처리
    const demoStudio: Studio = {
      id: Date.now(),
      name: `초대받은 스튜디오 ${joinCode}`,
      description: '초대코드로 참가한 스튜디오입니다.',
      inviteCode: joinCode.toUpperCase(),
      memberCount: 5,
      projectCount: 3,
      owner: 'Studio Owner',
      createdAt: new Date().toISOString().split('T')[0],
      joinedAt: new Date().toISOString()  // 참가 시간 기록
    };

    // 스튜디오 목록에 추가 (중복 체크)
    if (!studios.find(s => s.inviteCode === joinCode.toUpperCase())) {
      setStudios([...studios, demoStudio]);
      alert(`스튜디오에 참가했습니다!`);
    } else {
      alert('이미 참가한 스튜디오입니다.');
    }
    
    setJoinCode('');
    setShowJoinModal(false);
    // onSelectStudio(demoStudio); // 바로 이동하지 않음
  };

  const openInviteModal = (studio: Studio) => {
    setSelectedStudioForInvite(studio);
    setGeneratedCode(studio.inviteCode);
    setShowInviteModal(true);
  };

  const filteredStudios = studios.filter(studio =>
    studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    studio.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Studio</h1>
              {isAdmin && (
                <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">안녕하세요, {username}님</span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-black"
              >
                <LogOut size={20} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="스튜디오 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 border border-black rounded-lg hover:bg-gray-50"
            >
              초대코드로 참가
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <Plus size={20} />
              <span>새 스튜디오</span>
            </button>
          </div>
        </div>

        {/* Studios Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudios.map((studio) => {
              const isNew = studio.joinedAt && 
                new Date(studio.joinedAt) > new Date(Date.now() - 5 * 60 * 1000); // 5분 이내 참가
              
              return (
                <div
                  key={studio.id}
                  className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer relative ${
                    isNew ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  {isNew && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      NEW
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openInviteModal(studio);
                      }}
                      className="text-gray-400 hover:text-black"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <div onClick={() => onSelectStudio(studio)}>
                    <h3 className="text-xl font-bold mb-2">{studio.name}</h3>
                    <p className="text-gray-600 mb-4">{studio.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {studio.memberCount} 멤버
                      </span>
                      <span className="flex items-center">
                        <Briefcase size={16} className="mr-1" />
                        {studio.projectCount} 프로젝트
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">초대코드: {studio.inviteCode}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudios.map((studio) => {
              const isNew = studio.joinedAt && 
                new Date(studio.joinedAt) > new Date(Date.now() - 5 * 60 * 1000); // 5분 이내 참가
              
              return (
                <div
                  key={studio.id}
                  className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer ${
                    isNew ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1" onClick={() => onSelectStudio(studio)}>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold">{studio.name}</h3>
                        {isNew && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{studio.description}</p>
                      <div className="flex space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users size={16} className="mr-1" />
                          {studio.memberCount} 멤버
                        </span>
                        <span className="flex items-center">
                          <Briefcase size={16} className="mr-1" />
                          {studio.projectCount} 프로젝트
                        </span>
                        <span>초대코드: {studio.inviteCode}</span>
                        <span>생성일: {studio.createdAt}</span>
                        <span>소유자: {studio.owner}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openInviteModal(studio);
                      }}
                      className="text-gray-400 hover:text-black ml-4"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredStudios.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">스튜디오가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">새 스튜디오를 만들거나 초대코드로 참가하세요.</p>
          </div>
        )}
      </main>

      {/* Create Studio Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">새 스튜디오 만들기</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">스튜디오 이름</label>
                <input
                  type="text"
                  value={newStudioName}
                  onChange={(e) => setNewStudioName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="스튜디오 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={newStudioDescription}
                  onChange={(e) => setNewStudioDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  placeholder="스튜디오 설명을 입력하세요"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                취소
              </button>
              <button
                onClick={handleCreateStudio}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Studio Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">초대코드로 참가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">초대코드</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-center text-lg"
                  placeholder="ABCD1234"
                  maxLength={8}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                취소
              </button>
              <button
                onClick={handleJoinStudio}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                참가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {showInviteModal && selectedStudioForInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">초대코드 관리</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">{selectedStudioForInvite.name}의 초대코드</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold">{generatedCode}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      copyInviteCode(generatedCode);
                    }}
                    className="p-2 hover:bg-gray-200 rounded relative"
                  >
                    {copiedCode === generatedCode ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const newCode = regenerateInviteCode(selectedStudioForInvite.id);
                      setGeneratedCode(newCode);
                    }}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="새 코드 생성"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">
                이 코드를 팀원에게 공유하여 스튜디오에 초대할 수 있습니다.
                보안을 위해 정기적으로 코드를 갱신하는 것을 권장합니다.
              </p>
            </div>
            {isAdmin && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">관리자 옵션</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">초대코드 활성화</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">자동 만료 설정 (7일)</span>
                  </label>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setSelectedStudioForInvite(null);
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioList;