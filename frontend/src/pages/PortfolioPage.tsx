import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Upload, 
  Key, 
  ArrowRight, 
  FileText, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const PortfolioPage: React.FC = () => {
  const [method, setMethod] = useState<'api' | 'manual' | null>(null);

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark mb-8 tracking-tight"
          >
            Portfolio <br />
            <span className="text-stripe-blue">Management.</span>
          </motion.h1>
          <p className="text-2xl text-stripe-slate leading-relaxed">
            The most advanced portfolio tracker in India. Connect your live data or upload manual records to gain institutional-grade insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* API Connection Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setMethod('api')}
            className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer ${
              method === 'api' ? 'border-stripe-blue bg-stripe-blue/5 shadow-2xl' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
            }`}
          >
            <div className="p-4 bg-stripe-blue/10 rounded-2xl w-fit mb-8">
              <Key className="w-10 h-10 text-stripe-blue" />
            </div>
            <h3 className="text-3xl font-black text-stripe-dark mb-4">Connect Live via API</h3>
            <p className="text-lg text-stripe-slate leading-relaxed mb-8">
              Connect directly to Zerodha, Groww, Upstox, and 15+ other brokers. Secure, real-time synchronization of your holdings.
            </p>
            {method === 'api' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-6 border-t border-stripe-blue/20"
              >
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-stripe-dark uppercase tracking-wider">Select Broker</label>
                  <select className="w-full p-4 bg-white rounded-xl border border-slate-200 font-medium">
                    <option>Zerodha (Kite)</option>
                    <option>Groww</option>
                    <option>Upstox</option>
                    <option>Angel One</option>
                  </select>
                </div>
                <button className="w-full py-4 bg-stripe-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stripe-slate transition-all disabled:opacity-50">
                  Authentication Coming Soon <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-xs text-slate-400 text-center font-medium italic">We'll provide API keys after sometime for full integration.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Manual Upload Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setMethod('manual')}
            className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer ${
              method === 'manual' ? 'border-stripe-purple bg-stripe-purple/5 shadow-2xl' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
            }`}
          >
            <div className="p-4 bg-stripe-purple/10 rounded-2xl w-fit mb-8">
              <Upload className="w-10 h-10 text-stripe-purple" />
            </div>
            <h3 className="text-3xl font-black text-stripe-dark mb-4">Upload Manual Data</h3>
            <p className="text-lg text-stripe-slate leading-relaxed mb-8">
              Upload your portfolio in CSV, PDF, or DOCX formats. Our AI agent will parse the data and generate comprehensive insights.
            </p>
            {method === 'manual' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-6 border-t border-stripe-purple/20"
              >
                <div className="border-2 border-dashed border-stripe-purple/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white/50">
                  <FileText className="w-12 h-12 text-stripe-purple/50" />
                  <div>
                    <p className="font-bold text-stripe-dark">Click to upload or drag & drop</p>
                    <p className="text-sm text-slate-400">CSV, PDF, or DOCX (Max 10MB)</p>
                  </div>
                </div>
                <button className="w-full py-4 bg-stripe-purple text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stripe-slate transition-all">
                  Analyze Portfolio <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  AI Agent ready for parsing.
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <AlertCircle className="w-8 h-8 text-stripe-blue mb-4" />
            <h4 className="text-xl font-black text-stripe-dark mb-4">Risk Detection</h4>
            <p className="text-stripe-slate">Identify overlapping holdings and high-risk sectors automatically.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <BarChart3 className="w-8 h-8 text-stripe-purple mb-4" />
            <h4 className="text-xl font-black text-stripe-dark mb-4">Live Performance</h4>
            <p className="text-stripe-slate">Real-time valuation of your entire net worth across all asset classes.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <CheckCircle2 className="w-8 h-8 text-stripe-cyan mb-4" />
            <h4 className="text-xl font-black text-stripe-dark mb-4">Smart Recs</h4>
            <p className="text-stripe-slate">Tailored buy/sell suggestions based on your unique financial goals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
