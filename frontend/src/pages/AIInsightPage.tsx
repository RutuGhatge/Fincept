import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Target,
  ArrowUpRight,
  PieChart,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/apiService';

const AIInsightPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAIContent = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const portfolios = await portfolioService.getUserPortfolios(userId);
        if (portfolios && portfolios.length > 0) {
          const p = portfolios[0];
          setPortfolio(p);
          
          // Fetch performance and insights in parallel
          const [perfData, insightData] = await Promise.all([
            portfolioService.trackPortfolio(p.id),
            portfolioService.getInsights(p.id)
          ]);
          
          setPerformance(perfData);
          setInsights(insightData);
        }
      } catch (err) {
        console.error("Error fetching AI insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIContent();
  }, []);

  return (
    <div className="pt-32 pb-24 bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stripe-purple/10 text-stripe-purple text-sm font-bold mb-8"
          >
            <Zap className="w-4 h-4" /> AI-Powered Intelligent Analysis
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tight"
          >
            AI Portfolio <br />
            <span className="text-stripe-purple">Insights.</span>
          </motion.h1>
          <p className="text-2xl text-stripe-slate leading-relaxed">
            Gain the edge with our multi-agent AI. Once your data is connected, Fincept provides institutional-grade assessment and smart recommendations.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-40 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 text-stripe-purple animate-spin" />
              <p className="text-xl font-bold text-stripe-slate">Running multi-agent analysis...</p>
            </motion.div>
          ) : !portfolio ? (
            <motion.div 
              key="no-p"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-16 bg-white rounded-[4rem] border border-slate-100 text-center space-y-8 shadow-sm"
            >
              <div className="p-6 bg-slate-50 rounded-3xl w-fit mx-auto">
                <Lock className="w-12 h-12 text-slate-400" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-stripe-dark mb-4">Portfolio Link Required</h3>
                <p className="text-xl text-stripe-slate max-w-xl mx-auto font-medium">
                  Analysis occurs in real-time based on your holdings. Please connect or upload a portfolio first.
                </p>
              </div>
              <button 
                onClick={() => navigate('/portfolio')}
                className="px-10 py-5 bg-stripe-purple text-white rounded-2xl font-black text-xl hover:opacity-90 transition-all shadow-xl flex items-center gap-3 mx-auto"
              >
                Go to Portfolio <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Actual Content Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black text-stripe-dark">Performance Assessment</h3>
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                        {performance?.rating || "Active"}
                      </span>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <TrendingUp className="w-6 h-6 text-emerald-500" />
                          <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Calculated Yield</p>
                            <p className="text-2xl font-black text-stripe-dark">
                              {performance?.yield || "Analysing..."}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-500 font-bold flex items-center justify-end gap-1">
                            {performance?.trend || "+0.0%"} <ArrowUpRight className="w-4 h-4" />
                          </p>
                          <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Real-time status</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <PieChart className="w-6 h-6 text-stripe-blue" />
                          <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Diversification</p>
                            <p className="text-2xl font-black text-stripe-dark">
                              {performance?.status || "Balanced"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-stripe-blue font-bold">{portfolio.holdings?.length || 0} Assets</p>
                          <p className="text-xs text-slate-400 font-medium">Updated just now</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stripe-dark p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-1/4">
                      <ShieldCheck className="w-64 h-64" />
                    </div>
                    <h3 className="text-3xl font-black mb-6 relative z-10">Risk Intelligence</h3>
                    <p className="text-xl text-slate-400 mb-8 relative z-10 font-medium">
                      {insights?.risk_analysis || "Our AI is currently auditing your holdings for overlaps and volatility exposure."}
                    </p>
                    <button className="px-8 py-3 bg-white text-stripe-dark rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all relative z-10">
                      Full Risk Audit <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-full">
                    <h3 className="text-2xl font-black text-stripe-dark mb-10 flex items-center gap-3">
                      <Target className="w-6 h-6 text-stripe-purple" /> Smart Recs
                    </h3>
                    <div className="space-y-6">
                      {(insights?.recommendations || [
                        { title: "Hold Position", reason: "Markets showing high volatility", type: "Safety First" }
                      ]).map((rec: any, i: number) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-stripe-purple transition-all">
                          <p className="text-xs font-black text-stripe-purple uppercase tracking-widest mb-2">{rec.type || "AI Strategy"}</p>
                          <h4 className="text-lg font-black text-stripe-dark mb-2 group-hover:text-stripe-purple transition-colors">{rec.title}</h4>
                          <p className="text-sm text-stripe-slate leading-relaxed">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 text-center italic text-stripe-slate font-medium">
          Note: These insights are generated using your connected portfolio data. Active analysis is currently running.
        </div>
      </div>
    </div>
  );
};

export default AIInsightPage;
