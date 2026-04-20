import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { RootState } from '../store';
import { Briefcase, MapPin, Search, Plus, CheckCircle2, Clock, Target, Edit2, Trash2, X, Save, Pause, PlayCircle } from 'lucide-react';
import { useToast } from '../store/ToastContext';
import { useConfirm } from '../store/ConfirmContext';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  createdAt: string;
  isActive: boolean;
  applicationCount: number;
  questionsJson: string;
}

export const EmployerJobs: React.FC = () => {
  const { userId, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    company: '',
    salaryMin: 0,
    salaryMax: 0,
    questions: [] as string[]
  });
  const [newQuestion, setNewQuestion] = useState('');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['employer-jobs', userId],
    queryFn: async () => {
      const { data } = await axios.get<Job[]>('/api/Jobs/get-employer-jobs', {
        params: { employerId: userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!userId,
  });

  const handleDelete = async (jobId: string) => {
    const ok = await confirm({
      title: 'İLAN KALDIRILSIN MI?',
      message: 'DİKKAT: Bu ilanı KALICI OLARAK silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm başvurular silinebilir.',
      confirmLabel: 'KALICI OLARAK SİL',
      cancelLabel: 'VAZGEÇ'
    });
    
    if (!ok) return;

    try {
      await axios.delete('/api/Jobs/delete', {
        params: { jobId, employerId: userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('İlan kalıcı olarak silindi.', 'success');
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    } catch (err) {
      showToast('Silme işlemi sırasında bir hata oluştu.', 'error');
    }
  };

  const handleToggleStatus = async (jobId: string) => {
    try {
      const response = await axios.post('/api/Jobs/toggle-status', {}, {
        params: { jobId, employerId: userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(response.data.data, 'success');
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    } catch (err) {
      showToast('Durum güncellenirken bir hata oluştu.', 'error');
    }
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      location: job.location,
      company: job.company,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      questions: JSON.parse(job.questionsJson || '[]')
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      await axios.put('/api/Jobs/update', {
        jobId: editingJob.id,
        employerId: userId,
        ...editForm,
        questions: editForm.questions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('İlan başarıyla güncellendi.', 'success');
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    } catch (err) {
      showToast('Güncelleme sırasında bir hata oluştu.', 'error');
    }
  };

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full fade-in flex flex-col bg-[#030305] min-h-screen relative">
      {/* Lunar Header */}
      <section className="bg-[#030305] border-b border-white/5 py-12 px-6">
        <div className="flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 md:gap-4">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                   <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
               </div>
               <span className="m-label text-[10px] md:text-xs text-white/50 tracking-widest">VACANCY MANAGEMENT</span>
            </div>
            <h1 className="m-title text-3xl md:text-6xl leading-tight uppercase">
               AKTİF <br className="hidden md:block"/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">İLANLARINIZ.</span>
            </h1>
        </div>
      </section>

      {/* Lunar Action Bar */}
      <section className="w-full px-6 md:px-12 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 bg-white/[0.01] max-w-7xl mx-auto">
           <div className="flex items-center gap-4 md:gap-6 text-[#888899] w-full md:w-auto">
              <Search className="w-5 h-5 md:w-6 md:h-6" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-base md:text-xl font-medium placeholder-white/5 uppercase tracking-widest w-full md:w-96" 
                placeholder="İLANLARDA VEYA KONUMDA ARA..." 
              />
           </div>
           <Link 
             to="/employer" 
             className="m-btn-primary flex items-center justify-center gap-3 md:gap-4 group w-full md:w-auto !py-3.5 md:!py-4"
           >
             <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform" /> YENİ İLAN YAYINLA
           </Link>
      </section>

      {/* Lunar Job List Grid */}
      <section className="m-section !py-8 md:!py-16">
        {isLoading ? (
          <div className="flex justify-center py-32 md:py-64">
             <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="m-grid">
            {filteredJobs?.map((job) => (
              <div 
                key={job.id} 
                className="m-card p-8 md:p-10 flex flex-col min-h-[380px] md:min-h-[420px] relative group"
              >
                <div className="flex justify-between items-start mb-8 md:mb-10">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                   </div>
                   <div className="flex flex-col items-end gap-2 md:gap-3">
                      {job.isActive ? (
                        <span className="m-label text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 bg-emerald-500/10 rounded-full flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px]"><CheckCircle2 className="w-3 h-3" /> AKTİF</span>
                      ) : (
                        <span className="m-label text-red-400 border border-red-500/20 px-2.5 py-1.5 bg-red-500/10 rounded-full flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px]"><Clock className="w-3 h-3" /> PASİF</span>
                      )}
                   </div>
                </div>

                <div className="flex-1" onClick={() => navigate('/employer/candidates')}>
                   <h3 className="m-title text-2xl md:text-3xl mb-3 md:mb-4 group-hover:text-indigo-400 transition-colors leading-tight cursor-pointer line-clamp-2">{job.title}</h3>
                   <div className="flex items-center gap-4 md:gap-6 m-label text-white/40 normal-case tracking-normal">
                      <span className="flex items-center gap-1.5 text-xs md:text-sm font-medium"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />{job.location}</span>
                   </div>
                </div>
                
                <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3 md:gap-4">
                       <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(job); }}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm"
                        title="İlanı Düzenle"
                       >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                       </button>

                       <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(job.id); }}
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                          job.isActive 
                          ? 'bg-amber-500/5 border-amber-500/10 text-amber-500/50 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30' 
                          : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                        title={job.isActive ? "Pasif Hale Getir" : "Aktifleştir"}
                       >
                          {job.isActive ? <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <PlayCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                       </button>

                       <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"
                        title="Kalıcı Olarak Sil"
                       >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                       </button>
                   </div>
                   
                   <div className="flex flex-col items-end">
                      <span className="m-label text-[9px] md:text-[10px] mb-0.5 md:mb-1 text-white/20 uppercase tracking-tighter">ADAYLAR</span>
                      <span className="text-xl md:text-2xl font-bold text-white/60 tracking-tight leading-none">{job.applicationCount}</span>
                   </div>
                </div>
              </div>
            ))}

            {filteredJobs?.length === 0 && (
              <div className="col-span-full py-24 md:py-40 flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-3xl">
                 <div className="m-title text-xl md:text-3xl text-white/20">SONUÇ BULUNAMADI</div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Edit Modal - Lunar Style */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-6 bg-black/95 backdrop-blur-xl fade-in overflow-y-auto">
          <div className="bg-[#0A0A0C] border border-white/10 w-full max-w-2xl rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl my-8 md:my-12">
            <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="m-title text-lg md:text-xl text-white uppercase">İLAN DÜZENLE</h3>
                <p className="m-label text-white/30 text-[9px] md:text-[10px] mt-1 uppercase tracking-widest">PUBLICATION EDITOR</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 md:p-10 custom-scrollbar space-y-8 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-2 md:space-y-4">
                  <label className="m-label text-[10px] md:text-xs text-white/40 uppercase">İLAN BAŞLIĞI</label>
                  <input 
                    className="m-input !py-3 md:!py-4" 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 md:space-y-4">
                  <label className="m-label text-[10px] md:text-xs text-white/40 uppercase">LOKASYON / KONUM</label>
                  <input 
                    className="m-input !py-3 md:!py-4" 
                    value={editForm.location} 
                    onChange={e => setEditForm({...editForm, location: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 md:space-y-4">
                  <label className="m-label text-[10px] md:text-xs text-white/40 uppercase">ŞİRKET ADI</label>
                  <input 
                    className="m-input !py-3 md:!py-4" 
                    value={editForm.company} 
                    onChange={e => setEditForm({...editForm, company: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 md:space-y-4">
                  <label className="m-label text-[10px] md:text-xs text-white/40 uppercase">MAAŞ SKALASI</label>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      className="m-input !flex-1 !py-3 md:!py-4" 
                      value={editForm.salaryMin}
                      onChange={e => setEditForm({...editForm, salaryMin: Number(e.target.value)})}
                    />
                    <input 
                      type="number" 
                      className="m-input !flex-1 !py-3 md:!py-4" 
                      value={editForm.salaryMax}
                      onChange={e => setEditForm({...editForm, salaryMax: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:space-y-4">
                <label className="m-label text-[10px] md:text-xs text-white/40 uppercase">İLAN DETAYI VE AÇIKLAMASI</label>
                <textarea 
                  className="m-input min-h-[150px] md:min-h-[200px] py-4 md:py-6 !text-sm" 
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4 md:space-y-6 pt-8 md:pt-10 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="m-label text-[10px] md:text-xs text-indigo-400 font-black uppercase">ADAY DEĞERLENDİRME SORULARI</label>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <input 
                    className="m-input !flex-1 !py-3 md:!py-4 !text-sm" 
                    value={newQuestion} 
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="Soru ekleyin..."
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newQuestion.trim()) {
                        setEditForm({...editForm, questions: [...editForm.questions, newQuestion.trim()]});
                        setNewQuestion('');
                      }
                    }}
                    className="m-btn-secondary !bg-indigo-500/10 !border-indigo-500/20 !text-indigo-400 hover:!bg-indigo-500/20 px-6 md:px-8 !text-xs font-bold"
                  >
                    EKLE
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {editForm.questions.map((q, i) => (
                    <div key={i} className="group relative flex items-center gap-3 px-4 py-2 md:py-2.5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white/70 m-label !text-[10px] md:!text-xs transition-all normal-case tracking-normal">
                      <span className="opacity-30">{i + 1}.</span>
                      <span className="line-clamp-1">{q}</span>
                      <button 
                        type="button" 
                        onClick={() => setEditForm({...editForm, questions: editForm.questions.filter((_, idx) => idx !== i)})}
                        className="text-red-400/50 hover:text-red-400 transition-colors bg-white/5 w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editForm.questions.length === 0 && (
                    <div className="w-full py-6 text-center border-2 border-dashed border-white/5 rounded-2xl m-label !text-white/10 !text-[10px]">
                      BU İLAN İÇİN ÖZEL SORU TANIMLANMAMIŞ.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="m-btn-primary w-full flex items-center justify-center gap-3 md:gap-4 !py-4 md:!py-5 font-bold"
                >
                   <Save className="w-5 h-5" /> DEĞİŞİKLİKLERİ KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
