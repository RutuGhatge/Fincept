import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, XCircle, FileText, ShieldCheck
} from 'lucide-react';

interface Holding {
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  average_cost: number;
  current_price: number | null;
  market_value: number | null;
  unrealized_pnl_percent: number | null;
}

interface Portfolio {
  id: string;
  name: string;
  total_value: number;
  total_invested: number;
  holdings: Holding[];
}

const getStatus = (pnlPct: number) => {
  if (pnlPct >= 20) return { label: 'Strong Buy Zone', color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> };
  if (pnlPct >= 5) return { label: 'Hold — Performing', color: 'text-sky-600 bg-sky-50', icon: <CheckCircle2 className="w-4 h-4 text-sky-500" /> };
  if (pnlPct >= 0) return { label: 'Flat — Monitor', color: 'text-amber-600 bg-amber-50', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> };
  if (pnlPct >= -10) return { label: 'Under Watch', color: 'text-orange-600 bg-orange-50', icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> };
  return { label: 'Consider Exit', color: 'text-red-600 bg-red-50', icon: <XCircle className="w-4 h-4 text-red-500" /> };
};

const getAction = (pnlPct: number, symbol: string): string => {
  if (pnlPct >= 20) return `${symbol} is showing strong momentum. Consider adding more on dips.`;
  if (pnlPct >= 5) return `${symbol} is performing steadily. Hold and let compounding work.`;
  if (pnlPct >= 0) return `${symbol} is flat. Keep monitoring and set a stop loss.`;
  if (pnlPct >= -10) return `${symbol} has declined mildly. Assess fundamentals before averaging.`;
  return `${symbol} is in significant loss. Review allocation and consider partial exit.`;
};

const PortfolioAuditPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const portfolio: Portfolio | null = (location.state as any)?.portfolio ?? null;

  const handleDownload = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Fincept Portfolio Audit — ${portfolio?.name ?? 'Report'}</title>
          <style>
            * { font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; }
            body { margin: 0; padding: 32px; color: #0f172a; background: white; font-size: 13px; }
            h1 { font-size: 28px; font-weight: 900; color: #635bff; margin-bottom: 4px; }
            .meta { color: #64748b; margin-bottom: 32px; font-size: 12px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
            .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
            .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
            .stat-value { font-size: 18px; font-weight: 900; color: #0f172a; }
            .section-title { font-size: 16px; font-weight: 900; margin: 24px 0 12px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f8fafc; font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; text-align: left; padding: 10px 12px; }
            td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: top; }
            .symbol { font-weight: 900; color: #0f172a; }
            .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
            .green { color: #059669; background: #ecfdf5; }
            .amber { color: #d97706; background: #fffbeb; }
            .red { color: #dc2626; background: #fef2f2; }
            .action { color: #475569; max-width: 220px; line-height: 1.4; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 800);
  };

  if (!portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-stripe-slate font-bold">No portfolio data. Please go back and open Full Audit again.</p>
        <button onClick={() => navigate('/analysis')} className="px-6 py-3 bg-stripe-blue text-white rounded-2xl font-bold">Back to Insights</button>
      </div>
    );
  }

  const holdings = portfolio.holdings ?? [];
  const totalValue = portfolio.total_value ?? 0;
  const totalInvested = portfolio.total_invested ?? 0;

  const enriched = holdings.map(h => {
    const pnlPct = h.average_cost > 0 && h.current_price
      ? ((h.current_price - h.average_cost) / h.average_cost) * 100
      : 0;
    const marketVal = h.market_value ?? (h.average_cost * h.quantity);
    const invested = h.average_cost * h.quantity;
    const weight = totalValue > 0 ? (marketVal / totalValue) * 100 : 0;
    const status = getStatus(pnlPct);
    return { ...h, pnlPct, marketVal, invested, weight, status };
  }).sort((a, b) => b.pnlPct - a.pnlPct);

  const overallPnl = totalValue - totalInvested;
  const overallPct = totalInvested > 0 ? ((overallPnl / totalInvested) * 100) : 0;

  // Hidden printable content
  const PrintableContent = () => (
    <div ref={printRef} style={{ display: 'none' }}>
      <h1>Fincept — Portfolio Full Audit</h1>
      <p className="meta">Portfolio: {portfolio.name} | Generated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>

      <div className="summary">
        <div className="stat"><div className="stat-label">Total Value</div><div className="stat-value">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div></div>
        <div className="stat"><div className="stat-label">Total Invested</div><div className="stat-value">₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div></div>
        <div className="stat"><div className="stat-label">Overall P&L</div><div className="stat-value" style={{ color: overallPnl >= 0 ? '#059669' : '#dc2626' }}>{overallPnl >= 0 ? '+' : ''}₹{Math.abs(overallPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div></div>
        <div className="stat"><div className="stat-label">Overall Return</div><div className="stat-value" style={{ color: overallPct >= 0 ? '#059669' : '#dc2626' }}>{overallPct >= 0 ? '+' : ''}{overallPct.toFixed(2)}%</div></div>
      </div>

      <div className="section-title">Holdings Analysis ({enriched.length} positions)</div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Symbol</th><th>Type</th><th>Qty</th><th>Avg Cost</th><th>Cur. Price</th><th>Mkt. Value</th><th>Weight</th><th>P&L %</th><th>Status</th><th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {enriched.map((h, i) => (
            <tr key={h.symbol}>
              <td>{i + 1}</td>
              <td><span className="symbol">{h.symbol}</span><br /><small style={{ color: '#94a3b8' }}>{h.name.slice(0, 25)}</small></td>
              <td>{h.asset_type === 'mutual_fund' ? 'MF' : 'Equity'}</td>
              <td>{h.quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
              <td>₹{h.average_cost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td>{h.current_price ? `₹${h.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}</td>
              <td>₹{h.marketVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
              <td>{h.weight.toFixed(1)}%</td>
              <td style={{ color: h.pnlPct >= 0 ? '#059669' : '#dc2626', fontWeight: 900 }}>{h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%</td>
              <td><span className={`status-badge ${h.pnlPct >= 5 ? 'green' : h.pnlPct >= 0 ? 'amber' : 'red'}`}>{h.status.label}</span></td>
              <td className="action">{getAction(h.pnlPct, h.symbol)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="footer">
        This report is generated by Fincept AI. It is for informational purposes only and does not constitute financial advice. Always consult a registered financial advisor before making investment decisions.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6 lg:px-12">
      <PrintableContent />
      <div className="max-w-[1400px] mx-auto">

        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button onClick={() => navigate('/analysis')} className="flex items-center gap-2 text-stripe-slate font-bold hover:text-stripe-blue transition-colors mb-4 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to AI Insights
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stripe-blue/10 rounded-xl"><ShieldCheck className="w-6 h-6 text-stripe-blue" /></div>
              <div>
                <h1 className="text-3xl font-black text-stripe-dark">Full Portfolio Audit</h1>
                <p className="text-stripe-slate font-medium text-sm">{portfolio.name} · {enriched.length} positions analysed</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-8 py-4 bg-stripe-dark text-white rounded-2xl font-black shadow-lg hover:scale-105 hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" /> Download PDF Report
          </button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Value', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: portfolio.name },
            { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Cost basis' },
            { label: 'Overall P&L', value: `${overallPnl >= 0 ? '+' : ''}₹${Math.abs(overallPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `${overallPct.toFixed(2)}% return`, color: overallPnl >= 0 ? 'text-emerald-600' : 'text-red-500' },
            { label: 'Positions', value: `${enriched.length}`, sub: `${enriched.filter(h => h.pnlPct >= 0).length} in profit · ${enriched.filter(h => h.pnlPct < 0).length} in loss` },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
              <p className={`text-2xl font-black ${(item as any).color ?? 'text-stripe-dark'}`}>{item.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Holdings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h2 className="text-xl font-black text-stripe-dark flex items-center gap-2">
              <FileText className="w-5 h-5 text-stripe-blue" /> Position-by-Position Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Holding</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Avg Cost</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cur. Price</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Mkt. Value</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Weight</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">P&L %</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enriched.map((h, i) => (
                  <tr key={h.symbol} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-black text-slate-300">{i + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-stripe-blue group-hover:text-white transition-all">
                          {h.symbol[0]}
                        </div>
                        <div>
                          <p className="font-black text-stripe-dark text-sm">{h.symbol}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[140px]">{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${h.asset_type === 'mutual_fund' ? 'bg-purple-50 text-purple-600' : 'bg-stripe-blue/10 text-stripe-blue'}`}>
                        {h.asset_type === 'mutual_fund' ? 'MF' : 'Equity'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-stripe-dark text-sm">
                      {h.quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-stripe-dark text-sm">
                      ₹{h.average_cost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-stripe-dark text-sm">
                      {h.current_price ? `₹${h.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-stripe-dark text-sm">
                      ₹{h.marketVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-black text-stripe-dark text-sm">{h.weight.toFixed(1)}%</span>
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stripe-blue rounded-full" style={{ width: `${Math.min(h.weight, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`inline-flex items-center gap-1 font-black text-sm ${h.pnlPct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {h.pnlPct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${h.status.color}`}>
                          {h.status.icon} {h.status.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">{getAction(h.pnlPct, h.symbol)}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-50">
            <p className="text-xs text-slate-400 italic">
              ⚠️ This report is AI-generated for informational purposes only and does not constitute financial advice. Consult a registered financial advisor before investment decisions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioAuditPage;
