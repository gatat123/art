import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

type ViewType = 'login' | 'studios' | 'project' | 'scene';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('login');

  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentView('studios');
      } else {
        setCurrentView('login');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // 임시 UI - 나중에 완성된 컴포넌트로 교체
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Storyboard Studio</h1>
        {user ? (
          <div>
            <p>Welcome, {user.username}!</p>
            <button 
              onClick={() => {/* logout */}} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>Please login to continue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;