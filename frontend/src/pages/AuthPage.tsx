import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authService.login({ email, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_id', data.user_id);
      } else {
        const data = await authService.register({ name, email, password });
        // After register, automatically log them in or ask to sign in
        const loginData = await authService.login({ email, password });
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('user_id', loginData.user_id);
      }
      navigate('/portfolio');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-black text-stripe-dark mb-2">
              {isLogin ? 'Sign in' : 'Create Account'}
            </h1>
            <p className="text-stripe-slate font-medium text-sm">
              {isLogin ? 'Welcome back to your smart portfolio.' : 'Start analyzing your investments freely.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-stripe-dark uppercase tracking-widest pl-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stripe-blue/20 focus:border-stripe-blue transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-stripe-dark uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stripe-blue/20 focus:border-stripe-blue transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stripe-dark uppercase tracking-widest pl-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stripe-blue/20 focus:border-stripe-blue transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stripe-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-stripe-slate transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}{' '}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-stripe-blue hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-300 py-2">
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
            </div>
          </form>
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
