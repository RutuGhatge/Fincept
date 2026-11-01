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
  Trash2
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

const EmptyState: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
  >
    <div className="w-28 h-28 rounded-[2.5rem] bg-slate-100 flex items-center justify-center mb-8">
      <BarChart3 className="w-14 h-14 text-slate-300" />
    </div>
    <h2 className="text-4xl font-black text-heading-light dark:text-heading-dark mb-4 tracking-tight">
      No Portfolio Yet
    </h2>
    <p className="text-lg text-stripe-slate dark:text-slate-400 font-medium max-w-md leading-relaxed mb-10">
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
        className="flex items-center gap-2 px-10 py-4 bg-slate-100 dark:bg-slate-800 text-heading-light dark:text-heading-dark rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefreshPrices = async () => {
    if (!portfolio?.id || refreshing) return;
    const userId = localStorage.getItem('user_id') || '';
    setRefreshing(true);
    try {
      const updated = await portfolioService.refreshPrices(portfolio.id, userId);
      setPortfolio(updated);
    } catch (err) {
      console.error('Failed to refresh prices:', err);
      // Fallback: just reload from DB
      await fetchPortfolio();
    } finally {
      setRefreshing(false);
    }
  };

  const handleForceRecalculate = async () => {
    console.log('Force recalculate clicked', { portfolioId: portfolio?.id, refreshing });
    if (!portfolio?.id || refreshing) return;
    const userId = localStorage.getItem('user_id') || '';
    console.log('Calling force recalculate with', { portfolioId: portfolio.id, userId });
    setRefreshing(true);
    try {
      const updated = await portfolioService.forceRecalculate(portfolio.id, userId);
      console.log('Force recalculate response:', updated);
      setPortfolio(updated);
    } catch (err) {
      console.error('Failed to force recalculate:', err);
      await fetchPortfolio();
    } finally {
      setRefreshing(false);
    }
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
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
        <p className="text-xl font-black text-heading-light dark:text-heading-dark">{error}</p>
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 pt-32">
        <EmptyState onNavigate={() => navigate('/portfolio')} />
      </div>
    );
  }

  // ---- Full Dashboard ----

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 pt-32 pb-24 px-6 lg:px-12">
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
              <h2 className="text-3xl md:text-4xl font-black text-slate-400 dark:text-slate-500">
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
                className="text-6xl md:text-8xl font-black text-heading-light dark:text-heading-dark tracking-tight"
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
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-card-light dark:bg-card-dark px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                  Refreshed {new Date(portfolio.updated_at).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 px-5 py-3 bg-card-light dark:bg-card-dark border border-slate-200 dark:border-slate-600 rounded-2xl text-stripe-slate dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <BarChart2 className="w-4 h-4" /> Market Pulse
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="flex items-center gap-2 px-5 py-3 bg-card-light dark:bg-card-dark border border-slate-200 dark:border-slate-600 rounded-2xl text-stripe-slate dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Holdings
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-card-light dark:bg-card-dark border border-red-200 dark:border-red-800 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
              title="Delete Portfolio"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleForceRecalculate}
              disabled={refreshing}
              className="p-3 bg-card-light dark:bg-card-dark border border-slate-200 dark:border-slate-600 rounded-2xl text-heading-light dark:text-heading-dark hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group shadow-sm disabled:opacity-50"
              title="Force recalculate from file prices"
            >
              <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin text-stripe-blue' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-card-light dark:bg-card-dark rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-heading-light dark:text-heading-dark">Portfolio Value</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Estimated 7-day trend based on current value</p>
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
            className="bg-card-light dark:bg-card-dark rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <h3 className="text-xl font-black text-heading-light dark:text-heading-dark mb-2 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-stripe-blue" /> Allocation
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-6">By asset type</p>

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
                          <span className="font-bold text-heading-light dark:text-heading-dark text-sm">{item.name}</span>
                        </div>
                        <span className="font-black text-stripe-slate dark:text-slate-400 text-sm">{pct}%</span>
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
          className="bg-card-light dark:bg-card-dark rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-10 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-heading-light dark:text-heading-dark">Holdings</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">{portfolio.holdings.length} positions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search holdings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stripe-blue/20"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-heading-light dark:text-heading-dark border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
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
