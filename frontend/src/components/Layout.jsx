import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Scan, History, LogOut, X, Shield, Bell, User, PanelLeftClose, PanelLeft, Settings2, Layers, ChevronRight } from 'lucide-react';
import ThreeScene from './ThreeScene';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile) setSidebarOpen(true);
    const handleResize = () => {
      const m = window.innerWidth < 1024;
      setIsMobile(m);
      setSidebarOpen(!m);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Scanner', path: '/scanner', icon: Scan },
    { name: 'History', path: '/history', icon: History },
    { name: 'Batch Scan', path: '/batch-scan', icon: Layers },
    { name: 'Settings', path: '/settings', icon: Settings2 },
  ];

  const pageTitle = {
    '/': 'Dashboard',
    '/scanner': 'Scanner',
    '/history': 'History',
    '/batch-scan': 'Batch Scan',
    '/settings': 'Settings',
  };

  return (
    <div className="min-h-screen text-slate-100 flex overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020617]" />
        <ThreeScene />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-[#020617]/20 pointer-events-none" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: isMobile ? '-100%' : -72 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? '-100%' : -72 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed lg:relative z-50 w-64 h-screen flex flex-col shrink-0 glass-panel border-r border-white/[0.05]"
          >
            {/* Logo */}
            <div className="h-16 lg:h-18 flex items-center justify-between px-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500 blur-lg opacity-60 rounded-xl" />
                  <div className="relative bg-gradient-to-br from-violet-500 to-indigo-600 p-2 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">License</span>
                  <span className="text-base font-bold text-violet-400">Scanner</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive ? 'bg-white/[0.07] text-white shadow-[0_0_12px_rgba(139,92,246,0.06)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="navHighlight"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent border-l-[2.5px] border-violet-500"
                        />
                      )}
                      <item.icon className={`w-4.5 h-4.5 relative z-10 transition-all duration-200 ${isActive ? 'text-violet-400' : 'group-hover:text-violet-400'}`} />
                      <span className="text-sm font-medium relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navDot"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)] relative z-10"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-2.5 border-t border-white/[0.04]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group text-sm"
              >
                <LogOut className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/[0.04] glass-panel sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-all text-slate-400 hover:text-slate-200"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4.5 h-4.5" /> : <PanelLeft className="w-4.5 h-4.5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {location.pathname !== '/' && (
                <>
                  <NavLink to="/" className="text-slate-500 hover:text-slate-300 transition-colors">Home</NavLink>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </>
              )}
              <span className="text-slate-200 font-medium">{pageTitle[location.pathname] || 'Page'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="relative p-2 rounded-full hover:bg-white/[0.06] transition-colors group">
              <Bell className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-200" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
            </button>
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-[2px] shadow-[0_0_12px_rgba(139,92,246,0.2)]">
              <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scrollbar-hide">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
