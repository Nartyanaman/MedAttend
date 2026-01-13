
import React from 'react';
import { AppState } from '../types';

interface SettingsViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onInstallApp?: () => void;
  canInstall?: boolean;
  onLogout?: () => void;
  currentUser?: string | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, setState, onInstallApp, canInstall, onLogout, currentUser }) => {
  const updateSettings = (updated: any) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updated } }));
  };

  const handleBackup = () => {
    const data = JSON.stringify(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedAttend_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleNuclearReset = () => {
    if (window.confirm("WARNING: WIPE ALL CLINICAL RECORDS?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const toggleMYSY = () => {
    const newVal = !state.settings.isMYSY;
    updateSettings({ isMYSY: newVal });
  };

  const toggleReminders = () => {
    const newVal = !state.settings.remindersEnabled;
    updateSettings({ remindersEnabled: newVal });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="px-2 pt-2">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Configuration</p>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">MedAttend Setup</h2>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border-4 border-white shadow-2xl overflow-hidden mb-6">
                {state.settings.profilePhoto ? (
                    <img src={state.settings.profilePhoto} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-200 bg-blue-50 text-3xl">
                        <i className="fas fa-user-doctor"></i>
                    </div>
                )}
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Dr. {state.settings.name || 'Medico'}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{state.settings.college}</p>
          </div>
      </div>

      {/* Local App Installation Card */}
      {canInstall && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl border border-slate-700 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
            <i className="fas fa-mobile-screen text-8xl"></i>
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Device Integration</p>
              <h4 className="text-lg font-black tracking-tight leading-none">Install Local App</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">Place MedAttend on your Home Screen for offline access and native clinical alerts.</p>
            </div>
            <button 
              onClick={onInstallApp}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all border-b-4 border-blue-800"
            >
              <i className="fas fa-cloud-arrow-down"></i> Download Now
            </button>
          </div>
        </div>
      )}

      {/* Professional Controls */}
      <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">System Protocols</h4>
          
          <button 
            onClick={toggleReminders}
            className={`w-full p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all active:scale-95 ${state.settings.remindersEnabled ? 'bg-blue-500 text-white border-blue-600 shadow-xl' : 'bg-white text-slate-800 border-slate-100 shadow-sm'}`}
          >
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.settings.remindersEnabled ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                      <i className="fas fa-bell"></i>
                  </div>
                  <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Attendance Reminders</p>
                      <p className={`text-[9px] font-bold ${state.settings.remindersEnabled ? 'text-blue-100' : 'text-slate-400'}`}>
                        {state.settings.remindersEnabled ? 'Active Clinical Alerts' : 'Notifications Silenced'}
                      </p>
                  </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-all ${state.settings.remindersEnabled ? 'bg-white' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${state.settings.remindersEnabled ? 'right-1 bg-blue-500' : 'left-1 bg-white'}`}></div>
              </div>
          </button>

          <button 
            onClick={toggleMYSY}
            className={`w-full p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all active:scale-95 ${state.settings.isMYSY ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xl' : 'bg-white text-slate-800 border-slate-100 shadow-sm'}`}
          >
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.settings.isMYSY ? 'bg-white/30' : 'bg-amber-50 text-amber-500'}`}>
                      <i className="fas fa-crown"></i>
                  </div>
                  <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">MYSY Scholar Mode</p>
                      <p className={`text-[9px] font-bold ${state.settings.isMYSY ? 'text-amber-900' : 'text-slate-400'}`}>
                        {state.settings.isMYSY ? 'Targets: 80% T | 85% P' : 'Standard: 75% T | 80% P'}
                      </p>
                  </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-all ${state.settings.isMYSY ? 'bg-white' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${state.settings.isMYSY ? 'right-1 bg-amber-600' : 'left-1 bg-white'}`}></div>
              </div>
          </button>

          <button onClick={handleBackup} className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-4 shadow-sm active:scale-95 transition-all text-slate-700">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-cloud-arrow-down"></i></div>
              <div className="text-left flex-1">
                  <p className="text-xs font-black uppercase tracking-widest">Generate Cloud Backup</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Save Registry to Local Storage</p>
              </div>
          </button>

          <button 
            onClick={handleNuclearReset}
            className="w-full p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 active:scale-95 transition-all text-rose-700"
          >
              <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-200"><i className="fas fa-trash-can"></i></div>
              <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest">Nuclear Reset</p>
                  <p className="text-[9px] font-bold text-rose-400 uppercase">Wipe database completely</p>
              </div>
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              className="w-full p-6 bg-slate-800 text-white rounded-[2rem] flex items-center gap-4 active:scale-95 transition-all shadow-xl border border-slate-700"
            >
                <div className="w-10 h-10 bg-slate-700 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-sign-out-alt"></i></div>
                <div className="text-left flex-1">
                    <p className="text-xs font-black uppercase tracking-widest">Sign Out</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">
                      {currentUser ? `Logged in as ${currentUser}` : 'End current session'}
                    </p>
                </div>
            </button>
          )}
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-8 space-y-4">
          <div className="flex justify-center gap-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-blue-500">Privacy Policy</a>
              <a href="#" className="hover:text-blue-500">Terms of Use</a>
          </div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
            MedAttend Pro v1.0.4-stable<br/>
            Engineered for clinical excellence.
          </p>
      </div>
    </div>
  );
};

export default SettingsView;
