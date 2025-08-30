import React, { useState } from 'react';
import { authApi } from '@/lib/api';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 실제 백엔드 API로 로그인 시도
        try {
          const result = await authApi.login({ username, password });
          
          // 어드민 체크
          if (result.user.username === 'HSG202') {
            localStorage.setItem('userRole', 'admin');
          } else {
            localStorage.setItem('userRole', result.user.role || 'user');
          }
          localStorage.setItem('username', result.user.username);
          
          await onLogin(username, password);
        } catch (apiError) {
          // 백엔드가 없을 경우 데모 로그인 허용
          if (username === 'demo' && password === 'demo123') {
            localStorage.setItem('authToken', 'demo-token-' + Date.now());
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('username', 'demo');
            await onLogin(username, password);
          } else {
            throw new Error('잘못된 사용자명 또는 비밀번호입니다');
          }
        }
      } else {
        // 회원가입
        const result = await authApi.register({ username, email, password });
        localStorage.setItem('username', result.user.username);
        localStorage.setItem('userRole', result.user.role || 'user');
        await onRegister(username, email, password);
      }
    } catch (err: any) {
      setError(err.message || '인증 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Studio</h1>
        <p className="text-gray-600 text-center mb-8">
          {isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자명
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={isLogin ? "demo 또는 HSG202" : "사용자명"}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="example@email.com"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={isLogin ? "demo123 또는 1004mobil!#" : "비밀번호 (6자 이상)"}
              required
              minLength={isLogin ? undefined : 6}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-2 text-black font-medium hover:underline"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">데모 계정:</p>
            <p className="text-sm text-gray-700">
              사용자명: <span className="font-mono">demo</span><br />
              비밀번호: <span className="font-mono">demo123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
