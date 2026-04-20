import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { X, ArrowRight, ShieldCheck, Target, FileText } from 'lucide-react';
import type { RootState } from '../store';

interface Props {
  jobId: string;
  jobTitle: string;
  questions: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicantDetailsModal: React.FC<Props> = ({ jobId, jobTitle, questions, onClose, onSuccess }) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { userId, token } = useSelector((state: RootState) => state.auth);

  const parsedQuestions: string[] = JSON.parse(questions || '[]');

  const handleApply = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('JobId', jobId);
      formData.append('UserId', userId || '');
      formData.append('AnswersJson', JSON.stringify(answers));
      if (cvFile) formData.append('CVFile', cvFile);

      await axios.post('/api/Applications/Apply', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      onSuccess();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-10 md:p-20 bg-black/95 backdrop-blur-md fade-in">
      <div className="w-full max-w-7xl m-card h-full flex flex-col relative rounded-none sm:rounded-3xl border-none sm:border border-white/10">
         {/* Titanium Modal Header */}
         <div className="p-6 md:p-12 border-b border-white/5 flex justify-between items-center bg-[#0D0D10]">
             <div className="flex flex-col gap-1 md:gap-3">
                  <div className="m-label text-indigo-400 flex items-center gap-2 md:gap-4 !text-[10px] md:!text-xs">
                     <Target className="w-4 h-4 md:w-6 md:h-6" /> APPLICATION PROTOCOL
                  </div>
                  <h2 className="m-title text-xl md:text-4xl uppercase leading-tight line-clamp-1">{jobTitle}</h2>
             </div>
             <button onClick={onClose} className="w-10 h-10 md:w-16 md:h-16 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all rounded-lg md:rounded-none">
                <X className="w-5 h-5 md:w-8 md:h-8 text-white" />
             </button>
         </div>

         {/* Titanium Modal Content */}
         <div className="flex-1 overflow-y-auto p-6 md:p-20 space-y-12 md:space-y-20 bg-[#0A0A0C] custom-scrollbar">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20">
                 <div className="space-y-8 md:space-y-12">
                     <div className="m-label opacity-100 flex items-center gap-3 md:gap-4 text-indigo-400 !text-[10px] md:!text-xs">
                         <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" /> KRİTİK DEĞERLENDİRME SORULARI
                     </div>
                     {parsedQuestions.map((q, i) => (
                         <div key={i} className="m-card p-6 md:p-8 space-y-4 md:space-y-6 border-white/5 bg-white/[0.01] hover:border-indigo-500/20 transition-all">
                             <div className="flex gap-3 md:gap-4">
                                <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                    {i + 1}
                                </span>
                                <label className="text-base md:text-xl font-medium text-white/70 italic leading-relaxed text-balance">"{q}"</label>
                             </div>
                             <textarea 
                                  className="m-input min-h-[100px] md:min-h-[120px] resize-none focus:ring-1 focus:ring-indigo-500/30 !text-sm"
                                  value={answers[i] || ''}
                                  onChange={(e) => {
                                      const newAnswers = [...answers];
                                      newAnswers[i] = e.target.value;
                                      setAnswers(newAnswers);
                                  }}
                                  placeholder="Cevabınızı buraya net bir şekilde yazın..."
                             />
                         </div>
                     ))}
                     {parsedQuestions.length === 0 && (
                         <p className="text-[#888899] italic text-sm">Bu ilan için özel soru bulunmamaktadır.</p>
                     )}
                 </div>

                 <div className="space-y-8 md:space-y-12">
                     <div className="m-label opacity-100 flex items-center gap-3 md:gap-4 text-indigo-400 !text-[10px] md:!text-xs">
                         <FileText className="w-5 h-5 md:w-6 md:h-6" /> ÖZGEÇMİŞ DOSYASI (CV)
                     </div>
                     <div className="p-8 md:p-12 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6 md:gap-8 group hover:border-[#6366F1] transition-all bg-white/[0.01] rounded-2xl">
                         <FileText className="w-10 h-10 md:w-16 md:h-16 text-white/10 group-hover:text-[#6366F1] transition-all" />
                          <label className="m-btn-secondary !cursor-pointer w-full sm:w-auto text-center justify-center flex">
                              DOSYA SEÇ
                              <input type="file" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                          </label>
                         {cvFile ? (
                              <div className="m-label text-emerald-500 text-[10px]">{cvFile.name} YÜKLENDİ</div>
                         ) : (
                              <div className="m-label text-white/10 text-[10px]">PDF VEYA DOCX FORMATINDA</div>
                         )}
                     </div>

                     <div className="p-6 md:p-10 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl">
                          <div className="m-label text-indigo-400 mb-2 md:mb-4 !text-[10px]">SİSTEM NOTU</div>
                         <p className="text-sm md:text-lg text-white/40 italic leading-relaxed">
                             "Başvurunuz başarıyla kaydedilecek ve işverene iletilecektir. Lütfen bilgilerinizden emin olun."
                         </p>
                     </div>
                 </div>
             </div>
         </div>

         {/* Titanium Modal Footer */}
         <div className="p-6 md:p-12 bg-[#020203] border-t border-white/5">
              <button
                 onClick={handleApply}
                 disabled={loading}
                 className="m-btn-primary w-full !py-6 md:!py-10 flex items-center justify-center gap-4 md:gap-6 text-lg md:text-2xl group"
              >
                {loading ? <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-white/20 border-t-white animate-spin"></div> : (
                    <>BAŞVURU PROTOKOLÜ <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" /></>
                )}
             </button>
         </div>
      </div>
    </div>
  );
};
