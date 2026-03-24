import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Globe, Link, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Products",
      links: [
        { label: "Portfolio Management", path: "/portfolio" },
        { label: "AI Insights", path: "/analysis" },
        { label: "Market Pulse", path: "/news" },
        { label: "Jargon Decoder", path: "/jargon" },
        { label: "Terminal", path: "/market-data" },
      ]
    },
    {
      title: "Solutions",
      links: [
        { label: "Retail", path: "/solutions/retail" },
        { label: "Enterprise", path: "/solutions/enterprise" },
        { label: "Family", path: "/solutions/family" },
      ]
    },
    {
      title: "Developers",
      links: [
        { label: "GitHub", path: "https://github.com", external: true },
        { label: "About this project", path: "/developer/about" },
        { label: "Documentation", path: "/developer/docs" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Pricing", path: "/pricing" },
        { label: "Privacy Policy", path: "/legal/privacy" },
        { label: "Terms of Service", path: "/legal/terms" },
        { label: "Cookies", path: "/legal/cookies" },
      ]
    }
  ];

  const handleNav = (link: any) => {
    if (link.external) {
      window.open(link.path, '_blank');
    } else {
      navigate(link.path);
    }
  };

  return (
    <>
      {/* Pre-footer Tagline Pulse */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-5xl md:text-9xl font-black text-white tracking-tighter"
            >
              Less hype, <span className="cool-gradient-text">more insight.</span>
            </motion.h2>
          </motion.div>
        </div>
      </section>

      <footer className="glass-nav border-t border-white/10 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-24">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 space-y-8">
              <h2 onClick={() => navigate('/')} className="text-4xl font-black text-white cursor-pointer tracking-tighter hover:scale-105 transition-transform">
                Fincept
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-[200px] font-medium">
                The most advanced financial intelligence platform for the modern investor. Connected. Smart. Human.
              </p>
              <div className="flex gap-6">
                <Mail className="w-6 h-6 text-white/40 hover:text-white cursor-pointer transition-colors" />
                <Globe className="w-6 h-6 text-white/40 hover:text-white cursor-pointer transition-colors" />
                <Link className="w-6 h-6 text-white/40 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-8">
                <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] opacity-50">
                  {section.title}
                </h4>
                <ul className="space-y-5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <button 
                        onClick={() => handleNav(link)}
                        className="text-white/60 hover:text-white text-[15px] font-bold transition-all hover:translate-x-1"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/40 text-sm font-bold">
              © 2024 Fincept. Registered in Hyderabad.
            </p>
            <div className="flex gap-8">
              <button onClick={() => navigate('/legal/privacy')} className="text-white/40 hover:text-white text-sm font-bold transition-colors">Privacy Policy</button>
              <button onClick={() => navigate('/legal/terms')} className="text-white/40 hover:text-white text-sm font-bold transition-colors">Terms of Service</button>
              <button onClick={() => navigate('/legal/cookies')} className="text-white/40 hover:text-white text-sm font-bold transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
