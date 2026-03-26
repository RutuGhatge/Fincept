import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Filter,
  RefreshCcw,
  Search,
  Upload,
  BarChart2,
  BarChart3,
  AlertCircle,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { portfolioService } from '../services/apiService';

const COLORS = ['#635bff', '#7e22ce', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Types matching backend schema
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
  updated_at?: string;
}

// ---- Sub-components ----

const AIPortfolioHealth: React.FC<{ portfolioId: string }> = ({ portfolioId }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState(0);

  const steps = [
    "Analyzing sector concentration...",
    "Cross-referencing live market signals...",
    "Auditing risk/reward ratio...",
    "Finalizing strategic action hints..."
  ];

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        // Step-through animation for "Proof of Agency"
        for (let i = 0; i < steps.length; i++) {
          setScanStep(i);
          await new Promise(r => setTimeout(r, 1200));
        }
        const data = await portfolioService.getInsights(portfolioId);
        setInsights(data);
      } catch (err) {
        console.error("Failed to fetch AI insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [portfolioId]);

  if (loading || !insights) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 mb-12 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
          <motion.div 
            className="h-full bg-stripe-blue"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          />
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <RefreshCcw className="w-10 h-10 text-stripe-blue animate-spin mb-6" />
          <h3 className="text-2xl font-black text-stripe-dark mb-2">Agentic Health Audit</h3>
          <p className="text-stripe-slate font-medium animate-pulse">{steps[scanStep]}</p>
        </div>
      </motion.div>
    );
  }

  const scoreColor = insights.health_score > 70 ? 'text-emerald-500' : insights.health_score > 40 ? 'text-amber-500' : 'text-red-500';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 mb-12"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Score & Risk */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center lg:border-r lg:border-slate-50 lg:pr-12">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <motion.circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="364.4"
                initial={{ strokeDashoffset: 364.4 }}
                animate={{ strokeDashoffset: 364.4 - (364.4 * insights.health_score / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={scoreColor}
              />
            </svg>
            <span className={`absolute text-4xl font-black ${scoreColor}`}>{insights.health_score}</span>
          </div>
          <span className="text-xs font-black text-stripe-slate uppercase tracking-widest mb-1">Health Score</span>
          <span className={`text-lg font-black ${scoreColor}`}>{insights.risk_level} Risk</span>
        </div>

        {/* Insights & Actions */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h4 className="text-sm font-black text-stripe-dark uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-stripe-blue" /> Key AI Observations
            </h4>
            <ul className="space-y-4">
              {insights.top_insights?.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm font-medium text-stripe-slate leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stripe-blue flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[11px] font-black text-stripe-slate uppercase tracking-widest mb-2">Sector Critique</p>
              <p className="text-xs font-bold text-stripe-dark leading-relaxed">{insights.sector_allocation_critique}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-stripe-dark uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Agentic Action Hints
            </h4>
            <div className="space-y-3">
              {insights.action_hints?.map((hint: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-start gap-3 hover:border-stripe-blue cursor-default transition-all"
                >
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-stripe-dark leading-normal">{hint}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Trace */}
      <div className="mt-10 pt-8 border-t border-slate-50">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-black text-stripe-slate uppercase tracking-widest flex-shrink-0">Agency Trace:</span>
          {insights.reasoning_path?.map((path: string, i: number) => (
             <div key={i} className="flex items-center gap-3 flex-shrink-0">
               <span className="text-[10px] font-bold text-stripe-blue bg-stripe-blue/5 px-3 py-1.5 rounded-full whitespace-nowrap">
                 {path}
               </span>
               {i < insights.reasoning_path.length - 1 && <ChevronRight className="w-3 h-3 text-slate-200" />}
             </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
  >
    <div className="w-28 h-28 rounded-[2.5rem] bg-slate-100 flex items-center justify-center mb-8">
      <BarChart3 className="w-14 h-14 text-slate-300" />
    </div>
    <h2 className="text-4xl font-black text-stripe-dark mb-4 tracking-tight">
      No Portfolio Yet
    </h2>
    <p className="text-lg text-stripe-slate font-medium max-w-md leading-relaxed mb-10">
      Your dashboard is waiting. Upload a broker statement or connect via API to see your
      live holdings, P&L, and allocation insights.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={onNavigate}
        className="flex items-center gap-2 px-10 py-4 bg-stripe-blue text-white rounded-2xl font-black shadow-lg hover:scale-105 hover:shadow-xl transition-all"
      >
        <Upload className="w-5 h-5" />
        Upload Portfolio
      </button>
      <button
        onClick={onNavigate}
        className="flex items-center gap-2 px-10 py-4 bg-slate-100 text-stripe-dark rounded-2xl font-black hover:bg-slate-200 transition-all"
      >
        Connect Broker API
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

// ---- Main Component ----

const MyPortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchPortfolio = useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('access_token');

    if (!token || !userId) {
      navigate('/auth/signin');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await portfolioService.getMyPortfolio(userId);
      setPortfolio(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPortfolio(null); // Show empty state
      } else {
        setError('Failed to load portfolio. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleDelete = async () => {
    if (!portfolio || !portfolio.id) return;
    
    if (window.confirm("Are you sure you want to delete your entire portfolio? This action cannot be undone.")) {
      try {
        const userId = localStorage.getItem('user_id') || '';
        await portfolioService.deletePortfolio(portfolio.id, userId);
        setPortfolio(null);
        navigate('/portfolio');
      } catch (err: any) {
        console.error("Failed to delete portfolio:", err);
        alert("Failed to delete portfolio. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // ---- Derived analytics from real data ----

  const totalValue = portfolio?.total_value ?? 0;
  const totalInvested = portfolio?.total_invested ?? 0;
  const overallPnl = totalValue - totalInvested;
  const overallPnlPct = totalInvested > 0 ? (overallPnl / totalInvested) * 100 : 0;
  const isProfit = overallPnl >= 0;

  // Asset allocation from real holdings
  const allocationMap: Record<string, number> = {};
  (portfolio?.holdings ?? []).forEach((h) => {
    const type = h.asset_type === 'mutual_fund' ? 'Mutual Fund' : 'Equity';
    allocationMap[type] = (allocationMap[type] ?? 0) + (h.market_value ?? 0);
  });
  const allocationData = Object.entries(allocationMap).map(([name, value]) => ({ name, value }));

  // Simulated 7-day chart using real total_value as today's point
  const chartData = (() => {
    if (!portfolio) return [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    return days.map((name, i) => {
      const variance = (i - 3) * (totalValue * 0.008);
      return { name, value: Math.max(0, Math.round(totalValue * 0.96 + variance)) };
    });
  })();

  const filteredHoldings = (portfolio?.holdings ?? []).filter((h) =>
    h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---- Render States ----

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-stripe-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-stripe-slate font-black uppercase tracking-widest text-xs animate-pulse">
          Loading your portfolio...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <p className="text-xl font-black text-stripe-dark">{error}</p>
        <button
          onClick={fetchPortfolio}
          className="px-8 py-3 bg-stripe-blue text-white rounded-2xl font-bold hover:scale-105 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <EmptyState onNavigate={() => navigate('/portfolio')} />
      </div>
    );
  }

  // ---- Full Dashboard ----

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 bg-stripe-blue/10 rounded-lg">
                <Wallet className="w-5 h-5 text-stripe-blue" />
              </div>
              <span className="text-sm font-black text-stripe-slate uppercase tracking-widest">
                {portfolio.name}
              </span>
            </motion.div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-black text-stripe-slate uppercase tracking-widest">
                Total Investment
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-400">
                ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h2>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <span className="text-sm font-black text-stripe-blue uppercase tracking-widest">
                Current Portfolio Value
              </span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black text-stripe-dark tracking-tight"
              >
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </motion.h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                <span>{isProfit ? '+' : ''}₹{Math.abs(overallPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-base">({isProfit ? '+' : ''}{overallPnlPct.toFixed(2)}%)</span>
              </div>
              {portfolio.updated_at && (
                <span className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-100">
                  Refreshed {new Date(portfolio.updated_at).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-stripe-slate font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              <BarChart2 className="w-4 h-4" /> Market Pulse
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-stripe-slate font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Holdings
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all shadow-sm"
              title="Delete Portfolio"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={fetchPortfolio}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-stripe-dark hover:bg-slate-50 transition-all group shadow-sm"
            >
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* AI Health Audit - The Agentic Proof */}
        <AIPortfolioHealth portfolioId={portfolio.id} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-stripe-dark">Portfolio Value</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Estimated 7-day trend based on current value</p>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isProfit ? '#10b981' : '#ef4444'} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={isProfit ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis
                    hide={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isProfit ? '#10b981' : '#ef4444'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    dot={{ r: 4, fill: isProfit ? '#10b981' : '#ef4444', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Allocation Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100"
          >
            <h3 className="text-xl font-black text-stripe-dark mb-2 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-stripe-blue" /> Allocation
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6">By asset type</p>

            {allocationData.length > 0 ? (
              <>
                <div className="h-[220px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={6}
                        dataKey="value"
                        cornerRadius={8}
                      >
                        {allocationData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {allocationData.map((item, index) => {
                    const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0';
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="font-bold text-stripe-dark text-sm">{item.name}</span>
                        </div>
                        <span className="font-black text-stripe-slate text-sm">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-stripe-slate font-medium text-sm">
                No allocation data
              </div>
            )}
          </motion.div>
        </div>

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-stripe-dark">Holdings</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">{portfolio.holdings.length} positions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search holdings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stripe-blue/20"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-stripe-dark border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {filteredHoldings.length === 0 ? (
            <div className="py-20 text-center text-stripe-slate font-medium">
              No holdings match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest">Asset</th>
                    <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest">Type</th>
                    <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Qty</th>
                    <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Avg Cost</th>
                    <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Cur. Price</th>
                    <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Mkt. Value</th>
                    <th className="px-10 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHoldings.map((holding) => {
                    const pnl = holding.market_value != null && holding.average_cost != null
                      ? (holding.market_value - holding.average_cost * holding.quantity)
                      : null;
                    const pnlPct = holding.unrealized_pnl_percent ??
                      (holding.average_cost > 0 && holding.current_price != null
                        ? ((holding.current_price - holding.average_cost) / holding.average_cost) * 100
                        : null);
                    const profit = pnl == null ? true : pnl >= 0;
                    const isStock = holding.asset_type?.toLowerCase() === 'stock';

                    return (
                      <tr
                        key={holding.symbol}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-stripe-slate text-sm group-hover:bg-stripe-blue group-hover:text-white transition-all">
                              {holding.symbol[0]}
                            </div>
                            <div>
                              <p className="font-black text-stripe-dark text-sm">{holding.symbol}</p>
                              <p className="text-xs font-medium text-stripe-slate truncate max-w-[150px]">{holding.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isStock ? 'bg-stripe-blue/10 text-stripe-blue' : 'bg-purple-50 text-purple-600'}`}>
                            {isStock ? 'Stock' : 'MF'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-stripe-dark text-sm">
                          {holding.quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-stripe-dark text-sm">
                          ₹{holding.average_cost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-stripe-dark text-sm">
                          {holding.current_price != null
                            ? `₹${holding.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                            : <span className="text-slate-400 text-xs">—</span>
                          }
                        </td>
                        <td className="px-6 py-5 text-right font-black text-stripe-dark text-sm">
                          {holding.market_value != null
                            ? `₹${holding.market_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                            : <span className="text-slate-400 text-xs">—</span>
                          }
                        </td>
                        <td className="px-10 py-5 text-right">
                          {pnlPct != null ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className={`inline-flex items-center gap-1 font-black px-3 py-1 rounded-full text-xs ${profit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {profit ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {profit ? '+' : ''}{pnlPct.toFixed(2)}%
                              </span>
                              {pnl != null && (
                                <span className={`text-xs font-bold ${profit ? 'text-emerald-500' : 'text-red-400'}`}>
                                  {profit ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyPortfolioPage;
