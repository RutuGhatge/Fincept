import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  X,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';

const jargons = [
  {
    term: "EBITDA",
    short: "Earnings Before Interest, Taxes, Depreciation, and Amortization.",
    long: "EBITDA is a measure of a company's overall financial performance and is used as an alternative to net income in some circumstances. EBITDA, however, can be misleading because it strips out the cost of capital investments like property, plant, and equipment.",
    category: "Financial Metrics",
    example: "If a company has high net income but low EBITDA, it might be due to high interest payments or tax benefits."
  },
  {
    term: "P/E Ratio",
    short: "Price-to-Earnings Ratio.",
    long: "The price-to-earnings ratio (P/E ratio) is the ratio for valuing a company that measures its current share price relative to its per-share earnings (EPS). The price-to-earnings ratio is also sometimes known as the price multiple or the earnings multiple.",
    category: "Valuation",
    example: "A high P/E ratio could mean that a company's stock is over-valued, or else that investors are expecting high growth rates in the future."
  },
  {
    term: "Tax-Loss Harvesting",
    short: "Selling securities at a loss to offset a capital gains tax liability.",
    long: "Tax-loss harvesting is the timely selling of securities at a loss to offset the amount of capital gains tax due on the sale of other investments at a profit. This strategy is most often used to limit the recognition of short-term capital gains.",
    category: "Taxation",
    example: "Selling a stock that dropped 20% to offset the gains from another stock that rose 50% can reduce your taxable income."
  }
];

const JargonDecoderPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedJargon, setSelectedJargon] = useState<any>(null);

  // Filter without suggestions as requested
  const filteredJargons = jargons.filter(j => 
    j.term.toLowerCase().includes(search.toLowerCase()) ||
    j.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          {!selectedJargon ? (
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
                  Finance is complicated, but it shouldn't be. Explore our blog-style glossary of financial terms made simple.
                </p>

                {/* Pure Search - No Suggestions as requested */}
                <div className="relative max-w-2xl mb-12">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search terms (e.g. EBITDA, P/E Ratio)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-full">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredJargons.map((j, i) => (
                  <motion.div
                    key={j.term}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedJargon(j)}
                    className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-orange-500/5 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                        {j.category}
                      </span>
                      <h3 className="text-2xl font-black text-stripe-dark mb-4 group-hover:text-orange-500 transition-colors">
                        {j.term}
                      </h3>
                      <p className="text-stripe-slate leading-relaxed font-medium">
                        {j.short}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                      Read more <ChevronRight className="w-5 h-5" />
                    </div>
                  </motion.div>
                ))}
              </div>
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
                  <p className="text-3xl text-orange-500 font-bold leading-tight">
                    {selectedJargon.short}
                  </p>
                </div>

                <div className="prose prose-orange prose-xl max-w-none text-stripe-slate leading-relaxed">
                  <p className="text-2xl font-medium">
                    {selectedJargon.long}
                  </p>
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
