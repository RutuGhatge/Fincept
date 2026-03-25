import React, { useState, useEffect } from 'react';
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
      </div>
    );
  }

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
                    {allocationData.map((_entry, index) => (
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
                ].map((item) => (
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
      </div>
    </div>
  );
};

export default MyPortfolioPage;
