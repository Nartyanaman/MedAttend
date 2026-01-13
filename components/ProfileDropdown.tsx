import React, { useState, useRef, useEffect } from 'react';

interface ProfileDropdownProps {
  profilePhoto?: string;
  currentUser?: string | null;
  onClose: () => void;
  onChangeUsername: () => void;
  onChangePhoto: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  profilePhoto,
  currentUser,
  onClose,
  onChangeUsername,
  onChangePhoto,
  onChangePassword,
  onLogout,
  onDeleteAccount
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-16 right-5 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[200] min-w-[200px] animate-slideUp"
    >
      <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600">
                <i className="fas fa-user-doctor text-xl"></i>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 truncate">{currentUser || 'User'}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
          </div>
        </div>
      </div>

      <div className="py-2">
        <DropdownItem 
          icon="fas fa-user-edit" 
          label="Change Username" 
          onClick={onChangeUsername}
        />
        <DropdownItem 
          icon="fas fa-camera" 
          label="Change Photo" 
          onClick={onChangePhoto}
        />
        <DropdownItem 
          icon="fas fa-key" 
          label="Change Password" 
          onClick={onChangePassword}
        />
        <div className="h-px bg-slate-100 my-1"></div>
        <DropdownItem 
          icon="fas fa-sign-out-alt" 
          label="Logout" 
          onClick={onLogout}
          danger={false}
        />
        <DropdownItem 
          icon="fas fa-trash-alt" 
          label="Delete Account" 
          onClick={onDeleteAccount}
          danger={true}
        />
      </div>
    </div>
  );
};

const DropdownItem = ({ 
  icon, 
  label, 
  onClick, 
  danger = false 
}: { 
  icon: string; 
  label: string; 
  onClick: () => void; 
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors ${
      danger ? 'text-rose-600' : 'text-slate-700'
    }`}
  >
    <i className={`${icon} text-sm ${danger ? 'text-rose-500' : 'text-slate-400'}`}></i>
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default ProfileDropdown;
