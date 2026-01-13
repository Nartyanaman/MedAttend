
import React, { useState, useRef } from 'react';
import { UserSettings } from '../types';
import { MBBS_YEARS } from '../Constants/constants';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<UserSettings>({
    name: '',
    bio: 'Future MD/MS',
    college: '',
    year: MBBS_YEARS[0],
    onboarded: true,
    startMode: 'fresh',
    defaultBaselinePct: 75,
    defaultAttendedCount: 0,
    defaultTotalCount: 0,
    entryType: 'percentage',
    isMYSY: false
  });
  const [baselinePctInput, setBaselinePctInput] = useState<string>('75');
  const [attendedCountInput, setAttendedCountInput] = useState<string>('0');
  const [totalCountInput, setTotalCountInput] = useState<string>('0');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, profilePhoto: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const next = () => {
    if (step === 1 && !config.name) {
      alert("Please enter your name, Doctor!");
      return;
    }
    if (step === 3 && config.startMode === 'fresh') {
      setStep(5);
      return;
    }
    if (step === 5) onComplete(config);
    else setStep(step + 1);
  };

  const back = () => {
    if (step === 5 && config.startMode === 'fresh') {
      setStep(3);
      return;
    }
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-md mx-auto animate-fadeIn">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-xl shadow-blue-50">
            <i className="fas fa-stethoscope text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">MedAttend</h1>
          <p className="text-slate-500 font-medium">Built by Medicos, for Medicos.</p>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-slideUp">
            <h2 className="text-xl font-bold text-slate-800">Your Identity</h2>
            <div className="flex flex-col items-center gap-4 mb-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-200 transition-all"
              >
                {config.profilePhoto ? (
                  <img src={config.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-camera text-slate-400 text-2xl"></i>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Upload Profile Photo</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Full Name (Dr.)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 ring-blue-500 outline-none transition-all font-bold"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Personal Quote / Bio</label>
                <input 
                  type="text" 
                  placeholder="e.g., Future Cardiologist"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 ring-blue-500 outline-none transition-all font-bold"
                  value={config.bio}
                  onChange={(e) => setConfig({...config, bio: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slideUp">
            <h2 className="text-xl font-bold text-slate-800">College Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Medical College</label>
                <input 
                  type="text" 
                  placeholder="e.g., AIIMS Delhi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 ring-blue-500 outline-none transition-all font-bold"
                  value={config.college}
                  onChange={(e) => setConfig({...config, college: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">MBBS Year</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 ring-blue-500 outline-none appearance-none font-bold"
                  value={config.year}
                  onChange={(e) => setConfig({...config, year: e.target.value})}
                >
                  {MBBS_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${config.isMYSY ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}
                   onClick={() => setConfig({...config, isMYSY: !config.isMYSY})}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold ${config.isMYSY ? 'text-amber-900' : 'text-slate-700'}`}>MYSY Scholar?</h3>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.isMYSY ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {config.isMYSY ? <i className="fas fa-check text-[10px]"></i> : <i className="fas fa-times text-[10px]"></i>}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">MYSY requires <strong>80% Theory</strong> and <strong>85% Practical</strong> attendance.</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slideUp">
            <h2 className="text-xl font-bold text-slate-800">Start Tracking</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setConfig({...config, startMode: 'fresh'})}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${config.startMode === 'fresh' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold ${config.startMode === 'fresh' ? 'text-blue-900' : 'text-slate-700'}`}>Start Fresh</h3>
                  {config.startMode === 'fresh' && <i className="fas fa-check-circle text-blue-600"></i>}
                </div>
                <p className="text-xs text-slate-500">I'm starting a new term or academic year.</p>
              </button>
              
              <button 
                onClick={() => setConfig({...config, startMode: 'current'})}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${config.startMode === 'current' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold ${config.startMode === 'current' ? 'text-blue-900' : 'text-slate-700'}`}>Current Attendance</h3>
                  {config.startMode === 'current' && <i className="fas fa-check-circle text-blue-600"></i>}
                </div>
                <p className="text-xs text-slate-500">I already have some attendance from my college portal.</p>
              </button>
            </div>
          </div>
        )}

        {step === 4 && config.startMode === 'current' && (
          <div className="space-y-6 animate-slideUp">
            <h2 className="text-xl font-bold text-slate-800">Current Standing</h2>
            
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button 
                onClick={() => setConfig({...config, entryType: 'percentage'})}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${config.entryType === 'percentage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Use %
              </button>
              <button 
                onClick={() => setConfig({...config, entryType: 'counts'})}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${config.entryType === 'counts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Use Counts
              </button>
            </div>

            <div className="space-y-6">
              {config.entryType === 'percentage' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">My Current %</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="text"
                      inputMode="numeric"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-2xl font-black outline-none transition-all"
                      value={baselinePctInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setBaselinePctInput(value);
                          if (value !== '') {
                            const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
                            setConfig({...config, defaultBaselinePct: numValue});
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setBaselinePctInput('0');
                          setConfig({...config, defaultBaselinePct: 0});
                        } else {
                          const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
                          setBaselinePctInput(numValue.toString());
                          setConfig({...config, defaultBaselinePct: numValue});
                        }
                      }}
                    />
                    <span className="text-2xl font-black text-slate-400">%</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Classes Held</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-2xl font-black outline-none"
                      value={totalCountInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setTotalCountInput(value);
                          if (value !== '') {
                            const numValue = Math.max(0, parseInt(value) || 0);
                            setConfig({...config, defaultTotalCount: numValue});
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setTotalCountInput('0');
                          setConfig({...config, defaultTotalCount: 0});
                        } else {
                          const numValue = Math.max(0, parseInt(value) || 0);
                          setTotalCountInput(numValue.toString());
                          setConfig({...config, defaultTotalCount: numValue});
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Attended</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-2xl font-black outline-none"
                      value={attendedCountInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setAttendedCountInput(value);
                          if (value !== '') {
                            const numValue = Math.max(0, parseInt(value) || 0);
                            setConfig({...config, defaultAttendedCount: numValue});
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setAttendedCountInput('0');
                          setConfig({...config, defaultAttendedCount: 0});
                        } else {
                          const numValue = Math.max(0, parseInt(value) || 0);
                          setAttendedCountInput(numValue.toString());
                          setConfig({...config, defaultAttendedCount: numValue});
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                <i className="fas fa-bullseye text-blue-500 mt-1"></i>
                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                  We'll use this to calculate how many classes you need to reach your mandatory target ({config.isMYSY ? '80/85%' : '75/80%'}) mark.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-slideUp text-center">
            <h2 className="text-2xl font-black text-slate-800">Final Step</h2>
            <p className="text-slate-500 px-4">Your personalized attendance engine is ready. Let's make sure you never see that detention list, Dr. {config.name?.split(' ')[0]}.</p>
            <div className="py-6 relative flex justify-center">
               <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-full scale-50"></div>
               <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200 relative z-10 overflow-hidden">
                 {config.profilePhoto ? (
                    <img src={config.profilePhoto} className="w-full h-full object-cover" />
                 ) : (
                    <i className="fas fa-user-doctor text-4xl text-white"></i>
                 )}
               </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Attendance Status: Optimized</p>
          </div>
        )}
      </div>

      <div className="pt-8">
        <div className="flex gap-3">
          {step > 1 && (
            <button 
              onClick={back}
              className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all"
            >
              Back
            </button>
          )}
          <button 
            onClick={next}
            className={`py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${step === 5 ? 'flex-2 bg-blue-600 text-white shadow-blue-100' : 'flex-[2] bg-blue-600 text-white shadow-blue-100'}`}
          >
            {step === 5 ? "Launch MedAttend" : "Next"}
          </button>
        </div>
        <div className="flex justify-center gap-1.5 mt-8">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
