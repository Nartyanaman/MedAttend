
import React, { useState, useEffect } from 'react';
import { Subject, Posting, UserSettings, AppState, ComponentType, AttendanceEntry } from './types';
import { DEFAULT_REQUIRED_PCT } from './Constants/constants';
import { getAuthState, logoutUser } from './utils/auth';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import SubjectCard from './components/SubjectCard';
import PostingTracker from './components/PostingTracker';
import OCRModal from './components/OCRModal';
import AddSubjectModal from './components/AddSubjectModal';
import DoctorAI from './components/DoctorAI';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ChangeUsernameModal from './components/ChangeUsernameModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import DeleteAccountModal from './components/DeleteAccountModal';
import ChangePhotoModal from './components/ChangePhotoModal';

const STORAGE_KEY = 'medattend_playstore_v1';

const App: React.FC = () => {
  const [authState, setAuthState] = useState(() => getAuthState());
  const [showSignUp, setShowSignUp] = useState(false);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      subjects: [],
      postings: [],
      history: [],
      settings: {
        name: '',
        bio: 'Future MD/MS',
        college: '',
        year: '1st Prof',
        onboarded: false,
        startMode: 'fresh',
        defaultBaselinePct: 75,
        defaultAttendedCount: 0,
        defaultTotalCount: 0,
        entryType: 'percentage',
        isMYSY: false,
        remindersEnabled: true,
        theme: 'clinical'
      }
    };
  });

  const [activeTab, setActiveTab] = useState('home');
  const [showOCR, setShowOCR] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showDoctor, setShowDoctor] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("To install: Tap the Share icon (iOS) or Menu (Android) and select 'Add to Home Screen'");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleOnboarding = (settings: UserSettings) => {
    setState(prev => ({ 
      ...prev, 
      settings: { ...prev.settings, ...settings, onboarded: true } 
    }));
  };

  const handleSignIn = () => {
    setAuthState(getAuthState());
  };

  const handleSignUp = () => {
    setAuthState(getAuthState());
  };

  const handleLogout = () => {
    logoutUser();
    setAuthState({ isAuthenticated: false, currentUser: null });
    // Reset app state
    setState({
      subjects: [],
      postings: [],
      history: [],
      settings: {
        name: '',
        bio: 'Future MD/MS',
        college: '',
        year: '1st Prof',
        onboarded: false,
        startMode: 'fresh',
        defaultBaselinePct: 75,
        defaultAttendedCount: 0,
        defaultTotalCount: 0,
        entryType: 'percentage',
        isMYSY: false,
        remindersEnabled: true,
        theme: 'clinical'
      }
    });
  };

  const handleProfileAction = (action: 'username' | 'photo' | 'password' | 'logout' | 'delete') => {
    switch (action) {
      case 'username':
        setShowChangeUsername(true);
        break;
      case 'photo':
        setShowChangePhoto(true);
        break;
      case 'password':
        setShowChangePassword(true);
        break;
      case 'logout':
        handleLogout();
        break;
      case 'delete':
        setShowDeleteAccount(true);
        break;
    }
  };

  const handleUsernameChanged = (newUsername: string) => {
    setAuthState({ isAuthenticated: true, currentUser: newUsername });
    setShowChangeUsername(false);
    alert('Username updated successfully!');
  };

  const handlePhotoChanged = (photoBase64: string) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, profilePhoto: photoBase64 }
    }));
    setShowChangePhoto(false);
    alert('Profile photo updated successfully!');
  };

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
    alert('Password updated successfully!');
  };

  const handleAccountDeleted = () => {
    setShowDeleteAccount(false);
    handleLogout();
    alert('Your account has been deleted. You will be redirected to the sign-in page.');
  };

  const deleteAttendance = (entryId: string) => {
    setState(prev => {
      const entry = prev.history.find(e => e.id === entryId);
      if (!entry) return prev;

      return {
        ...prev,
        history: prev.history.filter(e => e.id !== entryId),
        subjects: prev.subjects.map(s => s.id === entry.subjectId ? {
          ...s,
          components: s.components.map(c => c.id === entry.componentId ? { 
            ...c, 
            attended: entry.status === 'present' ? Math.max(0, c.attended - 1) : c.attended,
            total: Math.max(0, c.total - 1)
          } : c)
        } : s)
      };
    });
  };

  const updateAttendance = (subjectId: string, componentId: string, attended: number, total: number, status?: 'present' | 'absent', date?: string) => {
    const effectiveDate = date || new Date().toISOString().split('T')[0];

    setState(prev => {
      const subject = prev.subjects.find(s => s.id === subjectId);
      const component = subject?.components.find(c => c.id === componentId);
      
      let newHistory = [...prev.history];
      if (status && subject && component) {
        const entry: AttendanceEntry = {
          id: crypto.randomUUID(),
          subjectId,
          componentId,
          subjectName: subject.name,
          componentType: component.type,
          date: effectiveDate,
          status,
          timestamp: Date.now()
        };
        newHistory.unshift(entry);
      }

      return {
        ...prev,
        history: newHistory,
        subjects: prev.subjects.map(s => s.id === subjectId ? {
          ...s,
          components: s.components.map(c => c.id === componentId ? { ...c, attended, total } : c)
        } : s)
      };
    });
  };

  const updateComponentCriteria = (subjectId: string, componentId: string, requiredPct: number) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subjectId ? {
        ...s,
        components: s.components.map(c => c.id === componentId ? { ...c, requiredPct } : c)
      } : s)
    }));
  };

  const addSubject = (name: string, componentConfigs: {type: ComponentType, requiredPct: number}[]) => {
    const isBaseline = state.settings.startMode === 'current';
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      components: componentConfigs.map(config => {
        let attended = 0, total = 0, baselinePct = undefined;
        if (isBaseline) {
            if (state.settings.entryType === 'counts') {
                attended = state.settings.defaultAttendedCount || 0;
                total = state.settings.defaultTotalCount || 0;
            } else {
                baselinePct = state.settings.defaultBaselinePct || 75;
                attended = baselinePct;
                total = 100;
            }
        }
        return {
          id: crypto.randomUUID(),
          type: config.type,
          attended,
          total,
          requiredPct: config.requiredPct,
          isBaselineMode: isBaseline,
          baselinePct
        };
      })
    };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  };

  // Posting Handlers
  const addPosting = (p: Omit<Posting, 'id'>) => {
    const newPosting: Posting = { ...p, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, postings: [...prev.postings, newPosting] }));
  };

  const updatePosting = (id: string, attendedDays: number) => {
    setState(prev => ({
      ...prev,
      postings: prev.postings.map(p => p.id === id ? { ...p, attendedDays } : p)
    }));
  };

  const deletePosting = (id: string) => {
    setState(prev => ({
      ...prev,
      postings: prev.postings.filter(p => p.id !== id)
    }));
  };

  // Authentication check
  if (!authState.isAuthenticated) {
    if (showSignUp) {
      return <SignUp onSignUp={handleSignUp} onSwitchToSignIn={() => setShowSignUp(false)} />;
    }
    return <SignIn onSignIn={handleSignIn} onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  // Onboarding check
  if (!state.settings.onboarded) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      profilePhoto={state.settings.profilePhoto}
      currentUser={authState.currentUser}
      onProfileAction={handleProfileAction}
    >
      {activeTab === 'home' && (
        <Dashboard subjects={state.subjects} settings={state.settings} />
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fadeIn pb-12 px-2">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Subjects</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowOCR(true)} className="bg-white text-blue-600 w-11 h-11 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-center active:scale-90 transition-all"><i className="fas fa-magic"></i></button>
              <button onClick={() => setShowAddSubject(true)} className="bg-blue-600 text-white w-11 h-11 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center active:scale-90 transition-all border-b-4 border-blue-800"><i className="fas fa-plus"></i></button>
            </div>
          </div>
          {state.subjects.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-16 text-center shadow-sm">
                <i className="fas fa-microscope text-5xl text-blue-100 mb-6 block"></i>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No active clinical subjects.<br/>Scan timetable or add manually.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.subjects.map(s => (
                <div key={s.id} className="relative group">
                  <button 
                    onClick={() => confirm("Wipe subject data?") && setState(p => ({...p, subjects: p.subjects.filter(sub => sub.id !== s.id)}))}
                    className="absolute top-6 right-6 z-10 text-slate-200 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  ><i className="fas fa-trash-alt text-xs"></i></button>
                  <SubjectCard 
                    subject={s} 
                    onUpdateComponent={updateAttendance} 
                    onUpdateCriteria={(compId, pct) => updateComponentCriteria(s.id, compId, pct)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <CalendarView history={state.history} subjects={state.subjects} onLogAttendance={updateAttendance} onDeleteLog={deleteAttendance} />
      )}

      {activeTab === 'postings' && (
        <PostingTracker 
          postings={state.postings} 
          onAdd={addPosting} 
          onUpdate={updatePosting} 
          onDelete={deletePosting} 
        />
      )}

      {activeTab === 'settings' && (
        <SettingsView 
          state={state} 
          setState={setState} 
          onInstallApp={handleInstallApp}
          canInstall={!!deferredPrompt || /iPhone|iPad|iPod/.test(navigator.userAgent)}
          onLogout={handleLogout}
          currentUser={authState.currentUser}
        />
      )}

      {/* Doctor AI Trigger */}
      {!showDoctor && (
        <button 
          onClick={() => setShowDoctor(true)}
          className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center z-[150] active:scale-90 transition-all border-4 border-white ring-8 ring-blue-500/10"
        >
          <i className="fas fa-user-md text-2xl"></i>
          <div className="absolute top-0 right-0 w-5 h-5 bg-blue-400 rounded-full border-2 border-white flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        </button>
      )}

      {showOCR && <OCRModal onClose={() => setShowOCR(false)} onConfirm={(res) => {
          // Adapt OCR results to the new component config structure
          const subjectsToImport = res.map(r => ({
            name: r.subjectName,
            config: [{ type: r.type, requiredPct: state.settings.isMYSY ? (r.type === 'Practical' ? 85 : 80) : 75 }] 
          }));
          subjectsToImport.forEach(s => addSubject(s.name, s.config));
          setShowOCR(false);
          setActiveTab('subjects');
      }} />}

      {showAddSubject && <AddSubjectModal onClose={() => setShowAddSubject(false)} onAdd={addSubject} isMYSY={state.settings.isMYSY} userYear={state.settings.year} />}

      {showDoctor && <DoctorAI appState={state} onClose={() => setShowDoctor(false)} />}

      {/* Profile Modals */}
      {showChangeUsername && authState.currentUser && (
        <ChangeUsernameModal
          currentUsername={authState.currentUser}
          onClose={() => setShowChangeUsername(false)}
          onSuccess={handleUsernameChanged}
        />
      )}

      {showChangePhoto && (
        <ChangePhotoModal
          currentPhoto={state.settings.profilePhoto}
          onClose={() => setShowChangePhoto(false)}
          onSuccess={handlePhotoChanged}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={handlePasswordChanged}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={handleAccountDeleted}
        />
      )}
    </Layout>
  );
};

export default App;
