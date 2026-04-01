import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShieldCheck, 
  Newspaper, 
  BookOpen, 
  Terminal as AllocateIcon,
  ChevronDown,
  Code,
  Info,
  UserCircle,
  LogOut,
  User
} from 'lucide-react';
import { authService } from '../services/apiService';
import ThemeToggle from './ThemeToggle';


const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Run on mount
    fetchUser();

    // Re-run whenever auth state changes (after login/logout)
    window.addEventListener('auth-change', fetchUser);
    window.addEventListener('storage', fetchUser);
    return () => {
      window.removeEventListener('auth-change', fetchUser);
      window.removeEventListener('storage', fetchUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setUser(null);
    navigate('/');
  };

  const products = [
    { title: "Portfolio Management", icon: <BarChart3 className="w-5 h-5" />, path: "/portfolio" },
    { title: "AI Insights", icon: <ShieldCheck className="w-5 h-5" />, path: "/analysis" },
    { title: "Market Pulse", icon: <Newspaper className="w-5 h-5" />, path: "/news" },
    { title: "Jargon Decoder", icon: <BookOpen className="w-5 h-5" />, path: "/jargon" },
    { title: "Allocate", icon: <AllocateIcon className="w-5 h-5" />, path: "/allocate" },
  ];


  const developers = [
    { title: "GitHub", icon: <Code className="w-5 h-5" />, path: "https://github.com/RutuGhatge/Investment_Intelligence", external: true },
    { title: "About this project", icon: <Info className="w-5 h-5" />, path: "/developer/about" },
    { title: "Documentation", icon: <BookOpen className="w-5 h-5" />, path: "/developer/docs" },
  ];

  const handleNav = (item: any) => {
    if (item.external) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
    setActiveMenu(null);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-nav border-b border-slate-100 py-3 shadow-sm' : 'glass-nav py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div 
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-3xl font-black cursor-pointer tracking-tighter hover:opacity-80 transition-opacity cool-gradient-text"
        >
          Fincept.
        </div>


        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {/* Products Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveMenu('products')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1.5 font-bold nav-item">
              Products <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <AnimatePresence>
              {activeMenu === 'products' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 stripe-card p-4"
                >
                  <div className="space-y-1">
                    {products.map((p) => (
                      <button
                        key={p.title}
                        onClick={() => handleNav(p)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="p-2 bg-stripe-blue/10 rounded-lg text-stripe-blue">
                          {p.icon}
                        </div>
                        <span className="font-semibold text-heading-light dark:text-heading-dark text-sm">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          <div 
            className="relative group"
            onMouseEnter={() => setActiveMenu('developers')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1.5 font-bold nav-item">
              Developers <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <AnimatePresence>
              {activeMenu === 'developers' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 stripe-card p-4"
                >
                   <div className="space-y-1">
                    {developers.map((d) => (
                      <button
                        key={d.title}
                        onClick={() => handleNav(d)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                          {d.icon}
                        </div>
                        <span className="font-semibold text-heading-light dark:text-heading-dark text-sm">{d.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => navigate('/pricing')} className="font-bold nav-item">Pricing</button>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {user ? (
            <div 
              className="relative group"
              onMouseEnter={() => setActiveMenu('user')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button 
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-stripe-blue/10 flex items-center justify-center text-stripe-blue group-hover:bg-stripe-blue group-hover:text-white transition-all">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-black text-stripe-slate dark:text-slate-400 uppercase tracking-widest">Welcome</p>
                  <p className="text-sm font-black text-heading-light dark:text-heading-dark">@{user.name.split(' ')[0]}</p>
                </div>
              </button>

              <AnimatePresence>
                {activeMenu === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 stripe-card p-4"
                  >
                    <div className="space-y-1">
                      <button
                        onClick={() => navigate('/account')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <User className="w-5 h-5 text-stripe-blue" />
                        <span className="font-bold text-heading-light dark:text-heading-dark text-sm">Account Settings</span>
                      </button>
                      <button
                        onClick={() => navigate('/my-portfolio')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <BarChart3 className="w-5 h-5 text-stripe-purple" />
                        <span className="font-bold text-heading-light dark:text-heading-dark text-sm">My Portfolio</span>
                      </button>
                      <div className="h-[1px] bg-slate-100 dark:bg-slate-700 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left group"
                      >
                        <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-red-500" />
                        <span className="font-bold text-heading-light dark:text-heading-dark text-sm group-hover:text-red-600">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/auth/signin')}
                className="hidden sm:block text-[15px] font-black nav-item"
              >
                Sign in
              </button>
              <button 
                onClick={() => navigate('/products-overview')}
                className="px-8 py-2.5 rounded-full font-black text-[15px] bg-stripe-dark text-white hover:bg-stripe-slate transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
