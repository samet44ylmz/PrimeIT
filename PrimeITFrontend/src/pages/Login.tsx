import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import axios from 'axios';
import { LucideShieldCheck, LucideBriefcase, LucideArrowRight, LucideUserPlus } from 'lucide-react';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch { return {}; }
}


export const Login: React.FC = () => {
  const [emailOrUserName, setEmailOrUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/Auth/Login', {
        emailOrUserName,
        password,
      });

      const data = response.data;
      if (data.isSuccessful) {
        const decoded = parseJwt(data.data.token);
        dispatch(login({
          userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || emailOrUserName,
          token: data.data.token,
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'JobSeeker',
          fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || emailOrUserName,
        }));
        navigate('/');
      } else {
        setError(data.errorMessages?.[0] ?? 'Giriş başarısız.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.errorMessages?.[0] ?? 'Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center fade-in bg-[#030305] relative overflow-hidden py-12 px-6">
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="w-full max-w-7xl relative z-10">
          {/* Lunar Header Block */}
          <div className="mb-20 border-b border-white/5 pb-12">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                     <LucideShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="m-label text-white/50">SECURE GATEWAY</span>
              </div>
              <h1 className="m-title text-4xl md:text-6xl tracking-tight leading-tight mb-6">
                  GÜVENLİ <br/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">ERİŞİM PANELİ.</span>
              </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-7 m-card p-10 md:p-16">
                  <div className="mb-12">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                          <LucideBriefcase className="w-8 h-8 text-white/80" />
                      </div>
                      <h2 className="m-title text-3xl mb-2">GİRİŞ YAPIN</h2>
                      <p className="m-label text-white/40">PROFESYONEL ÜYELİK KİMLİĞİNİZİ KULLANIN</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-12">
                      <div className="space-y-4">
                          <label className="m-label text-white/50">KULLANICI ADI VEYA E-POSTA</label>
                          <input
                              type="text"
                              className="m-input"
                              value={emailOrUserName}
                              onChange={(e) => setEmailOrUserName(e.target.value)}
                              placeholder="agency@primeit.app"
                              required
                          />
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <label className="m-label text-white/50">GÜVENLİK ŞİFRESİ</label>

                          </div>
                          <input
                              type="password"
                              className="m-input"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              required
                          />
                      </div>

                      {error && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl m-label text-center">
                              {error}
                          </div>
                      )}

                      <div className="pt-8">
                          <button type="submit" disabled={loading} className="m-btn-primary w-full flex items-center justify-center gap-4 py-5">
                              {loading ? (
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                  <><span>SİSTEME GİRİŞ YAP</span> <LucideArrowRight className="w-5 h-5" /></>
                              )}
                          </button>
                      </div>
                  </form>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-8">
                  <div className="m-card p-10 md:p-14 flex flex-col gap-10 bg-gradient-to-br from-white/[0.02] to-transparent border-white/5">
                      <h3 className="m-label text-white">YENİ ÜYELİK</h3>
                      <p className="text-white/60 text-lg leading-relaxed">
                         PrimeIT ağına dahil olarak global düzeyde yetenek yönetimi ve teknoloji pozisyonlarına erişim yetkisi kazanın.
                      </p>
                      <div className="pt-8 border-t border-white/5">
                          <Link to="/register" className="flex items-center gap-6 group p-4 rounded-2xl hover:bg-white/5 transition-all outline outline-1 outline-transparent hover:outline-white/10">
                              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 group-hover:scale-105 transition-all">
                                  <LucideUserPlus className="w-6 h-6 text-indigo-400" />
                              </div>
                              <div className="flex flex-col gap-1">
                                  <span className="text-white font-bold text-lg tracking-tight">KAYIT OLUN</span>
                                  <span className="text-xs text-white/40">YENİ PROFİL OLUŞTURUN</span>
                              </div>
                          </Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
