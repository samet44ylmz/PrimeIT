import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
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
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, role, fullName, token } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated || !token) return;
      try {
        const response = await axios.get('/api/Notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setUnreadCount(response.data.data.filter((n: any) => !n.isRead).length));
      } catch (err) { console.error(err); }
    };
    fetchUnread();
    const inv = setInterval(fetchUnread, 30000);
    return () => clearInterval(inv);
  }, [isAuthenticated, token]);

  const NavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => (
    <Link to={to} onClick={onClick} className="m-label text-white/70 hover:text-white transition-all py-2 lg:py-0">
      {children}
    </Link>
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Lunar Modern Floating Header */}
      <header className="sticky top-6 z-50 w-full px-4 md:px-12 pointer-events-none transition-all duration-300">
        <div className="max-w-6xl mx-auto bg-[#030305]/80 backdrop-blur-xl border border-white/10 rounded-full h-16 md:h-20 flex justify-between items-center px-6 md:px-10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] pointer-events-auto">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-3 md:gap-4 group">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg md:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-indigo-500/30">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-lg md:text-2xl font-bold text-white tracking-tight">PrimeIT</span>
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
                            <span className="text-sm font-medium text-white/60 tracking-normal normal-case line-clamp-1 max-w-[120px]">{fullName}</span>
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
                        <Link to="/login" className="m-label hover:text-white transition-all text-xs">GİRİŞ</Link>
                        <Link to="/register" className="m-btn-primary !px-5 !py-2 !text-[10px] md:!text-xs !shadow-none">KAYIT OL</Link>
                    </div>
                )}
            </nav>

            <button onClick={toggleMenu} className="lg:hidden text-white p-2">
              <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 top-0 left-0 bg-[#030305] z-50 transition-all duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col h-full p-8">
            <div className="flex justify-between items-center mb-12">
              <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">PrimeIT</span>
              </Link>
              <button onClick={closeMenu} className="text-white/50 p-2">
                  <Menu className="w-6 h-6 rotate-90" />
              </button>
            </div>

            <nav className="flex flex-col gap-8">
                <NavLink to="/" onClick={closeMenu}>İLANLAR</NavLink>
                {isAuthenticated ? (
                  <>
                    {role === 'Employer' && (
                      <>
                        <NavLink to="/employer/jobs" onClick={closeMenu}>İLANLARIM</NavLink>
                        <NavLink to="/employer/candidates" onClick={closeMenu}>ADAYLAR</NavLink>
                        <button onClick={() => { closeMenu(); navigate('/employer'); }} className="m-btn-primary !w-full !py-4">
                          YENİ İLAN
                        </button>
                      </>
                    )}
                    {role === 'JobSeeker' && (
                      <>
                        <NavLink to="/profile" onClick={closeMenu}>PROFİLİM</NavLink>
                        <NavLink to="/my-applications" onClick={closeMenu}>BAŞVURULARIM</NavLink>
                      </>
                    )}
                    <NavLink to="/notifications" onClick={closeMenu}>BİLDİRİMLER ({unreadCount})</NavLink>
                    
                    <div className="mt-auto pt-8 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/60">{fullName}</span>
                        <button 
                          onClick={async () => {
                            const ok = await confirm({
                                title: 'OTURUMU KAPAT?',
                                message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
                                confirmLabel: 'EVET, ÇIKIS YAP',
                                cancelLabel: 'VAZGEÇ'
                            });
                            if (ok) {
                              dispatch(logout());
                              closeMenu();
                            }
                          }} 
                          className="flex items-center gap-2 text-red-400 font-bold text-xs tracking-widest uppercase"
                        >
                          <LogOut className="w-4 h-4" /> ÇIKIŞ YAP
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4 mt-4">
                    <Link to="/login" onClick={closeMenu} className="m-btn-secondary !w-full text-center">GİRİŞ YAP</Link>
                    <Link to="/register" onClick={closeMenu} className="m-btn-primary !w-full text-center">KAYIT OL</Link>
                  </div>
                )}
            </nav>
          </div>
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

      <footer className="w-full bg-[#030305] border-t border-white/5 py-10 px-8 md:px-20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-20">
              <Briefcase className="w-4 h-4" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white">ELITE IT NETWORK ARCHITECTURE</span>
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white opacity-10 text-center">&copy; 2026 PRIMEIT INC. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <ErrorBoundary>
            <Router>
              <ToastContainer />
              <AppContent />
            </Router>
          </ErrorBoundary>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
