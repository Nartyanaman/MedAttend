import React, { useState } from 'react';
import { registerUser, validatePassword } from '../utils/auth';

interface SignUpProps {
  onSignUp: () => void;
  onSwitchToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = password ? validatePassword(password) : null;
  const passwordsMatch = password && confirmPassword ? password === confirmPassword : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    // Validate password
    if (passwordValidation && !passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '));
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = registerUser(username.trim(), password);
    
    if (result.success) {
      // Auto-login after successful registration
      const loginResult = await import('../utils/auth').then(m => m.loginUser(username.trim(), password));
      if (loginResult.success) {
        onSignUp();
      } else {
        setError('Account created but login failed. Please sign in manually.');
      }
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
          <p className="text-slate-500 font-medium">Create your account</p>
        </div>

        {/* Sign Up Form */}
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
                  placeholder="Choose a username"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                  autoFocus
                  disabled={loading}
                />
              </div>
              {username && username.trim().length < 3 && (
                <p className="text-xs text-rose-500 font-bold">Username must be at least 3 characters</p>
              )}
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
                  placeholder="Create a password"
                  className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-14 pr-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 transition-all shadow-inner placeholder-slate-300 ${
                    passwordValidation && !passwordValidation.isValid
                      ? 'border-rose-200 focus:border-rose-400'
                      : passwordValidation && passwordValidation.isValid
                      ? 'border-emerald-200 focus:border-emerald-400'
                      : 'border-slate-100 focus:border-blue-500'
                  }`}
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
              
              {/* Password Requirements */}
              {password && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Password Requirements:</p>
                  <div className="space-y-1.5">
                    <div className={`flex items-center gap-2 text-xs ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <i className={`fas ${password.length >= 8 ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                      <span className="font-bold">At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                      <span className="font-bold">One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <i className={`fas ${/[a-z]/.test(password) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                      <span className="font-bold">One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <i className={`fas ${/[0-9]/.test(password) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                      <span className="font-bold">One number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <i className="fas fa-lock text-lg"></i>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-14 pr-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 transition-all shadow-inner placeholder-slate-300 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-rose-200 focus:border-rose-400'
                      : confirmPassword && passwordsMatch
                      ? 'border-emerald-200 focus:border-emerald-400'
                      : 'border-slate-100 focus:border-blue-500'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-[10px]"></i>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && passwordsMatch && passwordValidation?.isValid && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <i className="fas fa-check-circle text-[10px]"></i>
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !username.trim() ||
                !password ||
                !confirmPassword ||
                !passwordValidation?.isValid ||
                !passwordsMatch
              }
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500 mb-4">
              Already have an account?
            </p>
            <button
              onClick={onSwitchToSignIn}
              className="w-full py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
            >
              Sign In Instead
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

export default SignUp;
