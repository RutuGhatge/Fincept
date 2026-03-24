import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4500 },
  { name: 'Fri', value: 6000 },
  { name: 'Sat', value: 5500 },
  { name: 'Sun', value: 7000 },
];

const StatCard = ({ title, value, change, isPositive }: any) => (
  <div className="glass-card flex flex-col gap-4 animate-glow">
    <div className="flex justify-between items-start">
      <div className="p-2.5 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-[0.05]">
        <DollarSign className="text-primary" size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-secondary' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {change}%
      </div>
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl tracking-tight">Investment Overview</h1>
          <p className="text-gray-400 mt-2 font-medium">Welcome back, Alex. Here's what's happening today.</p>
        </div>
        <button className="primary-button">
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Portfolio" value="$124,592.00" change="8.2" isPositive={true} />
        <StatCard title="Day Return" value="+$1,240.00" change="1.5" isPositive={true} />
        <StatCard title="Active Assets" value="24" change="2" isPositive={true} />
        <StatCard title="Market Sentiment" value="Bullish" change="5.4" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl">Performance Trend</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg bg-primary text-xs font-bold">1W</button>
              <button className="px-3 py-1 rounded-lg bg-white bg-opacity-[0.05] text-xs font-bold text-gray-400">1M</button>
              <button className="px-3 py-1 rounded-lg bg-white bg-opacity-[0.05] text-xs font-bold text-gray-400">1Y</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161821', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl mb-8">Asset Allocation</h3>
          <div className="space-y-6">
            {[
              { name: 'Stocks', value: 65, color: '#6366f1' },
              { name: 'Crypto', value: 20, color: '#10b981' },
              { name: 'Bonds', value: 10, color: '#f59e0b' },
              { name: 'Cash', value: 5, color: '#94a3b8' },
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.name}</span>
                  <span className="font-bold">{item.value}%</span>
                </div>
                <div className="h-2 bg-white bg-opacity-[0.05] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
