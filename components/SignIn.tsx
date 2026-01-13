import React, { useState } from 'react';
import { loginUser } from '../utils/auth';

interface SignInProps {
  onSignIn: () => void;
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSwitchToSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = loginUser(username.trim(), password);
    
    if (result.success) {
      onSignIn();
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-blue-200">
            <i className="fas fa-stethoscope text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">MedAttend</h1>
          <p className="text-slate-500 font-medium">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 animate-slideUp">
                <i className="fas fa-exclamation-circle"></i>
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <i className="fas fa-user text-lg"></i>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <i className="fas fa-lock text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-14 pr-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500 mb-4">
              Don't have an account?
            </p>
            <button
              onClick={onSwitchToSignUp}
              className="w-full py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
            >
              Create New Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8 font-bold">
          Built by Medicos, for Medicos
        </p>
      </div>
    </div>
  );
};

export default SignIn;
