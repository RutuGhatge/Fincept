import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 pb-12 px-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-stripe-blue/10 border border-slate-100 relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-stripe-blue/5 rounded-full blur-3xl" />
          
          <div 
            onClick={() => navigate('/')}
            className="text-3xl font-black text-stripe-blue cursor-pointer tracking-tighter mb-10 text-center"
          >
            Fincept
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-stripe-dark mb-4">Sign in with email</h1>
            <p className="text-stripe-slate font-medium">Authentication is coming soon. Enter your email to join the waitlist.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-stripe-dark uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stripe-blue/20 focus:border-stripe-blue transition-all font-medium"
                />
              </div>
            </div>

            <button 
              className="w-full py-4 bg-stripe-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-stripe-slate transition-all shadow-lg active:scale-[0.98]"
            >
              Get started <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 text-slate-300 py-4">
              <div className="h-[1px] flex-1 bg-current" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Security</span>
              <div className="h-[1px] flex-1 bg-current" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                  Your data is protected with bank-grade encryption.
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Lock className="w-5 h-5 text-slate-400 mt-0.5" />
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Authentication logic is strictly handled via secure protocols.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-12 text-slate-400 font-medium text-sm px-4">
          By continuing, you agree to Fincept's <br />
          <span className="text-stripe-dark font-bold underline cursor-pointer">Terms of Service</span> and <span className="text-stripe-dark font-bold underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
