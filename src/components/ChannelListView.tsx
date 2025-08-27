import React from 'react';
import { Shield, LogIn, Hash, Plus, Users, ChevronRight, Lock } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  password: string;
  createdAt: string;
  projectCount: number;
}

interface ChannelListViewProps {
  channels: Channel[];
  channelAuth: Record<string, boolean>;
  newChannel: { name: string; password: string };
  authPassword: string;
  authError: string;
  setChannels: (channels: Channel[]) => void;
  setChannelAuth: (auth: Record<string, boolean>) => void;
  setCurrentChannel: (channel: Channel) => void;
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
  setAuthError,
}) => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const createChannel = () => {
    if (newChannel.name && newChannel.password) {
      const channel = {
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
      setShowCreateModal(false);
    }
  };

  const authenticateChannel = () => {
    if (selectedChannel && authPassword === selectedChannel.password) {
      setChannelAuth({ ...channelAuth, [selectedChannel.id]: true });
      setCurrentChannel(selectedChannel);
      setCurrentView('project');
      setAuthPassword('');
      setAuthError('');
      setShowAuthModal(false);
    } else {
      setAuthError('비밀번호가 올바르지 않습니다');
    }
  };

  const handleChannelClick = (channel: Channel) => {
    if (channelAuth[channel.id]) {
      setCurrentChannel(channel);
      setCurrentView('project');
    } else {
      setSelectedChannel(channel);
      setShowAuthModal(true);
      setAuthError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                Storyboard Studio
              </h1>
              <p className="text-sm text-gray-500 mt-1">Professional collaboration platform</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Channel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {channels.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Hash size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              No channels yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create your first channel to start collaborating on storyboard projects
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create First Channel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => (
              <div
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className="card card-hover p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-2xl flex items-center justify-center">
                      <Hash size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-black transition-colors">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created {channel.createdAt}
                      </p>
                    </div>
                  </div>
                  {channelAuth[channel.id] ? (
                    <div className="badge badge-success">
                      <Lock size={12} />
                      Unlocked
                    </div>
                  ) : (
                    <div className="badge badge-default">
                      <Shield size={12} />
                      Protected
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{channel.projectCount} projects</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-slide-in">
            <h2 className="text-2xl font-bold mb-6">Create New Channel</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter channel name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newChannel.password}
                  onChange={(e) => setNewChannel({ ...newChannel, password: e.target.value })}
                  className="input-field"
                  placeholder="Set channel password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={createChannel}
                className="flex-1 btn-primary"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-slide-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Shield size={32} className="text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold">{selectedChannel.name}</h2>
              <p className="text-gray-500 mt-1">Enter password to access</p>
            </div>
            
            <div>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticateChannel()}
                className="input-field"
                placeholder="Channel password"
                autoFocus
              />
              {authError && (
                <p className="text-red-500 text-sm mt-2">{authError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={authenticateChannel}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Access Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelListView;