
import React, { useState, useRef } from 'react';
import { parseTimetableWithGemini } from '../services/geminiService';

interface ExtractedSubject {
  subjectName: string;
  type: 'Theory' | 'Practical';
  frequencyPerWeek: number;
}

interface OCRModalProps {
  onConfirm: (subjects: ExtractedSubject[]) => void;
  onClose: () => void;
}

const OCRModal: React.FC<OCRModalProps> = ({ onConfirm, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewList, setReviewList] = useState<ExtractedSubject[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await parseTimetableWithGemini(base64Data);
      setReviewList(result);
    } catch (err) {
      alert("Failed to parse timetable. Try a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (index: number) => {
    if (reviewList) {
      const newList = [...reviewList];
      newList.splice(index, 1);
      setReviewList(newList);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-slate-800">
            {reviewList ? 'Confirm Subjects' : 'Scan Timetable'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <i className="fas fa-camera text-blue-600 text-2xl"></i>
              </div>
              <p className="text-sm font-bold text-blue-800 mb-1">Click to Upload</p>
              <p className="text-xs text-blue-500 text-center">Capture or select a photo of your college timetable</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : reviewList ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-4">We found these subjects. Remove any that are incorrect.</p>
              {reviewList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.subjectName}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{item.type} • {item.frequencyPerWeek}x / week</p>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-red-400 p-2">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              {reviewList.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">No subjects detected. Try again or add manually.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 shadow-inner">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <i className="fas fa-redo text-xs"></i>
                </button>
              </div>
              <button
                disabled={loading}
                onClick={processImage}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-all ${loading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-dna animate-spin"></i> Processing...
                  </span>
                ) : 'Extract Subjects'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100">
          {reviewList ? (
            <button 
              onClick={() => onConfirm(reviewList)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Import {reviewList.length} Subjects
            </button>
          ) : (
            <div className="flex gap-2 items-start text-[10px] text-slate-400 leading-tight">
              <i className="fas fa-lightbulb text-amber-400 pt-0.5"></i>
              <p>Pro Tip: Clear, well-lit photos work best. AI maps "Dissection" to "Anatomy (Practical)" automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRModal;
