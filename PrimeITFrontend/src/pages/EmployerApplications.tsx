import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import type { RootState } from '../store';
import { Mail, Briefcase, Activity, MessageSquare, Search, XCircle, Check, Target, FileText, Clock } from 'lucide-react';
import { useToast } from '../store/ToastContext';

interface EmployerApplicant {
  applicationId: string;
  userId: string;
  fullName: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
  aiScore?: number;
  aiEvaluation?: string;
  employerMessage?: string;
}

const statusLabels: Record<string, string> = {
  Pending: '⚙️ İNCELENİYOR',
  Reviewed: '✅ DEĞERLENDİRİLDİ',
  Accepted: '📅 MÜLAKAT TEKLİFİ',
  Rejected: '❌ REDDEDİLDİ',
};

const ResumeSection = ({ userId, token }: { userId: string, token: string }) => {
  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['resume', userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/Resumes/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!userId,
    retry: false
  });

  if (isLoading) return <div className="p-10 text-sharp opacity-40 animate-pulse">VERİ TABANI SORGULANIYOR...</div>;
  if (error) return <div className="p-10 text-red-500/50 t-label">ADAY HENÜZ ÖZGEÇMİŞ OLUŞTURMAMIŞ.</div>;

  return (
    <div className="p-4 md:p-8 space-y-12 animate-immersive">
      {/* Summary */}
      <div className="space-y-4">
        <label className="m-label text-indigo-400/60 text-[10px] tracking-[0.3em] uppercase font-black">PROFESYONEL ÖZET</label>
        <p className="text-xl text-white/90 font-medium italic leading-relaxed border-l-2 border-indigo-500/30 pl-6 py-2">
          "{resume.summary}"
        </p>
      </div>

      {/* Experience */}
      <div className="space-y-8">
         <label className="m-label text-indigo-400/60 text-[10px] tracking-[0.3em] uppercase font-black flex items-center gap-3">
           <Briefcase className="w-4 h-4" /> İŞ TECRÜBESİ
         </label>
         <div className="flex flex-col gap-6">
            {resume.experiences.map((exp: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group/exp">
                 <div className="flex flex-col gap-1 mb-4">
                    <div className="text-lg font-bold text-white tracking-tight group-hover/exp:text-indigo-400 transition-colors uppercase">
                      {exp.title}
                    </div>
                    <div className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></span>
                       {exp.companyName}
                    </div>
                 </div>
                 <p className="text-sm text-white/50 leading-relaxed italic border-t border-white/5 pt-4 mt-2">
                   "{exp.description}"
                 </p>
              </div>
            ))}
         </div>
      </div>

      {/* Skills */}
      <div className="space-y-6">
         <label className="m-label text-indigo-400/60 text-[10px] tracking-[0.3em] uppercase font-black flex items-center gap-3">
           <Activity className="w-4 h-4" /> YETENEKLER
         </label>
         <div className="flex flex-wrap gap-2.5">
            {resume.skills.map((skill: string, i: number) => (
              <span key={i} className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11px] font-bold text-indigo-300/80 hover:bg-indigo-500/10 transition-colors cursor-default">
                {skill}
              </span>
            ))}
         </div>
      </div>
    </div>
  );
};

export const EmployerApplications: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const statusFilter = searchParams.get('status') || 'All';

  const setStatusFilter = (status: string) => {
    if (status === 'All') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('status');
      setSearchParams(newParams);
    } else {
      setSearchParams({ status });
    }
  };

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [viewingResumeId, setViewingResumeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');

  const { data: applicants, isLoading } = useQuery({
    queryKey: ['employer-applications', statusFilter],
    queryFn: async () => {
      const { data } = await axios.get<EmployerApplicant[]>('/api/Applications/GetEmployerApplications', {
        params: { status: statusFilter === 'All' ? null : statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!token,
  });

  const filteredApplicants = applicants?.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    // "Tümü" sekmesinde sadece aktif ve incelenen adayları göster, reddedilenleri gizle
    if (statusFilter === 'All') {
      return matchesSearch && app.status !== 'Rejected';
    }
    
    return matchesSearch;
  });

  const handleUpdateStatus = async (applicationId: string, newStatus: string, message?: string) => {
    setUpdatingId(applicationId + newStatus);
    try {
      await axios.post('/api/Applications/UpdateStatus', { 
        applicationId, 
        newStatus,
        message: message || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      setMessagingId(null);
      setMessageText('');
      showToast(`İşlem Başarılı: Aday durumu '${statusLabels[newStatus] || newStatus}' olarak güncellendi.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('İşlem başarısız oldu: ' + (err.response?.data?.message || 'Sunucu hatası.'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full fade-in">
      <section className="bg-[#030305] border-b border-white/5 py-12 px-6">
          <div className="flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto">
              <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                      <Target className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                  </div>
                  <span className="m-label text-[10px] md:text-xs text-white/50 tracking-widest">CANDIDATE PIPELINE</span>
              </div>
              <h1 className="m-title text-3xl md:text-6xl leading-tight">
                {statusFilter === 'Accepted' ? 'MÜLAKATLAR' : 
                 statusFilter === 'Rejected' ? 'RETLER' : 
                 'ADAY YÖNETİMİ'}
              </h1>
              <p className="text-white/50 text-base md:text-lg font-medium max-w-2xl">
                Tüm aday başvuru süreçlerini yüksek doğrulukla ve hızla denetleyin.
              </p>
          </div>
      </section>

      <div className="w-full bg-[#030305]/50 border-b border-white/5 sticky top-0 md:top-auto z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 md:py-6 flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4 text-white/50 w-full lg:w-auto">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                <input 
                  className="bg-transparent border-none outline-none text-base md:text-xl font-medium placeholder-white/20 w-full lg:w-96 text-white" 
                  placeholder="Aday veya ilan ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/10 w-full lg:w-auto overflow-x-auto no-scrollbar">
                {[
                   { id: 'All', label: 'TÜMÜ', icon: <Target className="w-3 h-3 md:w-3.5 md:h-3.5" /> },
                   { id: 'Pending', label: 'BEKLEYEN', icon: <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> },
                   { id: 'Accepted', label: 'KABUL', icon: <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> },
                   { id: 'Rejected', label: 'RETLER', icon: <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl m-label !text-[9px] md:!text-xs transition-all duration-300 whitespace-nowrap flex-1 lg:flex-none justify-center ${
                      statusFilter === tab.id 
                        ? 'bg-indigo-600 !text-white shadow-lg shadow-indigo-600/20' 
                        : 'hover:bg-white/5 text-white/40'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.slice(0, 5)}</span>
                    {statusFilter === tab.id && (
                       <span className="ml-1 md:ml-2 px-1 md:px-1.5 py-0.5 bg-white/20 rounded md:rounded-md text-[8px] md:text-[10px] font-bold">
                          {filteredApplicants?.length || 0}
                       </span>
                    )}
                  </button>
                ))}
            </div>
        </div>
      </div>

      <section className="m-section !py-8 md:!py-16">
        {isLoading ? (
          <div className="py-20 md:py-40 flex justify-center">
             <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="m-grid">
            {filteredApplicants?.map((app) => (
              <div key={app.applicationId} className="m-card p-6 md:p-8 pt-10 md:pt-12 flex flex-col min-h-[500px] md:min-h-[600px] relative group overflow-hidden hover:border-indigo-500/50 transition-all duration-500">
                <div className="absolute top-4 right-4 md:top-5 md:right-5 z-20">
                   <div className={`px-3 md:px-4 py-1.5 md:py-2 border rounded-lg md:rounded-xl text-[8px] md:text-[10px] m-label flex items-center gap-2 md:gap-2.5 shadow-xl backdrop-blur-xl transition-all duration-500 ${
                      app.status === 'Accepted' ? 'text-emerald-400 border-emerald-400/40 bg-emerald-500/20 shadow-emerald-500/10' :
                      app.status === 'Rejected' ? 'text-red-400 border-red-500/10 bg-red-500/5' :
                      'text-amber-400 border-amber-400/10 bg-amber-500/5'
                   }`}>
                      {app.status === 'Accepted' ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : 
                       app.status === 'Rejected' ? <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> : 
                       <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                      <span className="tracking-[0.1em] md:tracking-[0.2em] font-black">{statusLabels[app.status] || app.status}</span>
                   </div>
                </div>

                <div className="flex justify-between items-start mb-6 md:mb-8 mt-2">
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[15px] md:rounded-[20px] flex items-center justify-center font-bold text-2xl md:text-3xl text-white shadow-xl border border-white/10">
                         {app.fullName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                         <h3 className="m-title text-xl md:text-2xl mb-1 truncate whitespace-nowrap">{app.fullName}</h3>
                         <div className="flex items-center gap-1.5 m-label !text-white/40 normal-case bg-white/[0.03] border border-white/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs truncate max-w-full">
                            <Mail className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-400 flex-shrink-0" /> <span className="truncate">{app.email}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 md:space-y-6 flex-1 mb-8 md:mb-10">
                   <div className="p-4 md:p-6 border border-white/5 bg-white/[0.01] rounded-2xl relative overflow-hidden group/label transition-colors">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30"></div>
                      <div className="m-label mb-2 md:mb-3 text-indigo-400/60 transition-colors uppercase tracking-[0.2em] font-black scale-90 origin-left text-[9px] md:text-[10px]">BAŞVURU HEDEFİ</div>
                      <div className="flex items-center gap-3 md:gap-4 text-white font-black text-lg md:text-2xl tracking-tighter uppercase leading-tight select-none">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10 flex-shrink-0">
                            <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                         </div>
                         <span className="truncate">{app.jobTitle}</span>
                      </div>
                   </div>

                   {app.employerMessage && (
                      <div className="p-4 md:p-6 bg-indigo-500/5 border-l-4 border-l-indigo-500 border border-white/5 rounded-r-2xl text-white/50 text-[11px] md:text-sm leading-relaxed italic">
                         <div className="m-label text-indigo-400/80 mb-2 md:mb-3 flex items-center gap-2 uppercase tracking-widest font-black text-[8px] md:text-[10px]"><MessageSquare className="w-3 h-3 md:w-3.5 md:h-3.5" /> GÖNDERİLMİŞ MESAJ</div>
                         "{app.employerMessage}"
                      </div>
                   )}
                </div>

                <div className="pt-6 md:pt-8 border-t border-white/5 space-y-3 md:space-y-4 bg-[#050507]">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <button 
                         onClick={() => setViewingResumeId(viewingResumeId === app.applicationId ? null : app.applicationId)}
                         className={`m-btn-secondary !text-[10px] md:!text-xs flex items-center justify-center gap-2 !py-3 ${viewingResumeId === app.applicationId ? '!bg-white/20 !border-white/30' : ''}`}
                      >
                         <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" /> {viewingResumeId === app.applicationId ? 'KASAYI KAPAT' : 'DOSYAYI İNCELE'}
                      </button>
                      <button 
                         onClick={() => setMessagingId(messagingId === app.applicationId ? null : app.applicationId)}
                         className={`m-btn-secondary !text-[10px] md:!text-xs flex items-center justify-center gap-2 !py-3 ${messagingId === app.applicationId ? '!bg-white/20 !border-white/30' : ''}`}
                      >
                         <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" /> DURUMU GÜNCELLE
                      </button>
                   </div>

                   {viewingResumeId === app.applicationId && (
                      <div className="border border-white/5 rounded-xl mt-4 bg-[#030305] overflow-hidden">
                         <ResumeSection userId={app.userId} token={token || ''} />
                      </div>
                   )}

                   {messagingId === app.applicationId && (
                      <div className="border border-white/5 rounded-xl mt-4 p-4 md:p-6 bg-white/[0.01]">
                        <div className="space-y-4 md:space-y-6">
                           <div className="space-y-2 md:space-y-3">
                              <label className="m-label text-[10px] md:text-xs text-indigo-400">DURUM MESAJI / DAVET METNİ</label>
                              <textarea 
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  placeholder="Adaya iletilecek detayları buraya yazınız..."
                                  className="m-input min-h-[100px] md:min-h-[120px] resize-none !text-sm"
                              />
                           </div>
                           <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                              <button 
                                 onClick={() => handleUpdateStatus(app.applicationId, 'Accepted', messageText)}
                                 disabled={updatingId === app.applicationId + 'Accepted'}
                                 className="flex-1 m-btn-primary !text-[9px] md:!text-[10px] !px-4 flex items-center justify-center gap-2 md:gap-2.5 h-10 md:h-12"
                              >
                                 {updatingId === app.applicationId + 'Accepted' ? (
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                 ) : (
                                    <><Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> KABUL ET / DAVET ET</>
                                 )}
                              </button>
                              <button 
                                 onClick={() => handleUpdateStatus(app.applicationId, 'Rejected')}
                                 disabled={updatingId === app.applicationId + 'Rejected'}
                                 className="flex-1 m-btn-secondary !text-red-400 !border-red-500/20 hover:!bg-red-500/10 !text-[9px] md:!text-[10px] !px-4 flex items-center justify-center gap-2 md:gap-2.5 h-10 md:h-12"
                              >
                                  {updatingId === app.applicationId + 'Rejected' ? (
                                    <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 animate-spin"></div>
                                 ) : (
                                    <><XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> ADAYI REDDET</>
                                 )}
                              </button>
                           </div>
                        </div>
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
