import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../store';
import { Users, PlusCircle, LayoutDashboard, CheckCircle2, Target, Briefcase, Clock } from 'lucide-react';

interface Applicant {
  applicationId: string;
  userId: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
}

export const EmployerDashboard: React.FC = () => {
  const { userId, token } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'create' | 'applications'>('create');
  
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', company: '', salaryMin: 0, salaryMax: 0
  });
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [status, setStatus] = useState('');

  const { data: applications, isLoading } = useQuery<Applicant[]>({
    queryKey: ['applications', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/applications/GetJobApplicationsWithDetails`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!userId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Yükleniyor...');
    try {
      await axios.post('/api/Jobs/create', {
        employerId: userId,
        ...formData,
        questions: questions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('İlan başarıyla oluşturuldu! 🎉');
      setFormData({ title: '', description: '', location: '', company: '', salaryMin: 0, salaryMax: 0 });
      setQuestions([]);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch {
      setStatus('Hata oluştu.');
    }
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full fade-in flex flex-col bg-[#030305]">
      {/* Lunar Header */}
      <section className="bg-[#030305] border-b border-white/5 py-16 px-6 md:px-12">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                   <Target className="w-5 h-5 text-indigo-400" />
               </div>
               <span className="m-label text-white/50">ADMINISTRATION PROTOCOL</span>
            </div>
            <h1 className="m-title text-4xl md:text-6xl leading-tight uppercase">
               KURUMSAL <br/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">KONTROL PANELİ.</span>
            </h1>
        </div>
      </section>

      {/* Lunar Full-Width Navigation */}
      <section className="w-full bg-white/[0.01] border-b border-white/5 flex">
          <button 
              onClick={() => setTab('create')}
              className={`flex-1 py-8 m-label flex items-center justify-center gap-3 border-r border-white/5 transition-all ${tab === 'create' ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_-2px_0_rgba(99,102,241,1)]' : 'hover:bg-white/5 text-white/40'}`}
          >
              <PlusCircle className="w-5 h-5" /> İLAN YAYINLAMA MERKEZİ
          </button>
          <button 
              onClick={() => setTab('applications')}
              className={`flex-1 py-8 m-label flex items-center justify-center gap-3 transition-all ${tab === 'applications' ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_-2px_0_rgba(99,102,241,1)]' : 'hover:bg-white/5 text-white/40'}`}
          >
              <LayoutDashboard className="w-5 h-5" /> AKTİF BAŞVURULAR
          </button>
      </section>

      <section className="w-full">
        {tab === 'create' && (
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mt-12 mb-32">
            <form onSubmit={handleSubmit} className="w-full m-card overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Column - Details */}
                <div className="p-8 md:p-12 border-b lg:border-r border-white/5 space-y-10">
                   <div className="flex items-center gap-5 mb-10">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                         <Briefcase className="w-6 h-6 text-white/80" />
                      </div>
                      <h2 className="m-title text-2xl">LİSTELEME DETAYLARI</h2>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="m-label text-white/50">PROFESYONEL İLAN BAŞLIĞI</label>
                        <input className="m-input !py-4" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Lead Software Engineer" required />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="m-label text-white/50">KURUM ADI</label>
                          <input className="m-input" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="PrimeIT Corp" required />
                        </div>
                        <div className="space-y-3">
                          <label className="m-label text-white/50">LOKASYON / REJİM</label>
                          <input className="m-input" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Global / Remote" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="m-label text-white/50">MİNİMUM BÜTÇE (₺)</label>
                           <input type="number" className="m-input font-bold tracking-tight" value={formData.salaryMin} onChange={e => setFormData({ ...formData, salaryMin: Number(e.target.value) })} required />
                        </div>
                        <div className="space-y-3">
                           <label className="m-label text-white/50">MAKSİMUM BÜTÇE (₺)</label>
                           <input type="number" className="m-input font-bold tracking-tight" value={formData.salaryMax} onChange={e => setFormData({ ...formData, salaryMax: Number(e.target.value) })} required />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Right Column - Content & Questions */}
                <div className="p-8 md:p-12 space-y-10 bg-white/[0.01]">
                   <div className="space-y-4">
                      <label className="m-label text-white/50">İŞ TANIMI VE TEKNİK KRİTERLER</label>
                      <textarea className="m-input min-h-[300px] resize-none leading-relaxed" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Rolün detaylarını ve beklentilerinizi buraya yazın..." required></textarea>
                   </div>

                   <div className="space-y-6 pt-8 border-t border-white/5">
                      <div className="flex justify-between items-center">
                         <label className="m-label text-indigo-400">ÖZEL ADAY SORULARI</label>
                         <span className="text-xs font-bold text-white/20 uppercase tracking-widest">BAŞVURUDA SORULUR</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          className="m-input flex-1" 
                          value={newQuestion} 
                          onChange={e => setNewQuestion(e.target.value)}
                          placeholder="Kritik bir soru ekleyin..."
                        />
                        <button type="button" onClick={addQuestion} className="m-btn-secondary !bg-indigo-500/10 !border-indigo-500/20 !text-indigo-400 hover:!bg-indigo-500/20 px-6">EKLE</button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {questions.map((q, i) => (
                          <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 m-label !text-xs flex items-center gap-3 shadow-sm">
                            {q}
                            <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-300 transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500/10">×</button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-black/20 border-t border-white/5">
                <button type="submit" disabled={status === 'Yükleniyor...'} className="m-btn-primary w-full !py-6 flex items-center justify-center gap-4 text-lg">
                   {status === 'Yükleniyor...' ? <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : (
                     <>PROTOKOLÜ DOĞRULA VE YAYINLA <Target className="w-5 h-5" /></>
                   )}
                </button>
                {status && status !== 'Yükleniyor...' && (
                  <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl m-label text-center">
                    {status}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {tab === 'applications' && (
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mt-12 mb-32">
            {isLoading && (
              <div className="flex justify-center py-40">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            )}
            {!isLoading && (!applications || applications.length === 0) && (
              <div className="w-full py-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-50 m-title text-2xl">
                SİSTEMDE KAYITLI BAŞVURU YOK
              </div>
            )}
            <div className="w-full flex flex-col gap-4">
              {applications?.map((app) => (
                <div key={app.applicationId} className="m-card p-8 flex items-center justify-between gap-8 group hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-300 shadow-md">
                        <Users className="w-6 h-6 text-white/50 group-hover:text-indigo-400" />
                     </div>
                     <div>
                        <h3 className="m-title text-2xl mb-1">{app.jobTitle}</h3>
                        <div className="flex items-center gap-2 m-label !text-white/40">
                           <Clock className="w-4 h-4 text-indigo-400" /> {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                  </div>
                  <div>
                     <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full m-label flex items-center gap-2 shadow-sm">
                       <CheckCircle2 className="w-4 h-4" /> {app.status.toUpperCase()}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
