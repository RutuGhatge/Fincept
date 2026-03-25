import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  ChevronRight, 
  X,
  Lightbulb,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { jargonService } from '../services/apiService';

const JargonDecoderPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedJargon, setSelectedJargon] = useState<any>(null);
  const [jargons, setJargons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchingAI, setSearchingAI] = useState(false);
  const [notFinanceMsg, setNotFinanceMsg] = useState('');
  const limit = 12;

  const fetchGlossary = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    try {
      const currentSkip = isLoadMore ? skip + limit : 0;
      const response = await jargonService.getGlossary(currentSkip, limit);
      
      if (response && response.glossary) {
        if (isLoadMore) {
          setJargons(prev => [...prev, ...response.glossary]);
          setSkip(currentSkip);
        } else {
          setJargons(response.glossary);
          setSkip(0);
        }
        
        if (response.glossary.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Error fetching glossary:", error);
    } finally {
      if (!isLoadMore) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlossary();
  }, []);

  const handleSearchAI = async () => {
    if (!search.trim()) return;
    setSearchingAI(true);
    setNotFinanceMsg('');
    try {
      const result = await jargonService.explainTerm(search);
      if (result && result.not_finance) {
        setNotFinanceMsg(result.message || "I'm only here to explain finance and investment terms!");
      } else if (result && !result.error) {
        // Add new term to the list if not already there
        const newJargon = {
          term: result.term,
          full_form: result.full_form,
          short: result.short,
          long: result.long,
          category: result.category,
          example: result.example,
          source: result.source
        };
        setJargons(prev => [newJargon, ...prev]);
        setSelectedJargon(newJargon);
      }
    } catch (err) {
      console.error("Search AI failed:", err);
    } finally {
      setSearchingAI(false);
    }
  };

  const filteredJargons = jargons.filter(j => 
    j.term.toLowerCase().includes(search.toLowerCase()) ||
    (j.category && j.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 space-y-4"
            >
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              <p className="text-xl font-bold text-stripe-slate">Fetching glossary...</p>
            </motion.div>
          ) : !selectedJargon ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-4xl mb-16">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tight"
                >
                  Jargon <br />
                  <span className="text-orange-500">Decoder.</span>
                </motion.h1>
                <p className="text-2xl text-stripe-slate leading-relaxed mb-12">
                  Finance is complicated, but it shouldn't be. Explore our glossary or search any term to get an AI-powered explanation.
                </p>

                {/* Search with AI Fallback */}
                <div className="relative max-w-2xl mb-12">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search terms (e.g. EBITDA, P/E Ratio)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && filteredJargons.length === 0 && handleSearchAI()}
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-full">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  )}
                </div>

                {search && filteredJargons.length === 0 && !notFinanceMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Lightbulb className="w-6 h-6 text-orange-500" />
                      </div>
                      <p className="text-lg font-bold text-stripe-dark">
                        Term not in library. Let the Jargon Agent find it?
                      </p>
                    </div>
                    <button 
                      onClick={handleSearchAI}
                      disabled={searchingAI}
                      className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {searchingAI ? <><Loader2 className="w-5 h-5 animate-spin" /> Jargon Agent is fetching...</> : <><Search className="w-5 h-5" /> Ask Jargon Agent</>}
                    </button>
                  </motion.div>
                )}

                {notFinanceMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 flex items-center gap-4"
                  >
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <X className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-stripe-dark">Jargon Agent says:</p>
                      <p className="text-stripe-slate font-medium">{notFinanceMsg}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {filteredJargons.map((j, i) => (
                  <motion.div
                    key={j.term + i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedJargon(j)}
                    className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-orange-500/5 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                        {j.category || "General"}
                      </span>
                      <h3 className="text-2xl font-black text-stripe-dark mb-4 group-hover:text-orange-500 transition-colors">
                        {j.term}
                      </h3>
                      <p className="text-stripe-slate leading-relaxed font-medium line-clamp-3">
                        {j.short}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                      Read more <ChevronRight className="w-5 h-5" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {hasMore && !search && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => fetchGlossary(true)}
                    className="px-12 py-5 bg-stripe-dark text-white rounded-2xl font-black text-xl hover:opacity-90 transition-all shadow-xl"
                  >
                    Load More Jargons
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setSelectedJargon(null)}
                className="flex items-center gap-2 text-stripe-slate font-bold mb-12 hover:text-stripe-dark group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to glossary
              </button>

              <div className="space-y-12">
                <div className="space-y-6">
                  <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest">
                    {selectedJargon.category}
                  </span>
                  <h1 className="text-6xl font-black text-stripe-dark tracking-tight">{selectedJargon.term}</h1>
                  {selectedJargon.full_form && selectedJargon.full_form !== selectedJargon.term && (
                    <p className="text-xl text-slate-400 font-semibold tracking-wide">{selectedJargon.full_form}</p>
                  )}
                  <p className="text-3xl text-orange-500 font-bold leading-tight">
                    {selectedJargon.short}
                  </p>
                </div>

                <div className="prose prose-orange prose-xl max-w-none text-stripe-slate leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({children}) => <p className="text-xl font-medium mb-4 leading-relaxed">{children}</p>,
                      strong: ({children}) => <strong className="font-black text-stripe-dark">{children}</strong>,
                      ul: ({children}) => <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>,
                      li: ({children}) => <li className="text-xl font-medium text-stripe-slate">{children}</li>,
                    }}
                  >
                    {selectedJargon.long || selectedJargon.definition || ''}
                  </ReactMarkdown>
                </div>

                <div className="p-10 bg-orange-50 rounded-[3rem] border border-orange-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Lightbulb className="w-24 h-24 text-orange-500" />
                  </div>
                  <h4 className="text-2xl font-black text-stripe-dark mb-6 flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-orange-500" /> Real-world Example
                  </h4>
                  <p className="text-xl text-stripe-slate leading-relaxed font-medium">
                    {selectedJargon.example}
                  </p>
                </div>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                  <p className="text-slate-400 font-medium italic">Was this explanation helpful?</p>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 bg-slate-100 rounded-full font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-all">Yes, thanks!</button>
                    <button className="px-6 py-2 bg-slate-100 rounded-full font-bold hover:bg-orange-100 hover:text-orange-700 transition-all">Still confused</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JargonDecoderPage;
