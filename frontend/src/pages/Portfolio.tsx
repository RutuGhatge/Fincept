import React from 'react';
import { Briefcase, TrendingUp, Plus, Search, Filter } from 'lucide-react';

const assets = [
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 15, avgPrice: 175.20, currentPrice: 189.45, change: 8.1, type: 'Stock' },
  { symbol: 'BTC', name: 'Bitcoin', quantity: 0.25, avgPrice: 42000, currentPrice: 64200, change: 52.8, type: 'Crypto' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', quantity: 50, avgPrice: 395.10, currentPrice: 468.32, change: 18.5, type: 'ETF' },
  { symbol: 'ETH', name: 'Ethereum', quantity: 2.5, avgPrice: 2100, currentPrice: 3450, change: 64.3, type: 'Crypto' },
  { symbol: 'MSFT', name: 'Microsoft', quantity: 10, avgPrice: 310.50, currentPrice: 415.20, change: 33.7, type: 'Stock' },
];

const Portfolio = () => {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-stripe-dark tracking-tight">Your Portfolio</h1>
          <p className="text-stripe-slate mt-4 text-lg max-w-2xl">Manage and track your investment assets with institutional-grade tools.</p>
        </div>
        <div className="flex gap-4">
          <button className="stripe-button-secondary">
            <Filter size={18} />
            Filter
          </button>
          <button className="stripe-button-primary">
            <Plus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-stripe overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-stripe-dark">Asset List</h3>
          <div className="relative w-full md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search assets..."
              className="w-full bg-stripe-light border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-stripe-blue"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stripe-light bg-opacity-50 border-b border-gray-100">
                <th className="px-6 py-4 text-stripe-slate font-bold text-xs uppercase tracking-widest">Asset</th>
                <th className="px-6 py-4 text-stripe-slate font-bold text-xs uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-stripe-slate font-bold text-xs uppercase tracking-widest text-right">Quantity</th>
                <th className="px-6 py-4 text-stripe-slate font-bold text-xs uppercase tracking-widest text-right">Avg Price</th>
                <th className="px-6 py-4 text-stripe-slate font-bold text-xs uppercase tracking-widest text-right">Current Price</th>
                <th className="px-6 py-4 text-stripe-slate font-bold text-xs uppercase tracking-widest text-right">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-stripe-light transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-stripe-blue/10 flex items-center justify-center text-stripe-blue font-bold">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <p className="font-bold text-stripe-dark group-hover:text-stripe-blue transition-colors">{asset.symbol}</p>
                        <p className="text-stripe-slate text-xs">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 font-bold text-stripe-slate uppercase tracking-wider">
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-right font-medium">{asset.quantity}</td>
                  <td className="px-6 py-5 font-mono text-sm text-right text-stripe-slate">${asset.avgPrice.toLocaleString()}</td>
                  <td className="px-6 py-5 font-mono text-sm text-right font-bold text-stripe-dark">${asset.currentPrice.toLocaleString()}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 font-bold">
                      <span className={asset.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {asset.change >= 0 ? '+' : ''}{asset.change}%
                      </span>
                      <TrendingUp size={16} className={asset.change >= 0 ? 'text-green-500' : 'text-red-500'} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
