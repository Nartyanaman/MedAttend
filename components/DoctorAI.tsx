
import React, { useState, useEffect, useRef } from 'react';
import { getDoctorAdvice } from '../services/geminiService';
import { AppState } from '../types';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface DoctorAIProps {
  appState: AppState;
  onClose: () => void;
}

const DoctorAI: React.FC<DoctorAIProps> = ({ appState, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Greetings, Dr. ${appState.settings.name?.split(' ')[0] || 'Medico'}. I'm your MedAttend Chief Resident AI. How's the attendance looking on your end?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await getDoctorAdvice(text, appState);
    
    setMessages(prev => [...prev, { role: 'bot', text: response || 'No response' }]);
    setLoading(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if the background itself was clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-end p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md bg-white rounded-t-[3rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col h-[85vh] animate-slideUp overflow-hidden border-t-4 border-blue-600 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bolder Medical Header */}
        <div className="p-7 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fas fa-heartbeat text-6xl"></i>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-400/30 shadow-2xl rotate-3">
              <i className="fas fa-user-md text-3xl text-blue-700"></i>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight leading-none mb-1">CHIEF RESIDENT AI</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">Clinical Assistant On Duty</p>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all border border-white/30 active:scale-75 shadow-lg z-50"
            aria-label="Close Chat"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Bolder Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/80"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] p-5 rounded-[1.5rem] text-sm font-bold shadow-md leading-relaxed ${
                m.role === 'user' 
                ? 'bg-blue-700 text-white rounded-tr-none border-b-4 border-blue-900' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none border-b-4 border-slate-300'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-blue-100 p-5 rounded-2xl rounded-tl-none shadow-md flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                <span className="text-[10px] font-black text-blue-600 ml-2 uppercase tracking-widest">Diagnosing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bolder Suggested Prompts */}
        <div className="px-6 pb-2 pt-4 bg-white flex gap-3 overflow-x-auto no-scrollbar border-t border-slate-100">
          {['Am I safe?', 'MYSY Status', 'Bunk Strategy', 'DETENTION RISK'].map(p => (
            <button 
              key={p}
              onClick={() => handleSend(p)}
              className="whitespace-nowrap bg-slate-50 border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl text-slate-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Bolder Input Area */}
        <div className="p-6 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3"
          >
            <input 
              type="text"
              placeholder="Ask for clinical advice, Dr..."
              className="flex-1 bg-slate-100 border-2 border-slate-100 rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner placeholder-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="w-16 h-16 bg-blue-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-200 active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center border-b-4 border-blue-900"
            >
              <i className="fas fa-paper-plane text-xl"></i>
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-30">
            <div className="h-[1px] w-8 bg-slate-300"></div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">MedAttend Professional AI v1.2</p>
            <div className="h-[1px] w-8 bg-slate-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAI;
