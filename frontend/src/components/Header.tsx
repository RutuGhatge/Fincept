import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShieldCheck, 
  Newspaper, 
  BookOpen, 
  Terminal as TerminalIcon,
  ChevronDown,
  Code,
  Info,
  Users,
  Building2,
  UserCircle
} from 'lucide-react';

const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const products = [
    { title: "Portfolio Management", icon: <BarChart3 className="w-5 h-5" />, path: "/portfolio" },
    { title: "AI Insights", icon: <ShieldCheck className="w-5 h-5" />, path: "/analysis" },
    { title: "Market Pulse", icon: <Newspaper className="w-5 h-5" />, path: "/news" },
    { title: "Jargon Decoder", icon: <BookOpen className="w-5 h-5" />, path: "/jargon" },
    { title: "Terminal", icon: <TerminalIcon className="w-5 h-5" />, path: "/market-data" },
  ];

  const solutions = [
    { title: "Retail", icon: <UserCircle className="w-5 h-5" />, path: "/solutions/retail" },
    { title: "Enterprise", icon: <Building2 className="w-5 h-5" />, path: "/solutions/enterprise" },
    { title: "Family", icon: <Users className="w-5 h-5" />, path: "/solutions/family" },
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass-nav py-3 shadow-2xl' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo - Increased Size */}
        <div 
          onClick={() => navigate('/')}
          className="text-4xl font-black text-white cursor-pointer tracking-tighter hover:scale-105 transition-transform"
        >
          Fincept
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {/* Products Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveMenu('products')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ${scrolled ? 'text-stripe-dark hover:text-stripe-blue' : 'text-white/90 hover:text-white'}`}>
              Products <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <AnimatePresence>
              {activeMenu === 'products' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-2xl p-4 border border-slate-100"
                >
                  <div className="space-y-1">
                    {products.map((p) => (
                      <button
                        key={p.title}
                        onClick={() => handleNav(p)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-stripe-blue/10 rounded-lg text-stripe-blue">
                          {p.icon}
                        </div>
                        <span className="font-semibold text-stripe-dark text-sm">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Solutions Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveMenu('solutions')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ${scrolled ? 'text-stripe-dark hover:text-stripe-blue' : 'text-white/90 hover:text-white'}`}>
              Solutions <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <AnimatePresence>
              {activeMenu === 'solutions' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-2xl p-4 border border-slate-100"
                >
                   <div className="space-y-1">
                    {solutions.map((s) => (
                      <button
                        key={s.title}
                        onClick={() => handleNav(s)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-stripe-purple/10 rounded-lg text-stripe-purple">
                          {s.icon}
                        </div>
                        <span className="font-semibold text-stripe-dark text-sm">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Developers Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveMenu('developers')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ${scrolled ? 'text-stripe-dark hover:text-stripe-blue' : 'text-white/90 hover:text-white'}`}>
              Developers <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <AnimatePresence>
              {activeMenu === 'developers' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-2xl p-4 border border-slate-100"
                >
                   <div className="space-y-1">
                    {developers.map((d) => (
                      <button
                        key={d.title}
                        onClick={() => handleNav(d)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                          {d.icon}
                        </div>
                        <span className="font-semibold text-stripe-dark text-sm">{d.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => navigate('/pricing')} className={`font-semibold transition-colors duration-200 ${scrolled ? 'text-stripe-dark hover:text-stripe-blue' : 'text-white/90 hover:text-white'}`}>Pricing</button>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/auth/signin')}
            className={`hidden sm:block text-[15px] font-bold transition-colors ${scrolled ? 'text-stripe-dark hover:text-stripe-blue' : 'text-white/90 hover:text-white'}`}
          >
            Sign in
          </button>
          <button 
            onClick={() => navigate('/products-overview')}
            className={`px-6 py-2.5 rounded-full font-bold text-[15px] transition-all shadow-lg active:scale-95 ${
              scrolled ? 'bg-stripe-blue text-white hover:bg-stripe-dark' : 'bg-white text-stripe-dark hover:bg-stripe-light'
            }`}
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
