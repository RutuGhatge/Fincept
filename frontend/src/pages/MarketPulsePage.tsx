import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, ExternalLink, Loader2,
  Newspaper, ChevronDown, ChevronUp, RefreshCcw, Wallet,
  Zap, Info, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { newsService, portfolioService } from '../services/apiService';
import AuthModal from '../components/AuthModal';

// ---- Helpers ----
function getImpact(item: any, symbols: string[]): 'positive' | 'negative' | 'none' {
  const text = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.full_content || '')).toLowerCase();
  const isRelated = symbols.some(s => text.includes(s.toLowerCase()));
  if (!isRelated && item.category !== 'Portfolio Alert') return 'none';
  
  const s = (item.sentiment || '').toLowerCase();
  if (s === 'positive' || text.match(/\b(rise|gain|rally|surge|profit|up|high|growth|record|beat)\b/)) return 'positive';
  if (s === 'negative' || text.match(/\b(fall|drop|crash|loss|down|low|miss|cut|risk|concern)\b/)) return 'negative';
  return 'positive'; 
}

function isRelatedToPortfolio(item: any, symbols: string[]): boolean {
  if (item.category === 'Portfolio Alert') return true;
  const text = ((item.title || '') + ' ' + (item.summary || '') + ' ' + (item.category || '')).toLowerCase();
  return symbols.some(s => text.includes(s.toLowerCase()));
}

const ImpactBadge: React.FC<{ impact: 'positive' | 'negative' | 'none'; isAlert?: boolean }> = ({ impact, isAlert }) => {
  if (isAlert) return (
    <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black border border-amber-100 animate-pulse">
      <Zap className="w-3 h-3 fill-amber-500" /> AI Alert
    </span>
  );
  if (impact === 'positive') return (
    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black border border-emerald-100">
      <TrendingUp className="w-3 h-3" /> Portfolio +
    </span>
  );
  if (impact === 'negative') return (
    <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black border border-red-100">
      <TrendingDown className="w-3 h-3" /> Portfolio −
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-black border border-slate-100">
      <Minus className="w-3 h-3" /> Market
    </span>
  );
};

const NewsCard: React.FC<{ item: any; impact: 'positive' | 'negative' | 'none'; index: number }> = ({ item, impact, index }) => {
  const [expanded, setExpanded] = useState(false);
  const isAlert = item.category === 'Portfolio Alert';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`group p-8 rounded-[2.5rem] border transition-all ${isAlert ? 'bg-amber-50/30 border-amber-100 shadow-amber-500/5' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-stripe-cyan/5'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${isAlert ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-50 text-stripe-dark border-slate-100'}`}>
            {item.category || 'General'}
          </span>
          <span className="text-xs text-slate-400 font-bold">{item.time || 'Just now'}</span>
        </div>
        <ImpactBadge impact={impact} isAlert={isAlert} />
      </div>

      <h2 className={`text-2xl font-black mb-3 leading-snug transition-colors ${isAlert ? 'text-amber-900' : 'text-stripe-dark group-hover:text-stripe-cyan'}`}>
        {item.title}
      </h2>

      <p className="text-stripe-slate leading-relaxed mb-5 font-medium">
        {item.summary}
      </p>

      <button
        onClick={() => setExpanded(e => !e)}
        className={`flex items-center gap-2 font-bold text-sm transition-colors ${isAlert ? 'text-amber-700 hover:text-amber-900' : 'text-stripe-cyan hover:text-stripe-dark'}`}
      >
        {expanded ? 'Show less' : 'Read more'}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`mt-5 pt-5 border-t space-y-4 ${isAlert ? 'border-amber-100' : 'border-slate-100'}`}>
              <p className="text-stripe-slate leading-relaxed font-medium">
                {item.full_content || item.summary}
              </p>
              {impact !== 'none' && (
                <div className={`p-4 rounded-2xl ${impact === 'positive' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                  <p className={`text-sm font-bold ${impact === 'positive' ? 'text-emerald-700' : 'text-red-600'}`}>
                    {impact === 'positive' ? '✅ Portfolio Impact: Positive' : '⚠️ Portfolio Impact: Caution Advised'}
                  </p>
                </div>
              )}
              {item.source_url && item.source_url !== '#' && (
                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-stripe-cyan font-bold text-sm hover:underline">
                  View full source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MarketPulsePage: React.FC = () => {
  const [allNews, setAllNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'all' | 'portfolio'>('all');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const symbols = useMemo(() =>
    (portfolio?.holdings ?? []).map((h: any) => h.symbol as string),
    [portfolio]
  );

  const fetchNews = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const userId = localStorage.getItem('user_id');
      let p = portfolio;
      if (!p && userId) {
        try {
          p = await portfolioService.getMyPortfolio(userId);
          setPortfolio(p);
        } catch { /* empty */ }
      }

      const pSymbols = (p?.holdings ?? []).map((h: any) => h.symbol).join(',');
      const data = await newsService.getEtNews(userId || undefined, pSymbols, force);
      
      if (data?.news) {
        setAllNews(data.news);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [portfolio]);

  useEffect(() => { fetchNews(); }, []);

  const portfolioNews = useMemo(() =>
    allNews.filter(item => isRelatedToPortfolio(item, symbols)),
    [allNews, symbols]
  );

  const displayedNews = tab === 'portfolio' ? portfolioNews : allNews;

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        
        <div className="mb-12 flex justify-between items-end">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black text-stripe-dark mb-4 tracking-tight">
              Market <br /><span className="text-stripe-cyan">Pulse.</span>
            </motion.h1>
            <p className="text-xl text-stripe-slate font-medium">
              {portfolio ? `Tracking news for ${symbols.length} holdings in ${portfolio.name}.` : 'Real-time financial intelligence. Connect your portfolio for personalized alerts.'}
            </p>
          </div>
          <button 
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className={`p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 group`}
          >
            <RefreshCcw className={`w-6 h-6 text-stripe-cyan ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>

        <AnimatePresence>
          {refreshing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="p-4 bg-stripe-cyan/10 border border-stripe-cyan/20 rounded-2xl flex items-center gap-4">
                <Loader2 className="w-5 h-5 text-stripe-cyan animate-spin" />
                <p className="text-sm font-black text-stripe-cyan">
                  Fetching latest financial intelligence... this might take a moment as our AI scans the markets.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {portfolio && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stripe-cyan/10 rounded-xl"><Wallet className="w-5 h-5 text-stripe-cyan" /></div>
              <div>
                <p className="font-black text-stripe-dark text-sm">{portfolio.name}</p>
                <p className="text-xs text-slate-400 font-medium">Personalized impact tags & AI Alpha Alerts active</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">AI Alerts</span>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mb-8 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
          {(['all', 'portfolio'] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                if (t === 'portfolio' && !portfolio) {
                  const uid = localStorage.getItem('user_id');
                  if (!uid) { setIsAuthModalOpen(true); return; }
                  navigate('/portfolio');
                  return;
                }
                setTab(t);
              }}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${tab === t ? 'bg-stripe-cyan text-white shadow-lg' : 'text-stripe-slate hover:text-stripe-dark hover:bg-slate-50'}`}
            >
              {t === 'all' ? 'All Market News' : `My Portfolio News${portfolioNews.length > 0 ? ` (${portfolioNews.length})` : ''}`}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-40 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-stripe-cyan animate-spin" />
              <p className="text-stripe-slate font-bold">Connecting to market intelligence server...</p>
            </motion.div>
          ) : displayedNews.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-6 bg-white border border-slate-100 rounded-[3rem]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Newspaper className="w-10 h-10 text-slate-200" />
              </div>
              <div>
                <p className="text-2xl font-black text-stripe-dark">
                  {tab === 'portfolio' ? 'No intelligence for your holdings yet.' : 'The market is currently quiet.'}
                </p>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">
                  {tab === 'portfolio' ? "We'll alert you the moment your holdings hit the headlines. Try checking the 'All Market News' tab." : "Hold tight, we're scanning global markets."}
                </p>
              </div>
              {tab === 'portfolio' && (
                <button 
                  onClick={() => fetchNews(true)}
                  className="px-8 py-4 bg-stripe-cyan text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  <RefreshCcw className="w-4 h-4" /> Trigger Deep Scan
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {displayedNews.map((item, i) => (
                <NewsCard
                  key={i}
                  item={item}
                  impact={portfolio ? getImpact(item, symbols) : 'none'}
                  index={i}
                />
              ))}
              
              <div className="pt-12 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-400">
                  <Info className="w-4 h-4" />
                  News is sourced from ET Markets RSS and parsed by Gemini AI
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} featureName="Portfolio Intelligence" />
    </div>
  );
};

export default MarketPulsePage;
