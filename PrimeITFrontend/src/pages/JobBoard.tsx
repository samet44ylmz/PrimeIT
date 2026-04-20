import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Briefcase, MapPin, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Link } from 'react-router-dom';
import { ApplicantDetailsModal } from '../components/ApplicantDetailsModal';
import { SkeletonList } from '../components/Skeletons';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  company: string;
  questionsJson: string;
}

export const JobBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<{ id: string, title: string, questions: string } | null>(null);
  const [applySuccess, setApplySuccess] = useState<{ [key: string]: boolean }>({});

  const { isAuthenticated, role, userId, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await axios.get('/api/Jobs/get-all');
      return res.data;
    },
    enabled: !debouncedSearch,
  });

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['jobs', 'search', debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(`/api/Jobs/search?q=${debouncedSearch}`);
      return res.data;
    },
    enabled: !!debouncedSearch,
  });
  
  const { data: myApplications } = useQuery({
    queryKey: ['my-applications', userId],
    queryFn: async () => {
      const res = await axios.get('/api/Applications/MyApplications', {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: isAuthenticated && role === 'JobSeeker' && !!userId && !!token,
  });

  const isApplied = (jobId: string) => {
    return applySuccess[jobId] || (myApplications?.some((app: any) => app.jobId === jobId));
  };

  const displayJobs = debouncedSearch ? searchResults : jobs;

  return (
    <div className="w-full fade-in">
      {/* Lunar Modern Hero & Search */}
      <section className="m-section bg-[#030305] border-b border-white/5 relative overflow-hidden !py-12 md:!py-24">
          {/* Subtle gradient orb for background depth */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative flex flex-col gap-4 md:gap-6 mb-8 md:mb-12 z-10">
              <div className="flex items-center gap-3 md:gap-4">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
                  <span className="m-label text-[10px] md:text-xs text-white/50">GLOBAL OPPORTUNITIES HUB</span>
              </div>
              <h1 className="m-title text-3xl md:text-6xl leading-tight">
                 Kariyerinizin <br className="hidden md:block"/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Yeni Dönemi</span> Başlıyor.
              </h1>
          </div>

          <div className="relative w-full max-w-4xl z-10">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40" />
              <input 
                  className="m-input !py-4 md:!py-5 !pl-12 md:!pl-16 !text-base md:!text-lg shadow-2xl"
                  placeholder="Yetenek veya şehir arayın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && (
                  <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              )}
          </div>
      </section>

      {/* Lunar Job Grid */}
      <section className="m-section !py-8 md:!py-16">
          {isLoading && <SkeletonList count={6} />}

          <div className="m-grid">
              {displayJobs?.map((job: Job) => (
                  <div key={job.id} className="m-card p-6 md:p-8 flex flex-col gap-6 md:gap-8 group">
                      <div className="flex justify-between items-start">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white/60 group-hover:text-violet-400 transition-colors" />
                          </div>
                          <div className="m-label px-2.5 py-1 text-[10px] md:text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">AKTİF</div>
                      </div>

                      <div className="flex-1">
                          <h3 className="m-title text-2xl mb-3 leading-tight group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          <div className="flex items-center gap-3 mb-6 flex-wrap">
                              <span className="m-label text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{job.company}</span>
                              <span className="flex items-center gap-1 m-label text-white/40">
                                  <MapPin className="w-3 h-3" /> {job.location}
                              </span>
                          </div>
                          <p className="text-white/50 text-base leading-relaxed line-clamp-3">
                             {job.description}
                          </p>
                      </div>

                      <div className="pt-8 border-t border-white/10 flex flex-col gap-6">
                          <div className="flex justify-between items-end">
                              <div className="text-xs text-white/40 font-medium">Başlangıç Maaşı</div>
                              <div className="text-xl font-bold text-white">₺{job.salaryMin.toLocaleString()}+</div>
                          </div>
                          
                          {isAuthenticated && role === 'JobSeeker' ? (
                            <button
                                onClick={() => setSelectedJob({ id: job.id, title: job.title, questions: job.questionsJson })}
                                disabled={isApplied(job.id)}
                                className={`w-full flex items-center justify-center gap-2 ${
                                isApplied(job.id)
                                    ? 'py-3 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full cursor-default'
                                    : 'm-btn-primary'
                                }`}
                            >
                                {isApplied(job.id) ? 'BAŞVURULDU' : (
                                    <>DETAYLARI GÖR <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                          ) : !isAuthenticated ? (
                            <Link to="/login" className="m-btn-secondary w-full text-center flex justify-center items-center">GİRİŞ YAPIN</Link>
                          ) : (
                            <div className="w-full text-center py-3 border border-white/5 rounded-full m-label !text-white/20">YÖNETİCİ GÖRÜNÜMÜ</div>
                          )}
                      </div>
                  </div>
              ))}
          </div>

          {!isLoading && displayJobs?.length === 0 && (
              <div className="py-40 flex justify-center text-center">
                  <h3 className="m-title text-2xl text-white/20">KAYIT BULUNAMADI</h3>
              </div>
          )}
      </section>

      {selectedJob && (
        <ApplicantDetailsModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          questions={selectedJob.questions}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => {
            setApplySuccess(prev => ({ ...prev, [selectedJob.id]: true }));
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
};
