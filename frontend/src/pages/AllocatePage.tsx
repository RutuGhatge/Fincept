import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Cpu, Zap, PieChart, ArrowRight, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/apiService';

const AllocatePage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [allocation, setAllocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState('100000');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const portfolios = await portfolioService.getUserPortfolios(userId);
        if (portfolios && portfolios.length > 0) {
          const firstPortfolio = portfolios[0];
          setPortfolio(firstPortfolio);
          
          // Automatically get default allocation for 1L budget
          const allocData = await portfolioService.allocateBudget(firstPortfolio.id, {
            budget: parseInt(budget),
            goal: "Growth",
            age: 30,
            profession: "Professional"
          });
          setAllocation(allocData);
        }
      } catch (err: any) {
        console.error("Error fetching allocation data:", err);
        setError("Failed to fetch allocation suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleGetAllocation = async () => {
    if (!portfolio) return;
    setLoading(true);
    setError('');
    try {
      const allocData = await portfolioService.allocateBudget(portfolio.id, {
        budget: parseInt(budget),
        goal: "Growth",
        age: 30,
        profession: "Professional"
      });
      setAllocation(allocData);
    } catch (err) {
      setError("Failed to update allocation suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-stripe-dark rounded-2xl w-fit mb-12 shadow-2xl"
          >
            <Settings2 className="w-12 h-12 text-emerald-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-stripe-dark mb-8 tracking-tighter"
          >
            Fincept <br />
            <span className="text-emerald-500">Allocate.</span>
          </motion.h1>
          
          <p className="text-2xl text-stripe-slate leading-relaxed mb-16 max-w-3xl font-medium">
            Smart, data-driven investment suggestions. Allocate your next capital efficiently by analyzing your linked portfolio holdings and risk profiles.
          </p>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center gap-4"
              >
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-xl font-bold text-stripe-slate">Analyzing allocation...</p>
              </motion.div>
            ) : !portfolio ? (
              <motion.div 
                key="no-portfolio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 text-center space-y-8"
              >
                <div className="p-6 bg-white rounded-3xl w-fit mx-auto shadow-sm">
                  <Lock className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-stripe-dark mb-4">Portfolio Required</h3>
                  <p className="text-xl text-stripe-slate max-w-xl mx-auto font-medium">
                    To provide accurate allocation suggestions, we first need to analyze your existing holdings.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/portfolio')}
                  className="px-10 py-5 bg-stripe-blue text-white rounded-2xl font-black text-xl hover:bg-stripe-slate transition-all shadow-xl flex items-center gap-3 mx-auto"
                >
                  Fetch Portfolio First <ArrowRight className="w-6 h-6" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-8">
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-black text-stripe-dark uppercase tracking-widest pl-2">Investment Budget (INR)</label>
                      <input 
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xl font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleGetAllocation}
                      className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-bold flex items-center gap-3">
                    <AlertCircle className="w-6 h-6" /> {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-emerald-500/5 space-y-6">
                    <div className="p-3 bg-stripe-dark rounded-xl w-fit">
                      <Cpu className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-3xl font-black text-stripe-dark">AI Optimization</h3>
                    <div className="space-y-4">
                      {allocation?.suggestions ? (
                        allocation.suggestions.map((s: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-stripe-dark">{s.asset_class}</span>
                            <span className="text-emerald-600 font-black">₹{s.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-lg text-stripe-slate leading-relaxed font-medium">
                          Our models suggest exactly where to deploy your next capital based on your current asset distribution.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-stripe-dark p-10 rounded-[3rem] text-white space-y-6 shadow-2xl">
                    <div className="p-3 bg-white/10 rounded-xl w-fit">
                      <Zap className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-3xl font-black">Risk Balancing</h3>
                    <p className="text-lg text-slate-400 leading-relaxed font-medium">
                      {allocation?.analysis?.risk_strategy || "Automatically identify sector overlaps and rebalance your portfolio with one click."}
                    </p>
                    {allocation?.analysis?.diversification_score && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Diversification Score</p>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${allocation.analysis.diversification_score * 10}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 p-12 bg-emerald-50 rounded-[4rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-10"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <PieChart className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-emerald-900 mb-2">Smart Suggestions</h4>
                <p className="text-emerald-700 font-medium">Personalized fund recommendations based on your unique financial goals and risk appetite.</p>
              </div>
            </div>
            <button className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-lg whitespace-nowrap">
              Action Plan
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AllocatePage;
