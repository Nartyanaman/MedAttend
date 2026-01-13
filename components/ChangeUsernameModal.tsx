import React, { useState } from 'react';
import { getStoredUsers, registerUser } from '../utils/auth';

interface ChangeUsernameModalProps {
  currentUsername: string;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

const ChangeUsernameModal: React.FC<ChangeUsernameModalProps> = ({ currentUsername, onSuccess, onClose }) => {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      setLoading(false);
      return;
    }

    if (newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (newUsername.trim().toLowerCase() === currentUsername.toLowerCase()) {
      setError('New username must be different from current username');
      setLoading(false);
      return;
    }

    // Check if username already exists
    const users = getStoredUsers();
    if (users.find(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setError('Username already exists');
      setLoading(false);
      return;
    }

    // Update username in stored users
    const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUsername.toLowerCase());
    if (userIndex !== -1) {
      users[userIndex].username = newUsername.trim();
      localStorage.setItem('medattend_users', JSON.stringify(users));
      
      // Update auth state
      const authData = localStorage.getItem('medattend_auth');
      if (authData) {
        const auth = JSON.parse(authData);
        auth.currentUser = newUsername.trim();
        localStorage.setItem('medattend_auth', JSON.stringify(auth));
      }
    }

    setLoading(false);
    onSuccess(newUsername.trim());
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border-t-8 border-blue-600">
        <div className="p-8 pb-4 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Change Username</h3>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Update Your Identity</p>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Username</label>
            <input
              type="text"
              value={currentUsername}
              disabled
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">New Username</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <i className="fas fa-user text-lg"></i>
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                autoFocus
                disabled={loading}
              />
            </div>
            {newUsername && newUsername.trim().length < 3 && (
              <p className="text-xs text-rose-500 font-bold">Username must be at least 3 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !newUsername.trim() || newUsername.trim().length < 3 || newUsername.trim().toLowerCase() === currentUsername.toLowerCase()}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                <span>Update Username</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeUsernameModal;
