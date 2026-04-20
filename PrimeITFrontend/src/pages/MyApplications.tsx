import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { RootState } from '../store';
import { MapPin, Building, Clock, FileText, MessageSquare, ArrowRight, Shield } from 'lucide-react';

interface MyApp {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  employerMessage?: string;
  appliedAt: string;
}

const statusColors: Record<string, string> = {
  Pending: 'text-amber-500 border-amber-500/10 bg-amber-500/5',
  Reviewed: 'text-blue-500 border-blue-500/10 bg-blue-500/5',
  Accepted: 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5',
  Rejected: 'text-red-500 border-red-500/10 bg-red-500/5',
};

const statusLabels: Record<string, string> = {
  Pending: '⏳ BEKLEMEDE',
  Reviewed: '👀 İNCELENİYOR',
  Accepted: '📅 MÜLAKAT TEKLİFİ',
  Rejected: '❌ REDDEDİLDİ',
};

export const MyApplications: React.FC = () => {
  const { userId, token } = useSelector((state: RootState) => state.auth);

  const { data: apps, isLoading } = useQuery({
    queryKey: ['my-applications', userId],
    queryFn: async () => {
      const { data } = await axios.get<MyApp[]>('/api/Applications/MyApplications', {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!userId,
  });

  return (
    <div className="w-full fade-in flex flex-col bg-[#030305] min-h-screen">
      {/* Lunar Header */}
      <section className="bg-[#030305] border-b border-white/5 py-12 px-6">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                   <FileText className="w-5 h-5 text-indigo-400" />
               </div>
               <span className="m-label text-white/50">PERSONAL REGISTRY</span>
            </div>
            <h1 className="m-title text-4xl md:text-6xl leading-tight">
               KİŞİSEL <br/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">BAŞVURU KAYITLARI.</span>
            </h1>
        </div>
      </section>

      {/* Lunar Info Strip */}
      <div className="w-full px-6 md:px-12 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01] max-w-7xl mx-auto">
          <div className="flex items-center gap-3 m-label text-white/30">
              <Shield className="w-4 h-4" /> VERİLERİNİZ DOĞRULANMAKTADIR
          </div>
          <div className="m-label border border-white/5 bg-white/5 px-6 py-2 rounded-full">
              {apps?.length || 0} AKTİF KAYIT
          </div>
      </div>

      <section className="m-section">
        {isLoading && (
          <div className="flex justify-center py-40">
             <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && (!apps || apps.length === 0) && (
          <div className="w-full py-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
             <span className="m-title text-2xl text-white/20">HENÜZ BAŞVURUDA BULUNMADINIZ</span>
          </div>
        )}

        <div className="m-grid">
          {apps?.map((app) => (
            <div key={app.applicationId} className="m-card p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex-1 pr-4">
                    <h3 className="m-title text-2xl mb-4 leading-snug">{app.jobTitle}</h3>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3 m-label text-white/40">
                          <Building className="w-4 h-4 text-indigo-400" />{app.company}
                       </div>
                       <div className="flex items-center gap-3 m-label text-white/40">
                          <MapPin className="w-4 h-4 text-indigo-400" />{app.location}
                       </div>
                    </div>
                 </div>
                 <div className={`px-3 py-1.5 border rounded-full m-label whitespace-nowrap ${statusColors[app.status] || statusColors.Pending}`}>
                    {statusLabels[app.status] || app.status}
                 </div>
              </div>

              {app.employerMessage && (
                <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6 flex flex-col gap-3 flex-1">
                   <div className="m-label text-indigo-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> İŞVERENDEN GELEN MESAJ
                   </div>
                   <p className="text-base text-white/80 font-medium leading-relaxed">
                     {app.employerMessage}
                   </p>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2 m-label text-white/20">
                    <Clock className="w-4 h-4" /> {new Date(app.appliedAt).toLocaleDateString()}
                 </div>
                 <button className="text-white/20 hover:text-indigo-400 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
