import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', userName: '', password: '', role: 'JobSeeker'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post('https://localhost:7054/api/Auth/Register', form);
      if (response.data.isSuccessful) {
        setSuccess('Kayıt başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(response.data.errorMessages?.[0] ?? 'Kayıt başarısız.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.errorMessages?.[0] ?? 'Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center fade-in bg-[#030305] relative overflow-hidden py-12 px-6">
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-7xl relative z-10">
         {/* Lunar Header Block */}
         <div className="mb-20 border-b border-white/5 pb-12">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                     <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="m-label text-white/50">NETWORK ARCHITECTURE</span>
              </div>
              <h1 className="m-title text-4xl md:text-6xl tracking-tight leading-tight mb-6">
                  YENİ <br/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">KİMLİK OLUŞTURUN.</span>
              </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-8 m-card p-10 md:p-16">
                  <div className="mb-12 flex justify-between items-start">
                      <div>
                        <h2 className="m-title text-3xl mb-2">KAYIT PANELİ</h2>
                        <p className="m-label text-white/40">PROFESYONEL VEYA İŞVEREN SEÇİMİ YAPIN</p>
                      </div>
                      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                          <UserPlus className="w-6 h-6 text-white/80" />
                      </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-10">
                      <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                          <button
                              type="button"
                              onClick={() => setForm({ ...form, role: 'JobSeeker' })}
                              className={`py-4 rounded-xl text-xs font-bold tracking-wide transition-all ${
                              form.role === 'JobSeeker'
                                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg'
                                  : 'text-white/40 hover:text-white hover:bg-white/5'
                              }`}
                          >
                             YETENEK / ADAY
                          </button>
                          <button
                              type="button"
                              onClick={() => setForm({ ...form, role: 'Employer' })}
                              className={`py-4 rounded-xl text-xs font-bold tracking-wide transition-all ${
                              form.role === 'Employer'
                                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg'
                                  : 'text-white/40 hover:text-white hover:bg-white/5'
                              }`}
                          >
                             İŞVEREN / KURUM
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                              <label className="m-label text-white/50">ADINIZ</label>
                              <input className="m-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Alex" required />
                          </div>
                          <div className="space-y-3">
                              <label className="m-label text-white/50">SOYADINIZ</label>
                              <input className="m-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Vance" required />
                          </div>
                      </div>

                      <div className="space-y-3">
                          <label className="m-label text-white/50">E-POSTA ADRESİ</label>
                          <input type="email" className="m-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="alex@primeit.app" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                              <label className="m-label text-white/50">KULLANICI ADI</label>
                              <input className="m-input" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} placeholder="alexvance9" required />
                          </div>
                          <div className="space-y-3">
                              <label className="m-label text-white/50">ŞİFRE</label>
                              <input type="password" className="m-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••••••" required />
                          </div>
                      </div>

                      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl m-label text-center">{error}</div>}
                      {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl m-label text-center">{success}</div>}

                      <div className="pt-6">
                          <button type="submit" disabled={loading} className="m-btn-primary w-full flex items-center justify-center gap-4 py-5">
                              {loading ? (
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                  <><span>KAYDI BAŞLAT VE İLERLE</span> <ArrowRight className="w-5 h-5" /></>
                              )}
                          </button>
                      </div>
                  </form>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="m-card p-10 flex flex-col gap-6 bg-gradient-to-br from-white/[0.02] to-transparent border-white/5">
                      <h3 className="m-label text-white">GÜVENLİK PROTOKOLÜ</h3>
                      <p className="text-white/50 text-base leading-relaxed">
                         Tüm verileriniz endüstri standardı protokollerle şifrelenir ve izinsiz üçüncü taraflarla paylaşılmaz.
                      </p>
                  </div>
                  <div className="m-card p-10 flex flex-col gap-6 bg-gradient-to-br from-white/[0.02] to-transparent border-white/5">
                      <h3 className="m-label text-white">NETWORK DESTEĞİ</h3>
                      <p className="text-white/50 text-base leading-relaxed">
                         Sorun mu yaşıyorsunuz? Kurumsal destek merkezimiz kesintisiz hizmet vermektedir.
                      </p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5">
                      <Link to="/login" className="flex items-center gap-5 group p-4 rounded-2xl hover:bg-white/5 transition-all outline outline-1 outline-transparent hover:outline-white/10">
                          <div className="w-14 h-14 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 group-hover:scale-105 transition-all">
                              <ShieldCheck className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="flex flex-col gap-1">
                              <span className="text-white font-bold text-lg tracking-tight">GİRİŞE DÖN</span>
                              <span className="text-xs text-white/40">ZATEN ÜYE MİSİNİZ?</span>
                          </div>
                      </Link>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
