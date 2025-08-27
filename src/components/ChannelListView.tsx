import React from 'react';
import { Hash, Lock, Unlock, LogIn } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  password: string;
  createdAt: string;
  projectCount: number;
}

interface ChannelListViewProps {
  channels: Channel[];
  channelAuth: Record<number, boolean>;
  newChannel: { name: string; password: string };
  authPassword: string;
  authError: string;
  setChannels: (channels: Channel[]) => void;
  setChannelAuth: (auth: Record<number, boolean>) => void;
  setCurrentChannel: (channel: any) => void;
  setCurrentView: (view: string) => void;
  setNewChannel: (channel: { name: string; password: string }) => void;
  setAuthPassword: (password: string) => void;
  setAuthError: (error: string) => void;
}

const ChannelListView: React.FC<ChannelListViewProps> = ({
  channels,
  channelAuth,
  newChannel,
  authPassword,
  authError,
  setChannels,
  setChannelAuth,
  setCurrentChannel,
  setCurrentView,
  setNewChannel,
  setAuthPassword,
  setAuthError
}) => {
  const createChannel = () => {
    if (newChannel.name && newChannel.password) {
      const channel: Channel = {
        id: Date.now(),
        name: newChannel.name,
        password: newChannel.password,
        createdAt: new Date().toISOString().split('T')[0],
        projectCount: 0
      };
      const updatedChannels = [...channels, channel];
      setChannels(updatedChannels);
      if (typeof window !== 'undefined') {
        localStorage.setItem('channels', JSON.stringify(updatedChannels));
      }
      setNewChannel({ name: '', password: '' });
      setChannelAuth({ ...channelAuth, [channel.id]: true });
      setCurrentChannel(channel);
      setCurrentView('project');
    }
  };

  const authenticateChannel = (channel: Channel) => {
    if (authPassword === channel.password) {
      setChannelAuth({ ...channelAuth, [channel.id]: true });
      setCurrentChannel(channel);
      setCurrentView('project');
      setAuthPassword('');
      setAuthError('');
    } else {
      setAuthError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Hash className="w-8 h-8" />
              <h1 className="text-2xl font-bold">채널</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">새 채널 만들기</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="채널 이름"
              value={newChannel.name}
              onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:border-black"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={newChannel.password}
              onChange={(e) => setNewChannel({...newChannel, password: e.target.value})}
              className="w-48 px-3 py-2 border rounded focus:outline-none focus:border-black"
            />
            <button
              onClick={createChannel}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              생성
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => (
            <div 
              key={channel.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Hash size={20} />
                    {channel.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    프로젝트 {channel.projectCount}개
                  </p>
                </div>
                {channelAuth[channel.id] ? (
                  <Unlock className="text-green-500" size={20} />
                ) : (
                  <Lock className="text-gray-400" size={20} />
                )}
              </div>

              <div className="text-sm text-gray-500 mb-4">
                생성일: {channel.createdAt}
              </div>

              {channelAuth[channel.id] ? (
                <button
                  onClick={() => {
                    setCurrentChannel(channel);
                    setCurrentView('project');
                  }}
                  className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  입장하기
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      setAuthError('');
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && authenticateChannel(channel)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                  />
                  {authError && (
                    <p className="text-red-500 text-xs">{authError}</p>
                  )}
                  <button
                    onClick={() => authenticateChannel(channel)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <LogIn size={16} className="inline mr-2" />
                    인증하기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelListView;
