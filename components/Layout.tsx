
import React, { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profilePhoto?: string;
  currentUser?: string | null;
  onProfileAction?: (action: 'username' | 'photo' | 'password' | 'logout' | 'delete') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, profilePhoto, currentUser, onProfileAction }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden relative border-x border-slate-100">
      <header className="p-5 sticky top-0 z-[100] transition-all duration-500 bg-blue-600 text-white shadow-lg shadow-blue-900/10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
             <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter">
              <i className="fas fa-stethoscope"></i> MEDATTEND
            </h1>
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] leading-none mt-1">Professional Registry</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden active:scale-90 transition-all shadow-sm"
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-user-doctor text-sm"></i>
                )}
              </button>
              
              {showProfileDropdown && onProfileAction && (
                <ProfileDropdown
                  profilePhoto={profilePhoto}
                  currentUser={currentUser}
                  onClose={() => setShowProfileDropdown(false)}
                  onChangeUsername={() => {
                    setShowProfileDropdown(false);
                    onProfileAction('username');
                  }}
                  onChangePhoto={() => {
                    setShowProfileDropdown(false);
                    onProfileAction('photo');
                  }}
                  onChangePassword={() => {
                    setShowProfileDropdown(false);
                    onProfileAction('password');
                  }}
                  onLogout={() => {
                    setShowProfileDropdown(false);
                    onProfileAction('logout');
                  }}
                  onDeleteAccount={() => {
                    setShowProfileDropdown(false);
                    onProfileAction('delete');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32 p-4 scroll-smooth overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 grid grid-cols-5 py-5 px-1 z-[150] rounded-t-[2.5rem] shadow-[0_-15px_50px_-5px_rgba(0,0,0,0.1)]">
        <NavButton icon="fas fa-grid-2" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon="fas fa-book-medical" label="Rounds" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} />
        <NavButton icon="fas fa-calendar-check" label="Log" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <NavButton icon="fas fa-hospital" label="Postings" active={activeTab === 'postings'} onClick={() => setActiveTab('postings')} />
        <NavButton icon="fas fa-gear" label="Setup" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-1 rounded-2xl transition-all duration-300 active:scale-75 ${active ? 'text-blue-600' : 'text-slate-300'}`}
  >
    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-blue-50 shadow-inner' : 'bg-transparent'}`}>
      <i className={`${icon} text-lg`}></i>
    </div>
    <span className={`text-[8px] font-black mt-1.5 uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default Layout;
