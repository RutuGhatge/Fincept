import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Loader2, AlertTriangle, TrendingDown, TrendingUp,
  Eye, ArrowLeft, RefreshCcw, ExternalLink, Shield,
  Zap, MapPin, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { portfolioService, geopoliticsService } from '../services/apiService';



const CONFLICT_COLORS: Record<string, string> = {
  'High':   'bg-red-100 text-red-700 border-red-200',
  'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
  'Low':    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const IMPACT_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'Negative': { bg: 'bg-red-50 border-red-100',    text: 'text-red-600',    icon: <TrendingDown className="w-5 h-5 text-red-500" /> },
  'Positive': { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
  'Watch':    { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600',  icon: <Eye className="w-5 h-5 text-amber-500" /> },
};

const GeopoliticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [geoNews, setGeoNews] = useState<any[]>([]);
  const [portfolioImpact, setPortfolioImpact] = useState<any[]>([]);
  const [reasoningPath, setReasoningPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPortfolio, setHasPortfolio] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('user_id') || '';
      let symbolsParam = '';

      if (userId) {
        try {
          const p = await portfolioService.getMyPortfolio(userId);
          if (p?.holdings?.length) {
            setHasPortfolio(true);
            symbolsParam = p.holdings.map((h: any) => h.symbol).join(',');
          }
        } catch (_) {}
      }

      const res = await geopoliticsService.getGeopolitics(symbolsParam);
      setGeoNews(res.geo_news ?? []);
      setPortfolioImpact(res.portfolio_impact ?? []);
      setReasoningPath(res.reasoning_path ?? []);
    } catch (e: any) {
      setError('Could not load geopolitical intelligence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1300px]">

        {/* Back */}
        <button
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 text-stripe-slate font-bold text-sm mb-10 hover:text-stripe-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Market Pulse
        </button>

        {/* Hero */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-bold mb-6"
          >
            <Globe className="w-4 h-4" /> Geopolitical Intelligence
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark tracking-tight mb-4"
          >
            World in Motion.<br /><span className="text-red-600">Your Money at Stake.</span>
          </motion.h1>
          <p className="text-xl text-stripe-slate font-medium max-w-2xl">
            Track top geopolitical events worldwide and instantly see how conflicts, trade wars, and diplomatic shifts are rippling through your portfolio.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative w-20 h-20">
              <Globe className="w-20 h-20 text-slate-100 absolute" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              </div>
            </div>
            <p className="text-stripe-slate font-black uppercase tracking-widest text-xs animate-pulse">
              Scanning global events & analyzing portfolio impact...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <p className="text-xl font-black text-stripe-dark mb-6">{error}</p>
            <button onClick={fetchData} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:scale-105 transition-all">
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* ── Agentic Reasoning Trace ── */}
            {reasoningPath.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stripe-dark text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Autonomous Agency Trace</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Multi-Agent Reasoning Chain</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {Array.isArray(reasoningPath) && reasoningPath.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 group">
                        <div className="flex flex-col items-center gap-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          {idx !== reasoningPath.length - 1 && <div className="w-0.5 h-6 bg-white/10" />}
                        </div>
                        <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Section 1: Global Geopolitical News ── */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-xl"><Globe className="w-5 h-5 text-red-600" /></div>
                    <h2 className="text-3xl font-black text-stripe-dark">Global Geopolitical Events</h2>
                  </div>
                  <p className="text-stripe-slate font-medium ml-14">Major conflicts, sanctions, trade disputes and diplomatic shifts happening right now.</p>
                </div>
                <button
                  onClick={fetchData}
                  className="p-3 bg-white border border-slate-200 rounded-2xl text-stripe-slate hover:bg-slate-50 transition-all group shadow-sm"
                >
                  <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(geoNews) && geoNews.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className={`text-xs font-black px-3 py-1 rounded-full border ${CONFLICT_COLORS[event.conflict_level] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {event.conflict_level} Tension
                      </span>
                      {event.source_url && event.source_url !== '#' && (
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-stripe-blue transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <h3 className="font-black text-stripe-dark text-base mb-3 leading-snug">{event.title}</h3>
                    <p className="text-sm text-stripe-slate font-medium leading-relaxed mb-4">{event.summary}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.region}</span>
                      {event.key_players?.length > 0 && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.key_players.slice(0, 2).join(' · ')}</span>
                      )}
                      <span className="ml-auto">{event.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
         </div>
            </section>

            {/* ── Section 2: Portfolio & Geopolitics Impact ── */}
            <section>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-stripe-purple/10 rounded-xl"><Shield className="w-5 h-5 text-stripe-purple" /></div>
                  <h2 className="text-3xl font-black text-stripe-dark">
                    {hasPortfolio ? 'Your Portfolio Under Geopolitical Lens' : 'Portfolio Geopolitical Exposure'}
                  </h2>
                </div>
                <p className="text-stripe-slate font-medium ml-14">
                  {hasPortfolio
                    ? 'How the current world events are directly or indirectly affecting your specific holdings.'
                    : 'Connect your portfolio to see exactly which geopolitical events are affecting your investments.'}
                </p>
              </div>

              {!hasPortfolio ? (
                <div className="bg-white rounded-[3rem] p-16 border border-slate-100 text-center shadow-sm">
                  <Globe className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-stripe-dark mb-3">Connect Your Portfolio</h3>
                  <p className="text-stripe-slate font-medium max-w-md mx-auto mb-8">
                    Upload or connect your holdings to see how Middle East conflicts, US-China trade wars, and other events are specifically impacting your investments.
                  </p>
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="px-10 py-4 bg-stripe-purple text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
                  >
                    Connect Portfolio
                  </button>
                </div>
              ) : portfolioImpact.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 border border-slate-100 text-center shadow-sm">
                  <Shield className="w-16 h-16 text-emerald-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-stripe-dark mb-3">Your Portfolio Looks Geopolitically Safe</h3>
                  <p className="text-stripe-slate font-medium max-w-md mx-auto">
                    Our analysis found no significant geopolitical risks directly linked to your current holdings.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Array.isArray(portfolioImpact) && portfolioImpact.map((item, i) => {
                    const cfg = IMPACT_COLORS[item.impact] ?? IMPACT_COLORS['Watch'];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`p-7 rounded-[2rem] border-2 ${cfg.bg} shadow-sm`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 bg-white/70 rounded-2xl border ${cfg.bg}`}>
                              {cfg.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-black text-stripe-dark text-lg">{item.symbol}</span>
                                <span className={`text-xs font-black px-3 py-1 rounded-full bg-white/80 ${cfg.text}`}>
                                  {item.impact}
                                </span>
                              </div>
                              <p className="text-sm text-stripe-slate font-medium">{item.holding_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-2xl">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-black text-slate-600">{item.geo_event}</span>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-stripe-dark leading-relaxed mb-3">
                          <strong>Why it matters:</strong> {item.impact_reason}
                        </p>

                        {item.action_hint && (
                          <div className="flex items-start gap-2 text-sm font-bold text-stripe-slate bg-white/60 rounded-xl p-3">
                            <Shield className="w-4 h-4 opacity-50 mt-0.5 shrink-0" />
                            <span><strong>Suggestion:</strong> {item.action_hint}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}

      </div>
    </div>
  );
};

export default GeopoliticsPage;
