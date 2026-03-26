import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Upload,
  Key,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader,
  Lock,
  LayoutDashboard,
  Wallet,
  Trash2,
  Clock,
  Calendar
} from 'lucide-react';
import { portfolioService } from '../services/apiService';
import AuthModal from '../components/AuthModal';

const PortfolioPage: React.FC = () => {
  const [method, setMethod] = useState<'api' | 'manual' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token);
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    // Check if portfolio already exists
    if (userId) {
      fetchPortfolioData(userId);
    }
  }, []);

  const fetchPortfolioData = async (userId: string) => {
    try {
      const p = await portfolioService.getMyPortfolio(userId);
      if (p?.id) {
        setPortfolio(p);
        setHasPortfolio(true);
      } else {
        setHasPortfolio(false);
        setPortfolio(null);
      }
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    }
  };

  const checkAuth = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!checkAuth()) return;
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('portfolio_name', 'Manual Import');
      formData.append('user_id', localStorage.getItem('user_id') || '');

      await portfolioService.uploadPortfolio(formData);
      setSuccess(true);
      setFile(null); // Clear after upload
      fetchPortfolioData(localStorage.getItem('user_id') || '');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please check the file format (Excel/CSV).');
    } finally {
      setUploading(false);
    }
  };

  const handleConnectAPI = () => {
    if (!checkAuth()) return;
    navigate('/broker-connect');
  };

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen relative">
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/30 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center max-w-lg"
          >
            <div className="w-20 h-20 bg-stripe-blue/10 rounded-3xl flex items-center justify-center text-stripe-blue mx-auto mb-8">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-stripe-dark mb-4">Portfolio Locked</h2>
            <p className="text-stripe-slate font-medium mb-10 leading-relaxed">
              Consolidate your wealth in one high-performance dashboard. Sign in to safely connect your brokerage accounts or upload statements.
            </p>
            <button 
              onClick={() => navigate('/auth/signin')}
              className="w-full py-5 bg-stripe-blue text-white rounded-[2rem] font-black text-lg hover:bg-stripe-dark hover:scale-105 transition-all shadow-xl"
            >
              Sign In to Manager Portfolio
            </button>
          </motion.div>
        </div>
      )}

      <div className={`container mx-auto px-6 ${!isAuthenticated ? 'grayscale opacity-50 blur-sm pointer-events-none' : ''}`}>
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

        {/* Portfolio Already Exists Banner */}
        {(hasPortfolio || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-gradient-to-r from-stripe-blue/10 to-stripe-purple/10 rounded-[2rem] border border-stripe-blue/20 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-stripe-blue/15 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-stripe-blue" />
              </div>
              <div>
                <p className="font-black text-stripe-dark text-lg">Portfolio Connected</p>
                <p className="text-sm text-stripe-slate font-medium">Your holdings are synced and ready to view.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/my-portfolio')}
                className="flex items-center gap-2 px-6 py-3 bg-stripe-blue text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg"
              >
                <Wallet className="w-4 h-4" /> View My Portfolio
              </button>
              <button
                onClick={async () => {
                  const p = await portfolioService.getMyPortfolio(localStorage.getItem('user_id') || '');
                  if (p?.id && window.confirm("Are you sure you want to delete your entire portfolio? This cannot be undone.")) {
                    await portfolioService.deletePortfolio(p.id, localStorage.getItem('user_id') || '');
                    setHasPortfolio(false);
                    setSuccess(false);
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all shadow-md"
              >
                Delete Portfolio
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-12">
          {/* API Connection Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setMethod('api')}
            className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer ${method === 'api' ? 'border-stripe-blue bg-stripe-blue/5 shadow-2xl' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
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
                {success && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Live portfolio connected and fetched successfully!
                    </div>
                    <button 
                      onClick={() => navigate('/my-portfolio')}
                      className="w-full py-4 bg-stripe-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stripe-dark transition-all shadow-lg"
                    >
                      <BarChart3 className="w-5 h-5" /> Go to My Portfolio
                    </button>
                  </div>
                )}
                {!success && (
                  <>
                    <button 
                      onClick={handleConnectAPI}
                      disabled={uploading}
                      className="w-full py-4 bg-stripe-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stripe-slate transition-all disabled:opacity-50"
                    >
                      {uploading ? <Loader className="w-5 h-5 animate-spin" /> : 'Connect and Fetch Portfolio'} <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-slate-400 text-center font-medium italic">We'll provide API keys after sometime for full integration.</p>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Manual Upload Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setMethod('manual')}
            className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer ${method === 'manual' ? 'border-stripe-purple bg-stripe-purple/5 shadow-2xl' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
              }`}
          >
            <div className="p-4 bg-stripe-purple/10 rounded-2xl w-fit mb-8">
              <Upload className="w-10 h-10 text-stripe-purple" />
            </div>
            <h3 className="text-3xl font-black text-stripe-dark mb-4">Upload Manual Data</h3>
            <p className="text-lg text-stripe-slate leading-relaxed mb-8">
              Upload your portfolio in CSV, Excel (XLSX), PDF, or DOCX formats. You can upload multiple files to combine your portfolios into a single view.
            </p>

            {method === 'manual' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-6 border-t border-stripe-purple/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".csv,.xlsx,.xls"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stripe-purple/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white/50 hover:bg-white transition-all cursor-pointer"
                >
                  <FileText className="w-12 h-12 text-stripe-purple/50" />
                  <div>
                    <p className="font-bold text-stripe-dark">
                      {file ? file.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-sm text-slate-400">CSV, XLS, XLSX (Max 10MB)</p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Portfolio uploaded and merged successfully!
                  </div>
                )}

                {success && (
                  <button 
                    onClick={() => navigate('/my-portfolio')}
                    className="w-full py-4 bg-stripe-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stripe-dark transition-all shadow-lg"
                  >
                    <BarChart3 className="w-5 h-5" /> Go to My Dashboard
                  </button>
                )}
                {!success && (
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full py-4 bg-stripe-purple text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stripe-slate transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader className="w-5 h-5 animate-spin" /> : 'Analyze Portfolio'}{' '}
                    {!uploading && <ArrowRight className="w-5 h-5" />}
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  AI Agent ready for parsing.
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Manage Uploaded Files Section */}
                {/* Manage Uploaded Files Section */}
        {hasPortfolio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-slate-100 rounded-2xl">
                <FileText className="w-6 h-6 text-stripe-dark" />
              </div>
              <h2 className="text-3xl font-black text-stripe-dark">Manage Uploaded Files</h2>
            </div>

            {portfolio?.files?.length > 0 ? (
              <div className="grid gap-4">
                {portfolio.files.map((f: any) => (
                  <div 
                    key={f.id} 
                    className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between group hover:border-stripe-blue/30 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <FileText className="w-6 h-6 text-stripe-blue" />
                      </div>
                      <div>
                        <p className="font-bold text-stripe-dark text-lg">{f.filename}</p>
                        <div className="flex items-center gap-4 text-sm text-stripe-slate font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(f.upload_date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> {f.holdings_count} Holdings</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to remove ${f.filename}? This will update your merged portfolio.`)) {
                          try {
                            await portfolioService.deletePortfolioFile(portfolio.id, f.id, localStorage.getItem('user_id') || '');
                            fetchPortfolioData(localStorage.getItem('user_id') || '');
                          } catch (err) {
                            alert("Failed to delete file.");
                          }
                        }
                      }}
                      className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      title="Remove File"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-stripe-slate font-medium">
                  No file tracking data available for previous uploads. <br />
                  New uploads will appear here for individual management.
                </p>
              </div>
            )}
          </motion.div>
        )}

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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        featureName="Portfolio Management"
      />
    </div>
  );
};

export default PortfolioPage;
