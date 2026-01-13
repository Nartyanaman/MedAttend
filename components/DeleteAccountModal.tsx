import React, { useState } from 'react';
import { getStoredUsers, getAuthState, logoutUser } from '../utils/auth';

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onConfirm, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authState = getAuthState();
  const requiredText = 'DELETE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (confirmText !== requiredText) {
      setError(`Please type "${requiredText}" to confirm`);
      return;
    }

    setLoading(true);

    // Delete user account
    const users = getStoredUsers();
    const filteredUsers = users.filter(u => u.username !== authState.currentUser);
    localStorage.setItem('medattend_users', JSON.stringify(filteredUsers));

    // Logout
    logoutUser();

    // Clear all app data
    localStorage.removeItem('medattend_playstore_v1');

    setLoading(false);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border-t-8 border-rose-600">
        <div className="p-8 pb-4 flex justify-between items-center bg-rose-50/50">
          <div>
            <h3 className="text-xl font-black text-rose-800 tracking-tight">Delete Account</h3>
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em] mt-1">Permanent Action</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center active:scale-75 transition-all shadow-sm border border-slate-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <i className="fas fa-exclamation-triangle text-rose-600 text-xl mt-0.5"></i>
              <div className="flex-1">
                <p className="text-sm font-black text-rose-800 mb-2">Warning: This action cannot be undone!</p>
                <p className="text-xs font-bold text-rose-700 leading-relaxed">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-xs font-bold text-rose-700 mt-2 space-y-1 list-disc list-inside">
                  <li>All your attendance records</li>
                  <li>All your subjects and postings</li>
                  <li>Your profile and settings</li>
                  <li>Your account credentials</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 animate-slideUp">
              <i className="fas fa-exclamation-circle"></i>
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Type <span className="text-rose-600 font-black">{requiredText}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder={requiredText}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 outline-none focus:ring-4 ring-rose-500/10 focus:border-rose-500 transition-all shadow-inner placeholder-slate-300 uppercase tracking-widest"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || confirmText !== requiredText}
              className="flex-2 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-200 active:scale-95 transition-all border-b-4 border-rose-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt"></i>
                  <span>Delete Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
