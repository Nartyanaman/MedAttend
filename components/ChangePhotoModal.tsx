import React, { useState, useRef } from 'react';

interface ChangePhotoModalProps {
  currentPhoto?: string;
  onClose: () => void;
  onSuccess: (photoBase64: string) => void;
}

const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({ currentPhoto, onSuccess, onClose }) => {
  const [photo, setPhoto] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleSave = () => {
    if (photo) {
      onSuccess(photo);
    } else {
      onSuccess('');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border-t-8 border-blue-600">
        <div className="p-8 pb-4 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Change Profile Photo</h3>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Update Your Image</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center active:scale-75 transition-all shadow-sm border border-slate-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-200 transition-all relative group"
            >
              {photo ? (
                <>
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="fas fa-camera text-white text-2xl"></i>
                  </div>
                </>
              ) : (
                <i className="fas fa-camera text-slate-400 text-4xl"></i>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Tap to Upload Photo</p>
            <p className="text-xs text-slate-400 text-center">Max size: 5MB</p>
          </div>

          {photo && (
            <button
              onClick={handleRemovePhoto}
              className="w-full py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm border-2 border-rose-100 hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash-alt"></i>
              <span>Remove Photo</span>
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-2 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800 flex items-center justify-center gap-2"
            >
              <i className="fas fa-check"></i>
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePhotoModal;
