
import React, { useState, useEffect } from 'react';
import { Posting } from '../types';
import { formatDate, getDaysRemaining } from '../utils/calculations';

interface PostingTrackerProps {
  postings: Posting[];
  onAdd: (p: Omit<Posting, 'id'>) => void;
  onUpdate: (id: string, attended: number) => void;
  onDelete: (id: string) => void;
}

const PostingTracker: React.FC<PostingTrackerProps> = ({ postings, onAdd, onUpdate, onDelete }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({
    department: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requiredDays: 12
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Postings</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white w-10 h-10 rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-all"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {postings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-hospital text-slate-200 text-4xl"></i>
          </div>
          <p className="text-slate-800 font-bold mb-1">No Clinical Rotations</p>
          <p className="text-xs text-slate-400">Track your ward attendance and allowed emergency leaves here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {postings.map(p => (
            <PostingItem 
              key={p.id} 
              posting={p} 
              onUpdate={(att) => onUpdate(p.id, att)} 
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[250] bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl p-8 animate-slideUp">
            <h3 className="text-xl font-black text-slate-800 mb-6">New Rotation</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Department</label>
                <input 
                  type="text" 
                  placeholder="e.g. Medicine, OBGY"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                  value={newPost.department}
                  onChange={e => setNewPost({...newPost, department: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold"
                    value={newPost.startDate}
                    onChange={e => setNewPost({...newPost, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">End Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold"
                    value={newPost.endDate}
                    onChange={e => setNewPost({...newPost, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Days Required (e.g. 12/15)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                  value={newPost.requiredDays}
                  onChange={e => setNewPost({...newPost, requiredDays: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if(!newPost.department) return alert("Enter Department");
                  onAdd({ ...newPost, attendedDays: 0 });
                  setShowAddModal(false);
                  setNewPost({ department: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], requiredDays: 12 });
                }}
                className="flex-2 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                Add Posting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PostingItemProps {
  posting: Posting;
  onUpdate: (a: number) => void;
  onDelete: () => void;
}

const PostingItem: React.FC<PostingItemProps> = ({ posting, onUpdate, onDelete }) => {
  const [attendedInput, setAttendedInput] = useState<string>(posting.attendedDays.toString());
  
  const totalDuration = Math.ceil((new Date(posting.endDate).getTime() - new Date(posting.startDate).getTime()) / (1000*60*60*24)) + 1;
  const leavesAllowed = totalDuration - posting.requiredDays;
  const leavesTaken = posting.attendedDays > 0 ? 0 : 0; // Simplified
  const remainingEmergencyLeaves = leavesAllowed - (totalDuration - (getDaysRemaining(posting.endDate) > 0 ? totalDuration - getDaysRemaining(posting.endDate) : totalDuration) - posting.attendedDays);
  
  // Real logic for leaves remaining
  const daysPassed = Math.max(0, Math.ceil((Date.now() - new Date(posting.startDate).getTime()) / (1000*60*60*24)));
  const currentMissed = daysPassed - posting.attendedDays;
  const emergencyLeavesRemaining = leavesAllowed - currentMissed;

  const remainingDays = getDaysRemaining(posting.endDate);
  const status = posting.attendedDays >= posting.requiredDays ? 'COMPLETE' : remainingDays < 0 ? 'INCOMPLETE' : 'ACTIVE';

  // Sync local state when posting prop changes
  useEffect(() => {
    setAttendedInput(posting.attendedDays.toString());
  }, [posting.attendedDays]);

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
      <button 
        onClick={() => confirm("Delete posting?") && onDelete()}
        className="absolute top-4 right-4 text-slate-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <i className="fas fa-trash-alt text-xs"></i>
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">{posting.department}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(posting.startDate)} • {formatDate(posting.endDate)}</p>
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
          status === 'COMPLETE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
          status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
          'bg-red-50 text-red-600 border-red-100'
        }`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border ${emergencyLeavesRemaining < 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Emergency Leaves</p>
          <p className={`text-xl font-black ${emergencyLeavesRemaining < 0 ? 'text-red-600' : 'text-slate-700'}`}>
            {emergencyLeavesRemaining} left
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Days to Go</p>
          <p className="text-xl font-black text-slate-700">{remainingDays > 0 ? remainingDays : 0}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50">
        <div className="space-y-3">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Days Attended</label>
              <input
                type="text"
                inputMode="numeric"
                value={attendedInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or numbers only
                  if (value === '' || /^\d+$/.test(value)) {
                    setAttendedInput(value);
                    if (value !== '') {
                      const numValue = parseInt(value) || 0;
                      onUpdate(Math.max(0, Math.min(totalDuration, numValue)));
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setAttendedInput('0');
                    onUpdate(0);
                  } else {
                    const numValue = parseInt(value) || 0;
                    const finalValue = Math.max(0, Math.min(totalDuration, numValue));
                    setAttendedInput(finalValue.toString());
                    onUpdate(finalValue);
                  }
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-lg font-black text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
            <div className="flex items-end pb-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">/ {posting.requiredDays} required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingTracker;
