import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Key, ArrowRight, Shield, CheckCircle2, ExternalLink,
  Loader2, ArrowLeft, AlertTriangle, Zap, Lock, Globe
} from 'lucide-react';

const BROKERS = [
  { id: 'zerodha', name: 'Zerodha', subtitle: 'Kite Connect API', color: 'bg-[#387ED1]', logo: '🟦', popular: true },
  { id: 'groww', name: 'Groww', subtitle: 'Groww API', color: 'bg-[#00D09C]', logo: '💚', popular: true },
  { id: 'upstox', name: 'Upstox', subtitle: 'Upstox V2 API', color: 'bg-[#5945FF]', logo: '🟣', popular: false },
  { id: 'angel', name: 'Angel One', subtitle: 'SmartAPI', color: 'bg-[#F57C00]', logo: '🟠', popular: false },
  { id: 'fyers', name: 'Fyers', subtitle: 'Fyers v3 API', color: 'bg-[#1E88E5]', logo: '🔵', popular: false },
  { id: 'iifl', name: 'IIFL Securities', subtitle: 'IIFL Market API', color: 'bg-[#D32F2F]', logo: '🔴', popular: false },
];

const STEPS = [
  { step: '01', title: 'Select Your Broker', desc: 'Choose the brokerage platform where your holdings are.' },
  { step: '02', title: 'Enter API Key', desc: 'Paste your API credentials from the broker developer portal.' },
  { step: '03', title: 'Authorize & Sync', desc: 'We fetch your holdings securely — read-only access.' },
  { step: '04', title: 'View Dashboard', desc: 'Your live portfolio appears instantly in My Portfolio.' },
];

const BrokerConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!selectedBroker || !apiKey.trim()) {
      setError('Please select a broker and enter your API key.');
      return;
    }
    setError('');
    setConnecting(true);
    // Simulate async connection
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2500);
  };

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">

        {/* Back */}
        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 text-stripe-slate font-bold text-sm mb-10 hover:text-stripe-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio Management
        </button>

        {/* Hero */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stripe-blue/10 text-stripe-blue text-sm font-bold mb-6"
          >
            <Zap className="w-4 h-4" /> Live Broker Integration
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-stripe-dark tracking-tight mb-4"
          >
            Connect Live <br /><span className="text-stripe-blue">Broker API.</span>
          </motion.h1>
          <p className="text-xl text-stripe-slate font-medium max-w-xl">
            Securely sync your holdings in real-time. Read-only access. Bank-grade encryption.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10">

          {/* Left: Broker selection + form */}
          <div className="space-y-8">

            {/* Step guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-lg font-black text-stripe-dark mb-6">How It Works</h3>
              <div className="grid grid-cols-2 gap-4">
                {STEPS.map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="text-2xl font-black text-slate-200 shrink-0">{s.step}</span>
                    <div>
                      <p className="text-sm font-black text-stripe-dark">{s.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Broker Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-lg font-black text-stripe-dark mb-6">Select Your Broker</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BROKERS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBroker(b.id)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-105 ${
                      selectedBroker === b.id
                        ? 'border-stripe-blue bg-stripe-blue/5 shadow-lg'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {b.popular && (
                      <span className="absolute top-2 right-2 text-[10px] font-black text-stripe-blue bg-stripe-blue/10 px-2 py-0.5 rounded-full">Popular</span>
                    )}
                    <span className="text-3xl mb-3 block">{b.logo}</span>
                    <p className="font-black text-stripe-dark text-sm">{b.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{b.subtitle}</p>
                    {selectedBroker === b.id && (
                      <CheckCircle2 className="w-4 h-4 text-stripe-blue absolute bottom-3 right-3" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* API Form */}
            <AnimatePresence>
              {selectedBroker && !connected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
                >
                  <h3 className="text-lg font-black text-stripe-dark mb-6">
                    Enter {BROKERS.find(b => b.id === selectedBroker)?.name} API Credentials
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-black text-stripe-dark uppercase tracking-widest mb-2">API Key *</label>
                      <input
                        type="text"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Paste your API key here..."
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-medium text-stripe-dark placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-stripe-blue/30 focus:border-stripe-blue transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-stripe-dark uppercase tracking-widest mb-2">API Secret (Optional)</label>
                      <input
                        type="password"
                        value={apiSecret}
                        onChange={e => setApiSecret(e.target.value)}
                        placeholder="Enter API secret..."
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-medium text-stripe-dark placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-stripe-blue/30 focus:border-stripe-blue transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium mb-4">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Read-only access. We never place orders. AES-256 encrypted.</span>
                  </div>

                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full py-4 bg-stripe-blue text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-stripe-dark transition-all shadow-xl hover:scale-105 disabled:opacity-70 disabled:scale-100"
                  >
                    {connecting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Connecting to {BROKERS.find(b => b.id === selectedBroker)?.name}...</>
                    ) : (
                      <><Key className="w-5 h-5" /> Connect &amp; Fetch Portfolio <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
              {connected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black text-emerald-800 mb-2">
                    {BROKERS.find(b => b.id === selectedBroker)?.name} Connected!
                  </h3>
                  <p className="text-emerald-700 font-medium mb-8">Your live holdings have been fetched and are ready to view.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/my-portfolio')}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg"
                    >
                      View My Portfolio <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate('/portfolio')}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-700 rounded-2xl font-black hover:bg-emerald-50 transition-all"
                    >
                      Back to Portfolio Management
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Info panel */}
          <div className="space-y-6">
            {/* Security */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-stripe-dark rounded-[3rem] p-8 text-white"
            >
              <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black mb-4">Bank-Grade Security</h3>
              <ul className="space-y-3">
                {[
                  'Read-only API access — no trades placed',
                  'AES-256 end-to-end encryption',
                  'API keys never stored in plaintext',
                  'OAuth 2.0 where available',
                  'SEBI-compliant data handling',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Get API key */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
            >
              <div className="p-3 bg-stripe-blue/10 rounded-2xl w-fit mb-6">
                <Globe className="w-6 h-6 text-stripe-blue" />
              </div>
              <h3 className="text-lg font-black text-stripe-dark mb-4">How to Get Your API Key</h3>
              <div className="space-y-4 text-sm text-stripe-slate">
                <p>Log in to your broker's developer portal and create a new app to receive your API credentials.</p>
                {[
                  { name: 'Zerodha', link: 'https://developers.kite.trade' },
                  { name: 'Groww', link: 'https://developers.groww.in' },
                  { name: 'Upstox', link: 'https://developer.upstox.com' },
                ].map(b => (
                  <a
                    key={b.name}
                    href={b.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-stripe-blue/30 hover:bg-stripe-blue/5 transition-all group"
                  >
                    <span className="font-bold text-stripe-dark">{b.name} Developer Portal</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-stripe-blue transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerConnectPage;
