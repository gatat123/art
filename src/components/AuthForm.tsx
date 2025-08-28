import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await onLogin(username, password);
      } else {
        if (!email.includes('@')) {
          setError('유효한 이메일 주소를 입력해주세요');
          setLoading(false);
          return;
        }
        await onRegister(username, email, password);
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Storyboard Studio
          </h1>
          <p className="text-gray-600">
            웹툰 제작을 위한 협업 플랫폼
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isLogin ? '로그인' : '회원가입'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="사용자명 입력"
                required
                disabled={loading}
              />
            </div>

            {/* Email (only for register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="email@example.com"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder={isLogin ? '비밀번호 입력' : '비밀번호 (6자 이상)'}
                  required
                  disabled={loading}
                  minLength={isLogin ? 1 : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  처리 중...
                </>
              ) : (
                isLogin ? '로그인' : '회원가입'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-black font-semibold hover:underline"
                disabled={loading}
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>

          {/* Demo Account Info */}
          {isLogin && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">데모 계정:</p>
              <div className="text-xs text-gray-700 space-y-1">
                <div>사용자명: demo</div>
                <div>비밀번호: demo123</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          © 2024 Storyboard Studio. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthForm;