import React, { useState } from 'react';
import { getStoredUsers, getAuthState, validatePassword } from '../utils/auth';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onSuccess, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = newPassword ? validatePassword(newPassword) : null;
  const passwordsMatch = newPassword && confirmPassword ? newPassword === confirmPassword : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    // Validate new password
    if (passwordValidation && !passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    // Verify current password
    const authState = getAuthState();
    const users = getStoredUsers();
    const user = users.find(u => u.username === authState.currentUser);

    if (!user || user.password !== currentPassword) {
      setError('Current password is incorrect');
      setLoading(false);
      return;
    }

    // Update password
    user.password = newPassword; // In production, hash this
    localStorage.setItem('medattend_users', JSON.stringify(users));

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border-t-8 border-blue-600 max-h-[90vh] overflow-y-auto">
        <div className="p-8 pb-4 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Change Password</h3>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Secure Your Account</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center active:scale-75 transition-all shadow-sm border border-slate-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 animate-slideUp">
              <i className="fas fa-exclamation-circle"></i>
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Password</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <i className="fas fa-lock text-lg"></i>
              </div>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-14 pr-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">New Password</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <i className="fas fa-lock text-lg"></i>
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
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
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
              </button>
            </div>
            
            {newPassword && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Password Requirements:</p>
                <div className="space-y-1.5">
                  <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <i className={`fas ${newPassword.length >= 8 ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                    <span className="font-bold">At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <i className={`fas ${/[A-Z]/.test(newPassword) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                    <span className="font-bold">One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <i className={`fas ${/[a-z]/.test(newPassword) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                    <span className="font-bold">One lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <i className={`fas ${/[0-9]/.test(newPassword) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
                    <span className="font-bold">One number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Confirm New Password</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <i className="fas fa-lock text-lg"></i>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
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
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              !passwordValidation?.isValid ||
              !passwordsMatch ||
              currentPassword === newPassword
            }
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <i className="fas fa-key"></i>
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
