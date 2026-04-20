import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../store';
import { X, Upload, Send, AlertCircle, FileText } from 'lucide-react';

interface Props {
  jobId: string;
  jobTitle: string;
  questionsJson: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<Props> = ({ jobId, jobTitle, questionsJson, onClose, onSuccess }) => {
  const { userId, token } = useSelector((state: RootState) => state.auth);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const questions: string[] = JSON.parse(questionsJson || '[]');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('JobId', jobId);
      formData.append('UserId', userId || '');
      
      // Answers
      const answersArray = questions.map(q => ({
        Question: q,
        Answer: answers[q] || ''
      }));
      
      // We append complex objects as distinct fields or stringify? 
      // [FromForm] in ASP.NET usually prefers indexed notation for lists
      answersArray.forEach((ans, index) => {
        formData.append(`Answers[${index}].Question`, ans.Question);
        formData.append(`Answers[${index}].Answer`, ans.Answer);
      });

      if (cvFile) {
        formData.append('CV', cvFile);
      }

      const response = await axios.post('https://localhost:7054/api/Applications/Apply', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.isSuccessful) {
        onSuccess();
      } else {
        const msg = response.data.errorMessages?.[0] || response.data.message || 'Başvuru başarısız.';
        setError(msg);
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.errorMessages?.[0] || err?.response?.data?.message || err?.message;
      setError(serverMsg || 'Sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="m-card w-full max-w-xl relative shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">İlana Başvur</h2>
            <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mt-0.5">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-8 space-y-6">
          {/* Questions */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white/70 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-violet-400" /> İşveren Soruları
              </h4>
              {questions.map((q, i) => (
                <div key={i}>
                  <label className="block text-sm text-white/50 mb-3 font-medium">{q}</label>
                  <textarea 
                    className="m-input min-h-[80px] resize-none"
                    value={answers[q] || ''}
                    onChange={e => setAnswers({ ...answers, [q]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {/* CV Upload */}
          <div className="space-y-3">
             <label className="block text-sm font-bold text-white/70">CV Yükle (PDF veya Doc)</label>
             <div className="relative group">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={e => setCvFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all ${cvFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 group-hover:border-violet-500/30'}`}>
                   {cvFile ? (
                     <div className="flex items-center justify-center gap-3 text-emerald-400">
                        <FileText className="w-8 h-8" />
                        <div className="text-left">
                           <div className="text-sm font-bold truncate max-w-[200px]">{cvFile.name}</div>
                           <div className="text-xs opacity-60">Dosya seçildi</div>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-2">
                        <Upload className="w-8 h-8 text-white/20 mx-auto" />
                        <p className="text-sm text-white/40">Dosyayı buraya sürükleyin veya <span className="text-violet-400">tıklayın</span></p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {error && <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl text-center">{error}</div>}

           <button
             type="submit"
             disabled={loading}
             className="m-btn-primary w-full flex items-center justify-center gap-2"
           >
             {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send className="w-4 h-4" /> Başvuruyu Tamamla</>}
           </button>
        </form>
      </div>
    </div>
  );
};
