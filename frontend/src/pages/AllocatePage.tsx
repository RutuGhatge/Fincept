import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Cpu, Zap, PieChart, ArrowRight, Lock, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/apiService';
import AuthModal from '../components/AuthModal';

const AllocatePage: React.FC = () => {
  const [budget, setBudget] = useState('50000');
  const [allocation, setAllocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (userId) {
        const portfolios = await portfolioService.getUserPortfolios(userId);
        if (portfolios && portfolios.length > 0) {
          const firstPortfolio = portfolios[0];
          setPortfolio(firstPortfolio);
          
          const allocData = await portfolioService.allocateBudget(firstPortfolio.id, {
            budget: parseInt(budget),
            goal: "Growth",
            age: 30,
            profession: "Professional"
          });
          setAllocation(allocData);
        }
      }
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
      setError("Failed to fetch initial allocation suggestions.");
    } finally {
      setLoading(false);
    }
  }, [budget]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleGetAllocation = async () => {
    if (!portfolio) return;
    setLoading(true);
    setError('');
    try {
      const data = await portfolioService.allocateBudget(portfolio.id, {
        budget: parseInt(budget),
        goal: "Growth",
        age: 30,
        profession: "Professional"
      });
      setAllocation(data);
    } catch (err: any) {
      console.error("Allocation failed:", err);
      setError("Failed to generate allocation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-[#f8fafc] min-h-screen relative">
      {/* Auth Gating Overlay */}
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/10 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center max-w-lg"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-8">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-stripe-dark mb-4">Allocate is Locked</h2>
            <p className="text-stripe-slate font-medium mb-10 leading-relaxed">
              To provide personalized fund suggestions, our AI needs access to your risk profile. Sign in to unlock this feature.
            </p>
            <button 
              onClick={() => navigate('/auth/signin')}
              className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-stripe-dark hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <LogIn className="w-6 h-6" /> Sign In to Unlock
            </button>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className={`container mx-auto px-6 ${!isAuthenticated ? 'grayscale opacity-40 blur-sm pointer-events-none' : ''}`}>
        <div className="max-w-4xl mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-8"
          >
            <Cpu className="w-4 h-4" /> Multi-Agent Allocation Engine
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-8xl font-black text-stripe-dark mb-8 tracking-tighter"
          >
            Smart <br />
            <span className="text-emerald-500">Allocate.</span>
          </motion.h1>
          <p className="text-2xl text-stripe-slate leading-relaxed font-medium">
            Enter your investable surplus and let our AI agents distribute it across the most optimal funds based on your current portfolio architecture.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-10 bg-white rounded-[3.5rem] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-stripe-dark mb-8 flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-emerald-500" /> Parameters
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Amount to Invest (₹)</label>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Risk Profile</label>
                  <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold outline-none">
                    <option>Aggressive Growth</option>
                    <option>Balanced</option>
                    <option>Conservative</option>
                  </select>
                </div>

                <button 
                  onClick={handleGetAllocation}
                  disabled={loading || !portfolio}
                  className="w-full py-5 bg-stripe-dark text-white rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white" />}
                  Run AI Optimizer
                </button>
              </div>
            </div>

            {!portfolio && isAuthenticated && (
              <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-3 text-red-600 font-black">
                  <AlertCircle className="w-6 h-6" /> Portfolio Missing
                </div>
                <p className="text-red-700/70 font-medium text-sm leading-relaxed">
                  We need to see your current holdings to avoid overlap and optimize tax-efficiency.
                </p>
                <button 
                  onClick={() => navigate('/portfolio')}
                  className="w-full py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all"
                >
                  Connect Portfolio First
                </button>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 rounded-[4rem] space-y-4"
                >
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-xl font-bold text-stripe-slate">Agents are negotiating fund splits...</p>
                </motion.div>
              ) : allocation ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {allocation.suggestions?.map((item: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                            <PieChart className="w-6 h-6 text-emerald-500" />
                          </div>
                          <span className="text-3xl font-black text-stripe-dark">₹{item.amount.toLocaleString()}</span>
                        </div>
                        <h4 className="text-xl font-black text-stripe-dark mb-2">{item.fund_name}</h4>
                        <p className="text-stripe-slate font-medium text-sm mb-6 leading-relaxed">
                          {item.reason}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                          <button className="text-emerald-500 font-bold flex items-center gap-2 text-sm">
                            Invest <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {allocation.rationale && (
                    <div className="p-10 bg-stripe-dark text-white rounded-[4rem] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-1/4">
                        <Cpu className="w-64 h-64" />
                      </div>
                      <h3 className="text-2xl font-black mb-6 relative z-10">Strategy Rationale</h3>
                      <p className="text-xl text-slate-400 leading-relaxed font-medium relative z-10">
                        {allocation.rationale}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 rounded-[4rem] space-y-6 text-center px-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <Zap className="w-10 h-10 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-300">Ready for Optimization</h3>
                    <p className="text-stripe-slate font-medium max-w-sm mx-auto">
                      Adjust your investment budget and click run to see where your money should go.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        featureName="AI Budget Allocation"
      />
    </div>
  );
};

export default AllocatePage;
