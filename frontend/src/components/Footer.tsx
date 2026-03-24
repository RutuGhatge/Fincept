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
      <section className="py-24 bg-white border-t border-slate-100 overflow-hidden">
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
              className="text-5xl md:text-8xl font-black text-stripe-blue tracking-tighter"
            >
              Less hype, <span className="stripe-gradient-text">more insight.</span>
            </motion.h2>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#f6f9fc] border-t border-slate-200 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-24">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 space-y-6">
              <h2 onClick={() => navigate('/')} className="text-3xl font-black text-stripe-blue cursor-pointer tracking-tighter">
                Fincept
              </h2>
              <p className="text-stripe-slate text-sm leading-relaxed max-w-[200px] font-medium">
                The most advanced financial intelligence platform for the modern investor. Connected. Smart. Human.
              </p>
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-stripe-slate hover:text-stripe-blue cursor-pointer" />
                <Globe className="w-5 h-5 text-stripe-slate hover:text-stripe-blue cursor-pointer" />
                <Link className="w-5 h-5 text-stripe-slate hover:text-stripe-blue cursor-pointer" />
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-6">
                <h4 className="font-black text-stripe-dark text-xs uppercase tracking-[0.2em]">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <button 
                        onClick={() => handleNav(link)}
                        className="text-stripe-slate hover:text-stripe-dark text-[15px] font-bold transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-stripe-slate text-sm font-bold">
              © 2024 Fincept. Registered in Hyderabad.
            </p>
            <div className="flex gap-8">
              <button onClick={() => navigate('/legal/privacy')} className="text-stripe-slate hover:text-stripe-dark text-sm font-bold">Privacy Policy</button>
              <button onClick={() => navigate('/legal/terms')} className="text-stripe-slate hover:text-stripe-dark text-sm font-bold">Terms of Service</button>
              <button onClick={() => navigate('/legal/cookies')} className="text-stripe-slate hover:text-stripe-dark text-sm font-bold">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
