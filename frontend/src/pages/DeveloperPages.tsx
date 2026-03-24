import React from 'react';
import { motion } from 'framer-motion';
import { Code, Info, FileText, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeveloperPageContainer: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => {
  const navigate = useNavigate();
  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stripe-slate font-bold mb-12 hover:text-stripe-dark group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to home
        </button>
        
        <div className="max-w-4xl">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 bg-slate-100 rounded-2xl">
              {icon}
            </div>
            <h1 className="text-5xl font-black text-stripe-dark tracking-tighter">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export const AboutProject: React.FC = () => (
  <DeveloperPageContainer title="About this Project" icon={<Info className="w-8 h-8 text-slate-600" />}>
    <div className="prose prose-xl text-stripe-slate font-medium space-y-8">
      <p>
        Fincept was born out of a simple frustration: financial tools are either too simple to be useful or too complex to be usable. 
        We wanted a platform that provides institutional-grade intelligence with a human-centric interface.
      </p>
      <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
        <h3 className="text-2xl font-black text-stripe-dark mb-4">Our Mission</h3>
        <p>To provide every investor—from retail to institutional—with the "Less hype, more insight" edge they need to succeed in the Indian markets.</p>
      </div>
      <p className="italic text-slate-400">Information to be updated progressively as the project evolves.</p>
    </div>
  </DeveloperPageContainer>
);

export const Documentation: React.FC = () => (
  <DeveloperPageContainer title="Documentation" icon={<FileText className="w-8 h-8 text-slate-600" />}>
    <div className="space-y-12">
      <p className="text-2xl text-stripe-slate font-medium">
        Complete guides and API references for building on top of the Fincept platform.
      </p>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          "Quickstart Guide",
          "API Authentication",
          "Market Pulse Feeds",
          "Portfolio Sync webhooks"
        ].map((item) => (
          <div key={item} className="p-8 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-stripe-blue transition-all cursor-pointer group">
            <span className="text-xl font-bold text-stripe-dark">{item}</span>
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-stripe-blue transition-colors" />
          </div>
        ))}
      </div>
    </div>
  </DeveloperPageContainer>
);
