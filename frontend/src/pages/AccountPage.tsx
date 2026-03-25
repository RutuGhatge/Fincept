import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, LogOut, ArrowLeft, Settings, Bell, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        navigate('/auth/signin');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="w-8 h-8 border-4 border-stripe-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stripe-slate font-bold hover:text-stripe-blue transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-stripe-blue/10 rounded-full flex items-center justify-center text-stripe-blue mx-auto mb-6">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-stripe-dark mb-1">{user?.name}</h2>
              <p className="text-stripe-slate font-medium text-sm mb-6">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3" /> Verified Investor
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100"
            >
              <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 text-stripe-blue transition-all text-left">
                <Settings className="w-5 h-5" />
                <span className="font-bold text-sm">Personal Info</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 text-stripe-dark transition-all text-left">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-sm">Notifications</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 text-stripe-dark transition-all text-left">
                <Lock className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-sm">Security</span>
              </button>
            </motion.div>
          </div>

          {/* Settings Area */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100"
            >
              <h3 className="text-xl font-black text-stripe-dark mb-8">Account Details</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stripe-slate uppercase tracking-widest px-2">Full Name</label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-stripe-dark">
                      {user?.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stripe-slate uppercase tracking-widest px-2">Email Address</label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-stripe-dark">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-stripe-blue/5 rounded-[2rem] border border-stripe-blue/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stripe-dark mb-1">Membership Plan</h4>
                    <p className="text-sm text-stripe-slate font-medium">You are currently on the <span className="text-stripe-blue font-bold">Standard</span> tier.</p>
                  </div>
                  <button className="px-6 py-2 bg-white border border-stripe-blue text-stripe-blue rounded-full font-bold text-sm hover:bg-stripe-blue hover:text-white transition-all">
                    Upgrade
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[3rem] p-10 shadow-sm border border-red-50"
            >
              <h3 className="text-xl font-black text-stripe-dark mb-4">Danger Zone</h3>
              <p className="text-stripe-slate font-medium mb-8">Once you sign out, you will need to re-authenticate to access your private portfolio data.</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Sign Out from Fincept
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
