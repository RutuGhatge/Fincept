import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Zap, Target, ArrowUpRight, ArrowRight,
  PieChart, Loader2, Lock, ShieldCheck, BarChart3, AlertTriangle,
  CheckCircle2, XCircle, Activity, FileText, ChevronRight, Upload,
  RefreshCcw, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/apiService';
import AuthModal from '../components/AuthModal';

// ---- Types ----
interface Holding {
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  average_cost: number;
  current_price: number | null;
  market_value: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_percent: number | null;
}
interface Portfolio {
  id: string;
  name: string;
  total_value: number;
  total_invested: number;
  holdings: Holding[];
}

// ---- Derived Analysis ----
function analyzePortfolio(portfolio: Portfolio) {
  const holdings = portfolio.holdings ?? [];
  const totalValue = portfolio.total_value ?? 0;
  const totalInvested = portfolio.total_invested ?? 0;
  const overallPnl = totalValue - totalInvested;
  const overallPnlPct = totalInvested > 0 ? (overallPnl / totalInvested) * 100 : 0;

  // Sort by P&L %
  const withPnl = holdings.map((h) => {
    const pnlPct = h.average_cost > 0 && h.current_price != null
      ? ((h.current_price - h.average_cost) / h.average_cost) * 100
      : 0;
    const invested = h.average_cost * h.quantity;
    const marketVal = h.market_value ?? invested;
    const weight = totalValue > 0 ? (marketVal / totalValue) * 100 : 0;
    return { ...h, pnlPct, invested, marketVal, weight };
  });
  withPnl.sort((a, b) => b.pnlPct - a.pnlPct);

  const topPerformers = withPnl.slice(0, 3);
  const stopLosers = [...withPnl].sort((a, b) => a.pnlPct - b.pnlPct).slice(0, 3);

  // Concentration Risk — top 3 positions % of portfolio
  const top3Weight = withPnl.slice(0, 3).reduce((s, h) => s + h.weight, 0);
  const isConcentrated = top3Weight > 60;

  // Asset type split
  const equityVal = withPnl.filter(h => h.asset_type?.toLowerCase() !== 'mutual_fund').reduce((s, h) => s + h.marketVal, 0);
  const mfVal = withPnl.filter(h => h.asset_type?.toLowerCase() === 'mutual_fund').reduce((s, h) => s + h.marketVal, 0);
  const equityPct = totalValue > 0 ? (equityVal / totalValue) * 100 : 0;
  const mfPct = totalValue > 0 ? (mfVal / totalValue) * 100 : 0;

  // Diversification score (0–100)
  const holdingsCount = holdings.length;
  const diversificationScore = Math.min(100, Math.round((holdingsCount / 15) * 60 + (isConcentrated ? 0 : 40)));
  const isDiversified = diversificationScore >= 60;

  // Losers count
  const losersCount = withPnl.filter(h => h.pnlPct < 0).length;
  const gainersCount = withPnl.filter(h => h.pnlPct >= 0).length;

  // Smart race vs market (simplified: if overall P&L > 8% → beating)
  const marketBenchmark = 8;
  const isBeatingMarket = overallPnlPct > marketBenchmark;

  return {
    withPnl, topPerformers, stopLosers, overallPnl, overallPnlPct, top3Weight,
    isConcentrated, equityPct, mfPct, diversificationScore, isDiversified,
    holdingsCount, losersCount, gainersCount, isBeatingMarket
  };
}

// ---- Sub components ----

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 70 ? 'text-emerald-600 bg-emerald-50' : score >= 40 ? 'text-amber-600 bg-amber-50' : 'text-red-500 bg-red-50';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Average' : 'Poor';
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${color}`}>
      {label} · {score}/100
    </span>
  );
};

const HoldingCard: React.FC<{ holding: any; rank: number; isGainer: boolean }> = ({ holding, rank, isGainer }) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl border ${isGainer ? 'bg-emerald-50/60 border-emerald-100' : 'bg-red-50/60 border-red-100'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${isGainer ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
        #{rank}
      </div>
      <div>
        <p className="font-black text-stripe-dark text-sm">{holding.symbol}</p>
        <p className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{holding.name}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`font-black text-sm ${isGainer ? 'text-emerald-600' : 'text-red-500'}`}>
        {isGainer ? '+' : ''}{holding.pnlPct.toFixed(2)}%
      </p>
      <p className="text-xs text-slate-400">₹{holding.marketVal?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
    </div>
  </div>
);

// ---- Main Page ----

const AIInsightPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const analysis = useMemo(() => portfolio ? analyzePortfolio(portfolio) : null, [portfolio]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);

    if (!token || !userId) {
      setLoading(false);
      setIsAuthModalOpen(true);
      return;
    }

    (async () => {
      try {
        const p = await portfolioService.getMyPortfolio(userId);
        if (p?.id) setPortfolio(p);
      } catch (err: any) {
        if (err.response?.status !== 404) console.error('AI Insights error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="w-12 h-12 text-stripe-purple animate-spin" />
        <p className="text-stripe-slate font-black uppercase tracking-widest text-xs animate-pulse">Running analysis...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen relative">
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/30 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center max-w-lg">
            <div className="w-20 h-20 bg-stripe-purple/10 rounded-3xl flex items-center justify-center text-stripe-purple mx-auto mb-8">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-stripe-dark mb-4">Insights Locked</h2>
            <p className="text-stripe-slate font-medium mb-10 leading-relaxed">Sign in to unlock AI-powered analysis of your portfolio.</p>
            <button onClick={() => navigate('/auth/signin')} className="w-full py-5 bg-stripe-purple text-white rounded-[2rem] font-black text-lg hover:scale-105 transition-all shadow-xl">
              Sign In to Unlock
            </button>
          </motion.div>
        </div>
      )}

      <div className={`container mx-auto px-6 lg:px-12 max-w-[1400px] ${!isAuthenticated ? 'opacity-30 pointer-events-none blur-sm' : ''}`}>

        {/* Header */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stripe-purple/10 text-stripe-purple text-sm font-bold mb-6">
            <Zap className="w-4 h-4" /> AI-Powered Portfolio Intelligence
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-stripe-dark mb-4 tracking-tight">
            AI Portfolio <br /><span className="text-stripe-purple">Insights.</span>
          </motion.h1>
          <p className="text-xl text-stripe-slate font-medium">Real-time analysis based on your uploaded holdings.</p>
        </div>

        <AnimatePresence mode="wait">
          {!portfolio ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-20 bg-white rounded-[4rem] border border-slate-100 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Upload className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-3xl font-black text-stripe-dark mb-4">No Portfolio Linked</h3>
              <p className="text-lg text-stripe-slate max-w-md mx-auto font-medium mb-10">
                Upload your broker statement to unlock AI analysis, top performers, risk audit, and more.
              </p>
              <button onClick={() => navigate('/portfolio')} className="px-12 py-5 bg-stripe-purple text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-3 mx-auto">
                Upload Portfolio <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

              {/* Overview Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Value', value: `₹${(portfolio.total_value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <BarChart3 className="w-5 h-5 text-stripe-blue" />, color: 'bg-stripe-blue/5' },
                  { label: 'Overall P&L', value: `${analysis!.overallPnl >= 0 ? '+' : ''}${analysis!.overallPnlPct.toFixed(2)}%`, icon: analysis!.overallPnl >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />, color: analysis!.overallPnl >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                  { label: 'Holdings', value: `${analysis!.holdingsCount} positions`, icon: <Layers className="w-5 h-5 text-stripe-purple" />, color: 'bg-stripe-purple/5' },
                  { label: 'Smart Race', value: analysis!.isBeatingMarket ? 'Beating Market' : 'Trailing Market', icon: <Activity className="w-5 h-5 text-amber-500" />, color: analysis!.isBeatingMarket ? 'bg-emerald-50' : 'bg-amber-50' },
                ].map((item) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${item.color} rounded-[2rem] p-6 border border-slate-100`}>
                    <div className="flex items-center gap-2 mb-3">{item.icon}<span className="text-xs font-black text-slate-400 uppercase tracking-wider">{item.label}</span></div>
                    <p className="text-xl font-black text-stripe-dark">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Top Performers + Stop Losers */}
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="text-xl font-black text-stripe-dark">Top Performers</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis!.topPerformers.length > 0
                      ? analysis!.topPerformers.map((h, i) => <HoldingCard key={h.symbol} holding={h} rank={i + 1} isGainer={true} />)
                      : <p className="text-slate-400 text-sm font-medium text-center py-4">No gainers yet</p>
                    }
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-xl"><TrendingDown className="w-5 h-5 text-red-500" /></div>
                    <h3 className="text-xl font-black text-stripe-dark">Stop Losers</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis!.stopLosers.filter(h => h.pnlPct < 0).length > 0
                      ? analysis!.stopLosers.filter(h => h.pnlPct < 0).map((h, i) => <HoldingCard key={h.symbol} holding={h} rank={i + 1} isGainer={false} />)
                      : <div className="flex flex-col items-center py-6 gap-2"><CheckCircle2 className="w-8 h-8 text-emerald-400" /><p className="text-emerald-600 font-bold text-sm">All positions in green!</p></div>
                    }
                  </div>
                </motion.div>
              </div>

              {/* Smart Race + Diversification */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Smart Race */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stripe-blue/10 rounded-xl"><Activity className="w-5 h-5 text-stripe-blue" /></div>
                    <h3 className="text-xl font-black text-stripe-dark">Smart Race</h3>
                  </div>
                  <div className={`p-6 rounded-2xl mb-6 ${analysis!.isBeatingMarket ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                    <p className={`text-3xl font-black mb-2 ${analysis!.isBeatingMarket ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {analysis!.isBeatingMarket ? '🚀 Beating Market' : '📉 Trailing Market'}
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                      Your portfolio return: <strong>{analysis!.overallPnlPct.toFixed(2)}%</strong> vs Nifty 50 benchmark: <strong>8%</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-2xl font-black text-emerald-600">{analysis!.gainersCount}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">In Profit</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-2xl font-black text-red-500">{analysis!.losersCount}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">In Loss</p>
                    </div>
                  </div>
                </motion.div>

                {/* Diversification */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stripe-purple/10 rounded-xl"><PieChart className="w-5 h-5 text-stripe-purple" /></div>
                      <h3 className="text-xl font-black text-stripe-dark">Diversification</h3>
                    </div>
                    <ScoreBadge score={analysis!.diversificationScore} />
                  </div>

                  <div className="space-y-4 mb-6">
                    {[
                      { label: 'Equity', pct: analysis!.equityPct, color: 'bg-stripe-blue' },
                      { label: 'Mutual Funds', pct: analysis!.mfPct, color: 'bg-stripe-purple' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-bold text-stripe-dark">{item.label}</span>
                          <span className="text-sm font-black text-stripe-slate">{item.pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis!.isConcentrated ? (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-700 font-medium">Top 3 positions hold <strong>{analysis!.top3Weight.toFixed(0)}%</strong> of your portfolio. Consider spreading risk across more assets.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-emerald-700 font-medium">Portfolio is well-distributed. Top 3 positions = {analysis!.top3Weight.toFixed(0)}% of total value.</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Why Portfolio Changed */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-stripe-blue/10 rounded-xl"><Target className="w-5 h-5 text-stripe-blue" /></div>
                  <h3 className="text-2xl font-black text-stripe-dark">Why Your Portfolio Changed</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-stripe-purple uppercase tracking-widest mb-3">Top Driver +</p>
                    <p className="font-black text-stripe-dark mb-2">{analysis!.topPerformers[0]?.symbol ?? 'N/A'}</p>
                    <p className="text-sm text-stripe-slate">
                      {analysis!.topPerformers[0]
                        ? `Contributed the most to gains with ${analysis!.topPerformers[0].pnlPct.toFixed(1)}% return and ${analysis!.topPerformers[0].weight.toFixed(1)}% portfolio weight.`
                        : 'No strong gainer identified.'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-3">Top Drag −</p>
                    <p className="font-black text-stripe-dark mb-2">{analysis!.stopLosers.find(h => h.pnlPct < 0)?.symbol ?? 'None'}</p>
                    <p className="text-sm text-stripe-slate">
                      {analysis!.stopLosers.find(h => h.pnlPct < 0)
                        ? `Dragging returns with ${analysis!.stopLosers.find(h => h.pnlPct < 0)!.pnlPct.toFixed(1)}% loss. Review exit strategy.`
                        : 'No positions in loss. Great portfolio health!'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Market Condition</p>
                    <p className="font-black text-stripe-dark mb-2">{analysis!.isBeatingMarket ? 'Outperforming' : 'Underperforming'}</p>
                    <p className="text-sm text-stripe-slate">
                      {analysis!.isBeatingMarket
                        ? 'Your portfolio is ahead of the Nifty 50 benchmark. Strong selection alpha.'
                        : 'Portfolio is behind the Nifty 50. Consider rebalancing underperformers.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Full Audit CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-stripe-dark rounded-[3rem] p-10 md:p-14 text-white overflow-hidden relative shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4">
                  <ShieldCheck className="w-96 h-96" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-bold mb-6">
                    <ShieldCheck className="w-4 h-4" /> Risk Intelligence Engine
                  </div>
                  <h3 className="text-4xl font-black mb-4">Full Portfolio Audit</h3>
                  <p className="text-xl text-slate-400 mb-10 max-w-2xl font-medium leading-relaxed">
                    Get a position-by-position breakdown of every holding — performance status, concentration risk, and actionable steps.
                    Download the complete report as PDF.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate('/analysis/audit', { state: { portfolio } })}
                      className="flex items-center gap-2 px-10 py-4 bg-white text-stripe-dark rounded-2xl font-black hover:scale-105 transition-all shadow-lg"
                    >
                      <FileText className="w-5 h-5" /> Open Full Audit
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
                    >
                      <RefreshCcw className="w-5 h-5" /> Refresh Analysis
                    </button>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} featureName="AI Portfolio Insights" />
    </div>
  );
};

export default AIInsightPage;
