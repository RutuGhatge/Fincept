import React, { useState, useEffect } from 'react';
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
      </div>
    );
  }

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
      </div>
    </div>
  );
};

export default MyPortfolioPage;
