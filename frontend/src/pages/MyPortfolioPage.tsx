import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Briefcase,
  LayoutDashboard,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { portfolioService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const MyPortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        navigate('/auth/signin');
        return;
      }

      try {
        const portfolios = await portfolioService.getUserPortfolios(userId);
        if (portfolios && portfolios.length > 0) {
          const p = portfolios[0];
          setPortfolio(p);
          const perf = await portfolioService.trackPortfolio(p.id);
          setPerformance(perf);
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center gap-4 min-h-screen bg-white">
        <Loader2 className="w-12 h-12 text-stripe-purple animate-spin" />
        <p className="text-xl font-bold text-stripe-slate">Securing your vault...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="pt-40 min-h-screen bg-white container mx-auto px-6 text-center space-y-8">
        <div className="p-8 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 max-w-2xl mx-auto py-20">
          <Briefcase className="w-20 h-20 text-slate-300 mx-auto mb-8" />
          <h2 className="text-4xl font-black text-stripe-dark mb-4">No Portfolio Linked</h2>
          <p className="text-xl text-stripe-slate mb-12 max-w-lg mx-auto leading-relaxed">
            You haven't connected any investment accounts yet. Link your brokerage or upload manual data to begin.
          </p>
          <button 
            onClick={() => navigate('/portfolio')}
            className="px-12 py-5 bg-stripe-purple text-white rounded-2xl font-black text-xl hover:opacity-90 transition-all shadow-xl flex items-center gap-3 mx-auto"
          >
            Connect Now <ArrowRight className="w-6 h-6" />
          </button>
        </div>
=======
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
  ExternalLink
} from 'lucide-react';
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

// Mock data for initial UI
const performanceData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4500 },
  { name: 'Fri', value: 6000 },
  { name: 'Sat', value: 5500 },
  { name: 'Sun', value: 7000 },
];

const allocationData = [
  { name: 'Equity', value: 65 },
  { name: 'Debt', value: 20 },
  { name: 'Cash', value: 10 },
  { name: 'Commodities', value: 5 },
];

const COLORS = ['#635bff', '#7e22ce', '#3b82f6', '#10b981'];

const MyPortfolioPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-stripe-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-stripe-slate font-black uppercase tracking-widest text-xs animate-pulse">Syncing holdings...</p>
>>>>>>> 74309ae (feat: implement user profiles and personalized investment dashboard)
      </div>
    );
  }

<<<<<<< HEAD
  // Prepping chart data
  const allocationData = portfolio.holdings?.map((h: any) => ({
    name: h.symbol,
    value: h.quantity * (h.current_price || 100)
  })) || [];

  const totalValue = allocationData.reduce((acc: number, curr: any) => acc + curr.value, 0);

  return (
    <div className="pt-32 pb-24 bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-stripe-dark mb-6 tracking-tight">
              My <span className="text-stripe-purple">Portfolio.</span>
            </h1>
            <p className="text-2xl text-stripe-slate leading-relaxed font-medium">
              Real-time intelligence across all your holdings. Fincept multi-agent engine is currently monitoring {portfolio.holdings?.length || 0} assets.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex-1 min-w-[320px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-32 h-32" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Total Equity Value</p>
            <h3 className="text-5xl font-black text-stripe-dark mb-4">₹{totalValue.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <ArrowUpRight className="w-5 h-5" /> <span>+₹{performance?.total_gain?.toLocaleString() || "0.0"} (Today)</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-stripe-dark">Current Holdings</h3>
                <button className="p-3 bg-stripe-purple/10 text-stripe-purple rounded-xl hover:bg-stripe-purple hover:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {portfolio.holdings && portfolio.holdings.map((holding: any, idx: number) => (
                  <div key={idx} className="p-8 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-stripe-dark text-lg group-hover:bg-white group-hover:shadow-md transition-all">
                        {holding.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-stripe-dark">{holding.symbol}</h4>
                        <p className="text-sm text-stripe-slate font-medium">{holding.quantity} Shares • Avg ₹{holding.purchase_price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-stripe-dark">₹{(holding.quantity * (holding.current_price || 100)).toLocaleString()}</p>
                      <p className="text-sm font-bold text-emerald-500">+2.4%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stripe-dark p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-1/4">
                <ShieldCheck className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-6">AI Rebalancing Alert</h3>
                <p className="text-xl text-slate-400 mb-10 font-medium leading-relaxed max-w-2xl">
                  {performance?.rebalance_suggestion || "Your portfolio is currently aligned with your Growth risk profile. No immediate action required."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-10 py-4 bg-white text-stripe-dark rounded-2xl font-black text-lg hover:opacity-90 transition-all flex items-center gap-2">
                    Execute Optimization <Zap className="w-5 h-5 fill-stripe-dark" />
                  </button>
                  <button className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                    Full AI Audit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-stripe-dark mb-10 flex items-center gap-3">
                <PieChartIcon className="w-6 h-6 text-stripe-purple" /> Asset Mix
              </h3>
              <div className="h-[300px] mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {allocationData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {allocationData.slice(0, 4).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-bold text-stripe-slate">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-stripe-dark">{Math.round((item.value / totalValue) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-stripe-purple/5 rounded-[3.5rem] border-2 border-dashed border-stripe-purple/20 space-y-8">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-stripe-purple">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-stripe-dark mb-3">Portfolio Reports</h4>
                <p className="text-stripe-slate font-medium leading-relaxed">Download institutional-grade monthly audits in PDF format.</p>
              </div>
              <button className="w-full py-4 bg-white text-stripe-dark border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                Download Latest <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
=======
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
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
              <span className="text-sm font-black text-stripe-slate uppercase tracking-widest">Main Engine Portfolio</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-stripe-dark tracking-tight"
            >
              ₹14,52,840<span className="text-stripe-slate italic text-2xl md:text-4xl">.65</span>
            </motion.h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-1 text-emerald-600 font-black">
                <TrendingUp className="w-5 h-5" />
                <span>+ ₹82,410 (5.8%)</span>
              </div>
              <div className="text-stripe-slate font-medium text-sm">Real-time valuation</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-4 bg-white border border-slate-200 rounded-2xl text-stripe-dark hover:bg-slate-50 transition-all group shadow-sm">
              <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-stripe-dark text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Plus className="w-5 h-5" /> Add Asset
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-stripe-dark">Performance Engine</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['1W', '1M', '3M', '1Y', 'ALL'].map((p) => (
                  <button key={p} className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${p === '1W' ? 'bg-white text-stripe-blue shadow-sm' : 'text-stripe-slate hover:text-stripe-dark'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#635bff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#635bff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#635bff', fontWeight: 900 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#635bff" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Allocation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100"
          >
            <h3 className="text-xl font-black text-stripe-dark mb-8 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-stripe-purple" /> Asset Allocation
            </h3>
            <div className="h-[250px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={8}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {allocationData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="font-bold text-stripe-dark text-sm">{item.name}</span>
                  </div>
                  <span className="font-black text-stripe-slate text-sm">{item.value}%</span>
                </div>
              ))}
            </div>
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
            <h3 className="text-2xl font-black text-stripe-dark">Engine Constituents</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search holdings..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stripe-blue/20"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-stripe-dark border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest">Asset Name</th>
                  <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Shares</th>
                  <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Avg. Cost</th>
                  <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Mkt. Price</th>
                  <th className="px-6 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Mkt. Value</th>
                  <th className="px-10 py-6 text-xs font-black text-stripe-slate uppercase tracking-widest text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'HDFC Bank Ltd', symbol: 'HDFCBANK', qty: 120, avg: 1420.50, price: 1650.30, change: '+16.2%' },
                  { name: 'Reliance Industries', symbol: 'RELIANCE', qty: 45, avg: 2210.00, price: 2840.15, change: '+28.5%' },
                  { name: 'Infosys Ltd', symbol: 'INFY', qty: 85, avg: 1540.20, price: 1480.40, change: '-3.8%' },
                  { name: 'TATA Motors', symbol: 'TATAMOTORS', qty: 210, avg: 410.00, price: 924.50, change: '+125.4%' },
                  { name: 'SBI', symbol: 'SBIN', qty: 150, avg: 520.40, price: 785.20, change: '+50.8%' },
                ].map((item, i) => (
                  <tr key={item.symbol} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-stripe-blue group-hover:text-white transition-all">
                          {item.symbol[0]}
                        </div>
                        <div>
                          <p className="font-black text-stripe-dark">{item.name}</p>
                          <p className="text-xs font-bold text-stripe-slate">{item.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-bold text-stripe-dark">{item.qty}</td>
                    <td className="px-6 py-6 text-right font-bold text-stripe-dark">₹{item.avg.toLocaleString()}</td>
                    <td className="px-6 py-6 text-right font-bold text-stripe-dark">₹{item.price.toLocaleString()}</td>
                    <td className="px-6 py-6 text-right font-black text-stripe-dark">₹{(item.qty * item.price).toLocaleString()}</td>
                    <td className="px-10 py-6 text-right">
                      <span className={`inline-flex items-center gap-1 font-black px-3 py-1 rounded-full text-xs ${item.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {item.change} {item.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center">
            <button className="flex items-center gap-1 text-sm font-black text-stripe-blue hover:underline">
              View all 24 constituents <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
>>>>>>> 74309ae (feat: implement user profiles and personalized investment dashboard)
      </div>
    </div>
  );
};

export default MyPortfolioPage;
