import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Clock, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { decrementUnreadCount } from '../store/slices/notificationSlice';
import type { RootState } from '../store';

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const dispatch = useDispatch();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/Notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await axios.post(`/api/Notifications/${id}/mark-as-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      dispatch(decrementUnreadCount());
    } catch (err) { console.error(err); }
  };

  return (
    <div className="w-full fade-in bg-[#030305] min-h-screen">
      {/* Lunar Header */}
      <section className="bg-[#030305] border-b border-white/5 py-12 px-6">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex justify-center items-center">
                   <Bell className="w-5 h-5 text-indigo-400" />
               </div>
               <span className="m-label text-white/50">SYSTEM ALERTS</span>
            </div>
            <h1 className="m-title text-4xl md:text-6xl tracking-tight leading-tight">
              BİLDİRİMLER <br/> <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">VE MESAJLAR.</span>
            </h1>
        </div>
      </section>

      {/* Lunar Status Bar */}
      <div className="w-full px-6 md:px-12 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01] max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 m-label text-white/50 hover:text-white transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> GERİ DÖN
          </Link>
          <div className="m-label border border-white/5 bg-white/5 px-6 py-2 rounded-full uppercase tracking-widest text-[#888899]">
              {unreadCount} OKUNMAMIŞ MESAJ
          </div>
      </div>

      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8">
        {loading ? (
             <div className="flex flex-col items-center py-40">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
             </div>
        ) : notifications.length === 0 ? (
            <div className="w-full py-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <span className="m-title text-2xl text-white/20">BİLDİRİM BULUNAMADI</span>
            </div>
        ) : (
            <div className="w-full flex flex-col gap-4">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={`m-card p-6 md:p-8 flex items-center justify-between gap-8 group transition-all ${!notif.isRead ? 'border-indigo-500/20 bg-indigo-500/[0.03]' : 'opacity-50'}`}
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl border transition-colors shadow-md ${!notif.isRead ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                {notif.type === 'StatusUpdate' ? <Mail className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className={`m-label !text-xs ${!notif.isRead ? 'text-indigo-400' : 'text-white/20'}`}>
                                        {notif.type === 'StatusUpdate' ? 'MÜLAKAT / DURUM' : 'SİSTEM MESAJI'}
                                    </span>
                                    <div className="flex items-center gap-2 m-label text-white/20">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="text-lg text-white/80 font-medium leading-relaxed">{notif.message}</p>
                            </div>
                        </div>

                        {!notif.isRead && (
                            <button 
                                onClick={() => markAsRead(notif.id)}
                                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all group-hover:scale-110 shadow-sm"
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  );
};
