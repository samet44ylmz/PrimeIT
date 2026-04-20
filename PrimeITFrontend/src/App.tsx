import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { logout } from './store/slices/authSlice';
import { setUnreadCount } from './store/slices/notificationSlice';
import { Briefcase, Bell, LogOut, Menu } from 'lucide-react';

// Pages - Will be rebuilt next
import { JobBoard } from './pages/JobBoard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployerDashboard } from './pages/AdminDashboard';
import { EmployerJobs } from './pages/EmployerJobs';
import { MyApplications } from './pages/MyApplications';
import { EmployerApplications } from './pages/EmployerApplications';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { ToastProvider } from './store/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmProvider, useConfirm } from './store/ConfirmContext';

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, role, fullName, token } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated || !token) return;
      try {
        const response = await axios.get('https://localhost:7054/api/Notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setUnreadCount(response.data.data.filter((n: any) => !n.isRead).length));
      } catch (err) { console.error(err); }
    };
    fetchUnread();
    const inv = setInterval(fetchUnread, 30000);
    return () => clearInterval(inv);
  }, [isAuthenticated, token]);

  const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link to={to} className="m-label text-white/70 hover:text-white transition-all py-2">
      {children}
    </Link>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Lunar Modern Floating Header */}
      <header className="sticky top-6 z-50 w-full px-6 md:px-12 pointer-events-none transition-all duration-300">
        <div className="max-w-6xl mx-auto bg-[#030305]/80 backdrop-blur-xl border border-white/10 rounded-full h-16 md:h-20 flex justify-between items-center px-6 md:px-10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] pointer-events-auto">
            <Link to="/" className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-indigo-500/30">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight">PrimeIT</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-10">
                <NavLink to="/">İLANLAR</NavLink>
                {isAuthenticated ? (
                    <div className="flex items-center gap-12">
                        {role === 'Employer' && (
                            <>
                                <NavLink to="/employer/jobs">İLANLARIM</NavLink>
                                <NavLink to="/employer/candidates">ADAYLAR</NavLink>
                                <button onClick={() => navigate('/employer')} className="m-btn-primary !px-6 !py-2 !text-xs !shadow-none">
                                    YENİ İLAN
                                </button>
                            </>
                        )}
                        {role === 'JobSeeker' && (
                            <>
                                <NavLink to="/profile">PROFİLİM</NavLink>
                                <NavLink to="/my-applications">BAŞVURULARIM</NavLink>
                            </>
                        )}
                        <Link to="/notifications" className="relative text-white/50 hover:text-white transition-all">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-500/20">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <div className="flex items-center gap-6 pl-10 border-l border-white/10">
                            <span className="text-sm font-medium text-white/60 tracking-normal normal-case">{fullName}</span>
                            <button 
                                onClick={async () => {
                                    const ok = await confirm({
                                        title: 'OTURUMU KAPAT?',
                                        message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
                                        confirmLabel: 'EVET, ÇIKIS YAP',
                                        cancelLabel: 'VAZGEÇ'
                                    });
                                    if (ok) dispatch(logout());
                                }} 
                                className="text-white/50 hover:text-red-400 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="m-label hover:text-white transition-all">GİRİŞ</Link>
                        <Link to="/register" className="m-btn-primary !px-6 !py-2 !text-xs !shadow-none">KAYIT OL</Link>
                    </div>
                )}
            </nav>

            <button className="lg:hidden text-white"><Menu className="w-6 h-6" /></button>
        </div>
      </header>

      {/* Main Content Hub - Truly Wide */}
      <main className="flex-1 w-full bg-[#0A0A0C]">
        <Routes>
          <Route path="/" element={<JobBoard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Login />} />
          <Route path="/employer" element={isAuthenticated && role === 'Employer' ? <EmployerDashboard /> : <Login />} />
          <Route path="/employer/jobs" element={isAuthenticated && role === 'Employer' ? <EmployerJobs /> : <Login />} />
          <Route path="/employer/candidates" element={isAuthenticated && role === 'Employer' ? <EmployerApplications /> : <Login />} />
          <Route path="/my-applications" element={isAuthenticated && role === 'JobSeeker' ? <MyApplications /> : <Login />} />
          <Route path="/profile" element={isAuthenticated && role === 'JobSeeker' ? <Profile /> : <Login />} />
        </Routes>
      </main>

      <footer className="w-full bg-[#030305] border-t border-white/5 py-10 px-10 md:px-20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-20">
              <Briefcase className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white">ELITE IT NETWORK ARCHITECTURE</span>
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase text-white opacity-10">&copy; 2026 PRIMEIT INC. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <Router>
            <ToastContainer />
            <AppContent />
          </Router>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
