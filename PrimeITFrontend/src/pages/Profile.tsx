import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { RootState } from '../store';
import { User, Briefcase, GraduationCap, Code, Plus, X, Save, Target } from 'lucide-react';
import { useToast } from '../store/ToastContext';

interface Experience {
  companyName: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

interface Resume {
  summary: string;
  experiences: Experience[];
  educations: Education[];
  skills: string[];
}

export const Profile: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState<Resume>({
    summary: '',
    experiences: [],
    educations: [],
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');

  const { data: resume } = useQuery({
    queryKey: ['my-resume'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/Resumes/my-resume', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!token
  });

  useEffect(() => {
    if (resume) {
      setForm({
        summary: resume.summary || '',
        experiences: resume.experiences || [],
        educations: resume.educations || [],
        skills: resume.skills || []
      });
    }
  }, [resume]);

  const normalizeResumeData = (data: Resume): Resume => {
    return {
      ...data,
      summary: data.summary || '',
      experiences: (data.experiences || []).map(exp => ({
        ...exp,
        companyName: exp.companyName || '',
        title: exp.title || '',
        description: exp.description || '',
        startDate: exp.startDate || new Date().toISOString(),
        endDate: exp.endDate === "" ? undefined : exp.endDate
      })),
      educations: (data.educations || []).map(edu => ({
        ...edu,
        schoolName: edu.schoolName || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || new Date().toISOString(),
        endDate: edu.endDate === "" ? undefined : edu.endDate
      })),
      skills: data.skills || []
    };
  };

  const mutation = useMutation({
    mutationFn: async (updatedResume: Resume) => {
      const normalized = normalizeResumeData(updatedResume);
      await axios.post('/api/Resumes', normalized, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resume'] });
      showToast('Profil başarıyla güncellendi! 🚀', 'success');
    },
    onError: (err: any) => {
      console.error(err);
      showToast('Hata: ' + (err.response?.data?.message || err.response?.data || 'Profil güncellenirken bir hata oluştu.'), 'error');
    }
  });

  const handleAddField = (type: 'exp' | 'edu') => {
    if (type === 'exp') {
      setForm({ ...form, experiences: [...form.experiences, { companyName: '', title: '', startDate: '', isCurrent: false, description: '' }] });
    } else {
      setForm({ ...form, educations: [...form.educations, { schoolName: '', degree: '', fieldOfStudy: '', startDate: '' }] });
    }
  };

  const handleUpdateField = (type: 'exp' | 'edu', index: number, field: string, value: any) => {
    if (type === 'exp') {
        const newArr = [...form.experiences];
        (newArr[index] as any)[field] = value;
        setForm({ ...form, experiences: newArr });
    } else {
        const newArr = [...form.educations];
        (newArr[index] as any)[field] = value;
        setForm({ ...form, educations: newArr });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  return (
    <div className="w-full fade-in flex flex-col bg-[#030305] min-h-screen pb-32">
      {/* Lunar Header */}
      <section className="bg-[#030305] border-b border-white/5 py-16 px-6 md:px-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                   <User className="w-5 h-5 text-indigo-400" />
               </div>
               <span className="m-label text-white/50">PERSONNEL DOSSIER</span>
            </div>
            <h1 className="m-title text-4xl md:text-6xl uppercase tracking-tight">
               PROFİLİM <br/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">YÖNETİMİ.</span>
            </h1>
            <p className="text-white/50 text-lg font-medium max-w-2xl">
                Profesyonel kimliğinizi en iyi şekilde yansıtın. Kariyerinize odaklanan gelişmiş profil yönetimi.
            </p>
        </div>
      </section>

      {/* Lunar Spaced Form */}
      <section className="w-full max-w-4xl mx-auto mt-16 px-6 md:px-10">
         <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="w-full space-y-8">
            
            {/* Summary Section */}
            <div className="m-card p-8 md:p-10 relative group">
                <div className="flex flex-col gap-6 mb-6">
                    <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                            <Target className="w-6 h-6 text-white/80" />
                         </div>
                        <div>
                           <h2 className="m-title text-2xl">PROFESYONEL ÖZET</h2>
                           <p className="text-white/40 text-sm mt-1">Kariyer hedeflerinizi ve en güçlü yanlarınızı özetleyin.</p>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <textarea 
                        className="m-input min-h-[200px] resize-none"
                        value={form.summary}
                        onChange={e => setForm({ ...form, summary: e.target.value })}
                        placeholder="Yazılım dünyasındaki vizyonunuzu buraya aktarın..."
                    />
                </div>
            </div>

            {/* Experience Section */}
            <div className="m-card p-8 md:p-10 relative">
                <div className="flex justify-between items-start md:items-center mb-8 flex-col md:flex-row gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                           <Briefcase className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="m-title text-2xl">İŞ TECRÜBELERİ</h2>
                    </div>
                    <button type="button" onClick={() => handleAddField('exp')} className="m-btn-secondary !py-3 flex items-center gap-2 !text-xs">
                        <Plus className="w-4 h-4" /> KAYIT EKLE
                    </button>
                </div>
                
                <div className="flex flex-col gap-6">
                    {form.experiences.map((exp, i) => (
                        <div key={i} className="p-6 md:p-8 border border-white/5 bg-white/[0.02] rounded-2xl relative">
                            <button 
                                type="button" 
                                onClick={() => setForm({ ...form, experiences: form.experiences.filter((_, idx) => idx !== i) })}
                                className="absolute top-6 right-6 text-red-400 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">ŞİRKET ADI</label>
                                    <input className="m-input" value={exp.companyName} onChange={e => handleUpdateField('exp', i, 'companyName', e.target.value)} placeholder="Örn: PrimeIT" />
                                </div>
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">POZİSYON / UNVAN</label>
                                    <input className="m-input" value={exp.title} onChange={e => handleUpdateField('exp', i, 'title', e.target.value)} placeholder="Senior Software Engineer" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">BAŞLANGIÇ</label>
                                    <input type="date" className="m-input" value={exp.startDate?.split('T')[0] || ''} onChange={e => handleUpdateField('exp', i, 'startDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">BİTİŞ</label>
                                    <input type="date" disabled={exp.isCurrent} className="m-input disabled:opacity-30" value={exp.endDate?.split('T')[0] || ''} onChange={e => handleUpdateField('exp', i, 'endDate', e.target.value)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <input type="checkbox" checked={exp.isCurrent} onChange={e => handleUpdateField('exp', i, 'isCurrent', e.target.checked)} className="w-4 h-4 accent-indigo-500 rounded" />
                                <label className="m-label text-white/80">HALEN ÇALIŞIYORUM</label>
                            </div>
                            <div className="space-y-2">
                                <label className="m-label text-white/50">GÖREV TANIMI</label>
                                <textarea className="m-input min-h-[100px] resize-none" value={exp.description} onChange={e => handleUpdateField('exp', i, 'description', e.target.value)} placeholder="Neler başardınız? Hangi teknolojileri kullandınız?" />
                            </div>
                        </div>
                    ))}
                    {form.experiences.length === 0 && (
                       <p className="text-white/40 m-label text-center py-6 border border-dashed border-white/10 rounded-xl">HENÜZ İŞ TECRÜBESİ EKLENMEDİ</p>
                    )}
                </div>
            </div>

            {/* Education Section */}
            <div className="m-card p-8 md:p-10 relative">
                <div className="flex justify-between items-start md:items-center mb-8 flex-col md:flex-row gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                           <GraduationCap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="m-title text-2xl">EĞİTİM BİLGİLERİ</h2>
                    </div>
                    <button type="button" onClick={() => handleAddField('edu')} className="m-btn-secondary !py-3 flex items-center gap-2 !text-xs">
                        <Plus className="w-4 h-4" /> KAYIT EKLE
                    </button>
                </div>
                
                <div className="flex flex-col gap-6">
                    {form.educations.map((edu, i) => (
                        <div key={i} className="p-6 md:p-8 border border-white/5 bg-white/[0.02] rounded-2xl relative">
                            <button 
                                type="button" 
                                onClick={() => setForm({ ...form, educations: form.educations.filter((_, idx) => idx !== i) })}
                                className="absolute top-6 right-6 text-red-400 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="mb-6 space-y-2">
                                <label className="m-label text-white/50">OKUL / ÜNİVERSİTE</label>
                                <input className="m-input" value={edu.schoolName} onChange={e => handleUpdateField('edu', i, 'schoolName', e.target.value)} placeholder="İTÜ / ODTÜ vs." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">DERECE</label>
                                    <input className="m-input" value={edu.degree} onChange={e => handleUpdateField('edu', i, 'degree', e.target.value)} placeholder="Lisans / Yüksek Lisans" />
                                </div>
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">BÖLÜM</label>
                                    <input className="m-input" value={edu.fieldOfStudy} onChange={e => handleUpdateField('edu', i, 'fieldOfStudy', e.target.value)} placeholder="Mühendislik" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">BAŞLANGIÇ</label>
                                    <input type="date" className="m-input" value={edu.startDate?.split('T')[0] || ''} onChange={e => handleUpdateField('edu', i, 'startDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="m-label text-white/50">MEZUNİYET</label>
                                    <input type="date" className="m-input" value={edu.endDate?.split('T')[0] || ''} onChange={e => handleUpdateField('edu', i, 'endDate', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {form.educations.length === 0 && (
                       <p className="text-white/40 m-label text-center py-6 border border-dashed border-white/10 rounded-xl">HENÜZ EĞİTİM BİLGİSİ EKLENMEDİ</p>
                    )}
                </div>
            </div>

            {/* Skills Section */}
            <div className="m-card p-8 md:p-10 relative">
                <div className="flex flex-col md:flex-row gap-6 mb-6 md:items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                           <Code className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="m-title text-2xl">TEKNİK YETENEKLER</h2>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <input 
                        className="m-input flex-1" 
                        value={newSkill} 
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="Örn: React, C#, MongoDB..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <button type="button" onClick={handleAddSkill} className="m-btn-primary !py-3 px-8">EKLE</button>
                </div>

                <div className="flex flex-wrap gap-3">
                    {form.skills.map((skill, i) => (
                        <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white m-label flex items-center gap-3 group hover:border-red-500/30 transition-colors shadow-sm">
                            {skill}
                            <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) })} className="text-red-400 opacity-40 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                    ))}
                    {form.skills.length === 0 && (
                        <span className="text-white/40 m-label block w-full text-center py-6 border border-dashed border-white/10 rounded-xl">LİSTE BOŞ</span>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
                <button type="submit" disabled={mutation.isPending} className="m-btn-primary w-full !py-5 flex items-center justify-center gap-4 text-lg">
                   {mutation.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                     <><Save className="w-5 h-5" /> PROFİLİ GÜNCELLE</>
                   )}
                </button>
            </div>
         </form>
      </section>
    </div>
  );
};
