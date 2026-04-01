import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Zap, Target, ArrowRight,
  PieChart, Loader2, Lock, ShieldCheck, BarChart3, AlertTriangle,
  CheckCircle2, Activity, FileText, Upload,
  RefreshCcw, Layers, Globe, Building2
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

// ---- Sector Inference ----
const SECTOR_KEYWORDS: Record<string, string[]> = {
  'Technology': ['tech', 'software', 'it', 'infosys', 'tcs', 'wipro', 'hcl', 'tech mahindra', 'mphasis', 'ltimindtree', 'oracle', 'persistent'],
  'Banking & Finance': ['bank', 'hdfc', 'icici', 'kotak', 'axis', 'sbi', 'finance', 'financial', 'nbfc', 'bajaj finserv', 'indusind'],
  'Pharma & Healthcare': ['pharma', 'health', 'med', 'sun pharma', 'dr reddy', 'cipla', 'divi', 'biocon', 'abbott'],
  'Consumer & FMCG': ['fmcg', 'consumer', 'hindustan unilever', 'hul', 'nestle', 'dabur', 'marico', 'tata consumer', 'britannia', 'colgate'],
  'Energy & Utilities': ['energy', 'oil', 'gas', 'reliance', 'ongc', 'power', 'ntpc', 'tata power', 'adani green', 'bpcl', 'iocl'],
  'Mutual Funds': ['fund', 'growth', 'direct', 'flex', 'cap', 'nifty', 'index', 'midcap', 'smallcap', 'quant', 'parag parikh'],
  'Infrastructure': ['infra', 'construction', 'larsen', 'l&t', 'cement', 'ultratech', 'acc', 'ambuja', 'dlf', 'godrej'],
  'Auto & EV': ['auto', 'motor', 'tata motors', 'maruti', 'mahindra', 'bajaj auto', 'hero', 'eicher', 'tvs'],
};

function inferSector(symbol: string, name: string): string {
  const text = (symbol + ' ' + name).toLowerCase();
  for (const [sector, kws] of Object.entries(SECTOR_KEYWORDS)) {
    if (kws.some(kw => text.includes(kw.toLowerCase()))) return sector;
  }
  return 'Diversified';
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

  // Sector exposure
  const sectorMap: Record<string, { value: number; invested: number; holdings: string[] }> = {};
  withPnl.forEach(h => {
    const sector = inferSector(h.symbol, h.name);
    if (!sectorMap[sector]) sectorMap[sector] = { value: 0, invested: 0, holdings: [] };
    sectorMap[sector].value += h.marketVal;
    sectorMap[sector].invested += h.invested;
    sectorMap[sector].holdings.push(h.symbol);
  });

  const sectorExposure = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      value: data.value,
      invested: data.invested,
      pnl: data.value - data.invested,
      pnlPct: data.invested > 0 ? ((data.value - data.invested) / data.invested) * 100 : 0,
      allocationPct: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      holdingCount: data.holdings.length,
      symbols: data.holdings,
    }))
    .sort((a, b) => b.allocationPct - a.allocationPct);

  return {
    withPnl, topPerformers, stopLosers, overallPnl, overallPnlPct, top3Weight,
    isConcentrated, equityPct, mfPct, diversificationScore, isDiversified,
    holdingsCount, losersCount, gainersCount, isBeatingMarket, sectorExposure
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
        <p className="font-black text-heading-light dark:text-heading-dark text-sm">{holding.symbol}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate max-w-[120px]">{holding.name}</p>
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background-light dark:bg-background-dark">
        <Loader2 className="w-12 h-12 text-stripe-purple animate-spin" />
        <p className="text-stripe-slate dark:text-text-dark font-black uppercase tracking-widest text-xs animate-pulse">Running analysis...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-background-light dark:bg-background-dark min-h-screen relative">
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/30 dark:bg-card-dark/50 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-light dark:bg-card-dark p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-border-dark text-center max-w-lg">
            <div className="w-20 h-20 bg-stripe-purple/10 rounded-3xl flex items-center justify-center text-stripe-purple mx-auto mb-8">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-heading-light dark:text-heading-dark mb-4">Insights Locked</h2>
            <p className="text-stripe-slate dark:text-text-dark font-medium mb-10 leading-relaxed">Sign in to unlock AI-powered analysis of your portfolio.</p>
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-heading-light dark:text-heading-dark mb-4 tracking-tight">
            AI Portfolio <br /><span className="text-stripe-purple">Insights.</span>
          </motion.h1>
          <p className="text-xl text-stripe-slate dark:text-text-dark font-medium">Real-time analysis based on your uploaded holdings.</p>
        </div>

        <AnimatePresence mode="wait">
          {!portfolio ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-20 bg-card-light dark:bg-card-dark rounded-[4rem] border border-slate-100 dark:border-border-dark text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Upload className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-3xl font-black text-heading-light dark:text-heading-dark mb-4">No Portfolio Linked</h3>
              <p className="text-lg text-stripe-slate dark:text-text-dark max-w-md mx-auto font-medium mb-10">
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
                  { label: 'Overall P&L', value: `${analysis!.overallPnl >= 0 ? '+' : ''}${analysis!.overallPnlPct.toFixed(2)}%`, icon: analysis!.overallPnl >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />, color: analysis!.overallPnl >= 0 ? 'bg-emerald-50 dark:bg-emerald-900' : 'bg-red-50 dark:bg-red-900' },
                  { label: 'Holdings', value: `${analysis!.holdingsCount} positions`, icon: <Layers className="w-5 h-5 text-stripe-purple" />, color: 'bg-stripe-purple/5 dark:bg-stripe-purple/20' },
                  { label: 'Smart Race', value: analysis!.isBeatingMarket ? 'Beating Market' : 'Trailing Market', icon: <Activity className="w-5 h-5 text-amber-500" />, color: analysis!.isBeatingMarket ? 'bg-emerald-50 dark:bg-emerald-900' : 'bg-amber-50 dark:bg-amber-900' },
                ].map((item) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${item.color} rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700`}>
                    <div className="flex items-center gap-2 mb-3">{item.icon}<span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</span></div>
                    <p className="text-xl font-black text-heading-light dark:text-heading-dark">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Top Performers + Stop Losers */}
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-border-dark">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="text-xl font-black text-heading-light dark:text-heading-dark">Top Performers</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis!.topPerformers.length > 0
                      ? analysis!.topPerformers.map((h, i) => <HoldingCard key={h.symbol} holding={h} rank={i + 1} isGainer={true} />)
                      : <p className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center py-4">No gainers yet</p>
                    }
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-border-dark">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-xl"><TrendingDown className="w-5 h-5 text-red-500" /></div>
                    <h3 className="text-xl font-black text-heading-light dark:text-heading-dark">Stop Losers</h3>
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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-border-dark">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stripe-blue/10 rounded-xl"><Activity className="w-5 h-5 text-stripe-blue" /></div>
                    <h3 className="text-xl font-black text-heading-light dark:text-heading-dark">Smart Race</h3>
                  </div>
                  <div className={`p-6 rounded-2xl mb-6 ${analysis!.isBeatingMarket ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800'}`}>
                    <p className={`text-3xl font-black mb-2 ${analysis!.isBeatingMarket ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {analysis!.isBeatingMarket ? '🚀 Beating Market' : '📉 Trailing Market'}
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Your portfolio return: <strong>{analysis!.overallPnlPct.toFixed(2)}%</strong> vs Nifty 50 benchmark: <strong>8%</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                      <p className="text-2xl font-black text-emerald-600">{analysis!.gainersCount}</p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">In Profit</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                      <p className="text-2xl font-black text-red-500">{analysis!.losersCount}</p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">In Loss</p>
                    </div>
                  </div>
                </motion.div>

                {/* Diversification */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-border-dark">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stripe-purple/10 rounded-xl"><PieChart className="w-5 h-5 text-stripe-purple" /></div>
                      <h3 className="text-xl font-black text-heading-light dark:text-heading-dark">Diversification</h3>
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
                          <span className="text-sm font-bold text-heading-light dark:text-heading-dark">{item.label}</span>
                          <span className="text-sm font-black text-stripe-slate dark:text-slate-400">{item.pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-border-dark">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-stripe-blue/10 rounded-xl"><Target className="w-5 h-5 text-stripe-blue" /></div>
                  <h3 className="text-2xl font-black text-heading-light dark:text-heading-dark">Why Your Portfolio Changed</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-black text-stripe-purple uppercase tracking-widest mb-3">Top Driver +</p>
                    <p className="font-black text-heading-light dark:text-heading-dark mb-2">{analysis!.topPerformers[0]?.symbol ?? 'N/A'}</p>
                    <p className="text-sm text-stripe-slate dark:text-slate-400">
                      {analysis!.topPerformers[0]
                        ? `Contributed the most to gains with ${analysis!.topPerformers[0].pnlPct.toFixed(1)}% return and ${analysis!.topPerformers[0].weight.toFixed(1)}% portfolio weight.`
                        : 'No strong gainer identified.'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-3">Top Drag −</p>
                    <p className="font-black text-heading-light dark:text-heading-dark mb-2">{analysis!.stopLosers.find(h => h.pnlPct < 0)?.symbol ?? 'None'}</p>
                    <p className="text-sm text-stripe-slate dark:text-slate-400">
                      {analysis!.stopLosers.find(h => h.pnlPct < 0)
                        ? `Dragging returns with ${analysis!.stopLosers.find(h => h.pnlPct < 0)!.pnlPct.toFixed(1)}% loss. Review exit strategy.`
                        : 'No positions in loss. Great portfolio health!'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Market Condition</p>
                    <p className="font-black text-heading-light dark:text-heading-dark mb-2">{analysis!.isBeatingMarket ? 'Outperforming' : 'Underperforming'}</p>
                    <p className="text-sm text-stripe-slate dark:text-slate-400">
                      {analysis!.isBeatingMarket
                        ? 'Your portfolio is ahead of the Nifty 50 benchmark. Strong selection alpha.'
                        : 'Portfolio is behind the Nifty 50. Consider rebalancing underperformers.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Sector Exposure Breakdown */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-border-dark">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-stripe-cyan/10 rounded-xl"><Building2 className="w-5 h-5 text-stripe-cyan" /></div>
                  <h3 className="text-2xl font-black text-heading-light dark:text-heading-dark">Sector Exposure Breakdown</h3>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-8 ml-14">Detailed allocation across sectors — where your money actually lives and how each sector performs.</p>

                {analysis!.sectorExposure.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">Could not auto-detect sectors. Ensure holdings have clear names.</p>
                ) : (
                  <div className="space-y-5">
                    {analysis!.sectorExposure.map((s, i) => {
                      return (
                        <div key={s.name} className={`p-6 rounded-2xl border ${
                          s.pnlPct >= 5 ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' :
                          s.pnlPct <= -5 ? 'bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-800' :
                          'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                        }`}>
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-base font-black text-heading-light dark:text-heading-dark">{s.name}</span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-600">{s.holdingCount} holding{s.holdingCount > 1 ? 's' : ''}</span>
                              </div>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{s.symbols.join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Allocation</p>
                                <p className="text-xl font-black text-heading-light dark:text-heading-dark">{s.allocationPct.toFixed(1)}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sector P&L</p>
                                <p className={`text-xl font-black ${s.pnlPct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{s.pnlPct >= 0 ? '+' : ''}{s.pnlPct.toFixed(2)}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Value</p>
                                <p className="text-xl font-black text-heading-light dark:text-heading-dark">₹{s.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                              </div>
                            </div>
                          </div>

                          {/* Bar */}
                          <div className="h-2 bg-white/80 dark:bg-slate-700/50 rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full transition-all ${s.pnlPct >= 5 ? 'bg-emerald-400' : s.pnlPct <= -5 ? 'bg-red-400' : 'bg-stripe-blue'}`}
                              style={{ width: `${Math.min(100, s.allocationPct)}%` }}
                            />
                          </div>

                          {/* Risk note */}
                          <div className="flex flex-wrap items-center gap-2">
                            {s.allocationPct > 40 && (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Concentration Risk</span>
                            )}
                            {s.pnlPct >= 10 && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Strong Performer</span>
                            )}
                            {s.pnlPct <= -10 && (
                              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Review Exit Strategy</span>
                            )}
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-auto">Invested: ₹{s.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Portfolio Underlying Sector Composition */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card-light dark:bg-card-dark rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-border-dark">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-stripe-purple/10 rounded-xl"><Globe className="w-5 h-5 text-stripe-purple" /></div>
                  <h3 className="text-2xl font-black text-heading-light dark:text-heading-dark">Underlying Sector Composition</h3>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-8 ml-14">
                  Your actual money in each sector — combining direct stocks <em>and</em> what your mutual funds invest in (Pharma, Finance, Tech, etc.).
                </p>

                {(() => {
                  const MF_SECTOR_ALLOC: Record<string, Record<string, number>> = {
                    'parag parikh': { 'Banking & Finance': 18, 'Technology': 22, 'Consumer & FMCG': 15, 'Energy': 10, 'Pharma & Healthcare': 8, 'Auto & EV': 7, 'Infrastructure': 5, 'Cash & Others': 15 },
                    'quant small cap': { 'Energy': 20, 'Banking & Finance': 16, 'Consumer & FMCG': 14, 'Infrastructure': 12, 'Technology': 10, 'Auto & EV': 8, 'Pharma & Healthcare': 7, 'Cash & Others': 13 },
                    'hdfc flexi': { 'Banking & Finance': 27, 'Technology': 18, 'Consumer & FMCG': 13, 'Energy': 11, 'Auto & EV': 9, 'Pharma & Healthcare': 8, 'Infrastructure': 6, 'Cash & Others': 8 },
                    'axis bluechip': { 'Banking & Finance': 30, 'Technology': 20, 'Consumer & FMCG': 14, 'Energy': 10, 'Auto & EV': 8, 'Pharma & Healthcare': 7, 'Cash & Others': 11 },
                  };

                  const SECTOR_COLORS: Record<string, string> = {
                    'Banking & Finance': 'bg-blue-500',
                    'Technology': 'bg-violet-500',
                    'Consumer & FMCG': 'bg-orange-400',
                    'Energy': 'bg-yellow-400',
                    'Pharma & Healthcare': 'bg-emerald-500',
                    'Auto & EV': 'bg-cyan-400',
                    'Infrastructure': 'bg-slate-400',
                    'Cash & Others': 'bg-pink-300',
                    'Diversified': 'bg-gray-300',
                  };

                  const holdings = portfolio!.holdings ?? [];
                  const totalVal = portfolio!.total_value ?? 0;
                  const masterSectors: Record<string, number> = {};

                  holdings.forEach(h => {
                    const nameL = (h.name ?? '').toLowerCase();
                    const hValue = h.market_value ?? (h.average_cost * h.quantity);
                    const isMF = h.asset_type === 'mutual_fund' || nameL.includes('fund') || nameL.includes('growth') || nameL.includes('cap') || nameL.includes('flexi') || nameL.includes('direct');

                    if (isMF) {
                      let matched = false;
                      for (const [key, alloc] of Object.entries(MF_SECTOR_ALLOC)) {
                        if (nameL.includes(key)) {
                          Object.entries(alloc).forEach(([sec, pct]) => {
                            masterSectors[sec] = (masterSectors[sec] ?? 0) + (hValue * pct / 100);
                          });
                          matched = true;
                          break;
                        }
                      }
                      if (!matched) {
                        const generic: Record<string, number> = { 'Banking & Finance': 25, 'Technology': 18, 'Consumer & FMCG': 14, 'Energy': 11, 'Pharma & Healthcare': 9, 'Auto & EV': 7, 'Cash & Others': 16 };
                        Object.entries(generic).forEach(([sec, pct]) => {
                          masterSectors[sec] = (masterSectors[sec] ?? 0) + (hValue * pct / 100);
                        });
                      }
                    } else {
                      const sec = inferSector(h.symbol ?? '', h.name ?? '');
                      masterSectors[sec] = (masterSectors[sec] ?? 0) + hValue;
                    }
                  });

                  const sorted = Object.entries(masterSectors)
                    .map(([name, val]) => ({ name, value: val, pct: totalVal > 0 ? (val / totalVal) * 100 : 0 }))
                    .sort((a, b) => b.pct - a.pct);

                  if (sorted.length === 0) return <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">Upload a portfolio to see composition.</p>;

                  return (
                    <>
                      {/* Top chips */}
                      <div className="flex flex-wrap gap-3 mb-8">
                        {sorted.slice(0, 4).map(s => (
                          <div key={s.name} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className={`w-2.5 h-2.5 rounded-full ${SECTOR_COLORS[s.name] ?? 'bg-slate-300'}`} />
                            <span className="text-sm font-black text-heading-light dark:text-heading-dark">{s.name}</span>
                            <span className="text-sm font-black text-stripe-blue">{s.pct.toFixed(1)}%</span>
                          </div>
                        ))}
                        {sorted.length > 4 && <div className="flex items-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"><span className="text-sm font-bold text-slate-400 dark:text-slate-500">+{sorted.length - 4} more</span></div>}
                      </div>

                      {/* Stacked visual bar */}
                      <div className="h-5 rounded-full overflow-hidden flex mb-8 shadow-inner">
                        {sorted.map(s => (
                          <div key={s.name} className={`${SECTOR_COLORS[s.name] ?? 'bg-slate-300'} h-full`} style={{ width: `${s.pct}%` }} title={`${s.name}: ${s.pct.toFixed(1)}%`} />
                        ))}
                      </div>

                      {/* Sector rows */}
                      <div className="space-y-4">
                        {sorted.map((s, i) => (
                          <div key={s.name} className="flex items-center gap-4">
                            <span className="w-5 text-xs font-black text-slate-300 dark:text-slate-600">#{i + 1}</span>
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${SECTOR_COLORS[s.name] ?? 'bg-slate-300'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-black text-heading-light dark:text-heading-dark">{s.name}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-black text-stripe-blue">{s.pct.toFixed(1)}%</span>
                                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-28 text-right">₹{s.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${SECTOR_COLORS[s.name] ?? 'bg-slate-300'}`} style={{ width: `${(s.pct / sorted[0].pct) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Concentration warning */}
                      {sorted[0]?.pct > 35 && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-amber-700 font-medium">
                            <strong>{sorted[0].pct.toFixed(0)}%</strong> of your portfolio is concentrated in <strong>{sorted[0].name}</strong>. 
                            Consider diversifying to reduce sector-specific risk.
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
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
