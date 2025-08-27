import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProjectData {
  title: string;
  episode: string;
  artist: string;
  dueDate: string;
  totalScenes: number;
  description: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: any) => void;
  channelName?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  channelName 
}) => {
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    episode: '',
    artist: '',
    dueDate: '',
    totalScenes: 5,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...projectData,
      id: Date.now(),
      status: 'in_progress',
      progress: 0,
      assignee: projectData.artist,
      lastUpdated: '방금',
      completedScenes: 0,
      author: '나',
      createdAt: new Date().toISOString().split('T')[0],
      scenes: []
    });
    setProjectData({
      title: '',
      episode: '',
      artist: '',
      dueDate: '',
      totalScenes: 5,
      description: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">새 프로젝트 만들기</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">프로젝트 제목</label>
            <input
              type="text"
              required
              value={projectData.title}
              onChange={(e) => setProjectData({...projectData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              placeholder="프로젝트 제목을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">에피소드</label>
              <input
                type="text"
                required
                value={projectData.episode}
                onChange={(e) => setProjectData({...projectData, episode: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                placeholder="EP.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">담당 아티스트</label>
              <input
                type="text"
                required
                value={projectData.artist}
                onChange={(e) => setProjectData({...projectData, artist: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                placeholder="아티스트 이름"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">마감일</label>
              <input
                type="date"
                required
                value={projectData.dueDate}
                onChange={(e) => setProjectData({...projectData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">총 씬 개수</label>
              <input
                type="number"
                min="1"
                required
                value={projectData.totalScenes}
                onChange={(e) => setProjectData({...projectData, totalScenes: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">프로젝트 설명</label>
            <textarea
              value={projectData.description}
              onChange={(e) => setProjectData({...projectData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
              rows={3}
              placeholder="프로젝트에 대한 간단한 설명"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
