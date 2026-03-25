import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { User, Shield, Settings, LogOut, Bell, ChevronRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/auth/signin');
    }
=======
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, ArrowLeft, Settings, Bell, Lock } from 'lucide-react';
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
>>>>>>> 74309ae (feat: implement user profiles and personalized investment dashboard)
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
<<<<<<< HEAD
    localStorage.removeItem('user');
=======
>>>>>>> 74309ae (feat: implement user profiles and personalized investment dashboard)
    localStorage.removeItem('user_id');
    navigate('/');
    window.location.reload();
  };

<<<<<<< HEAD
  if (!user) return null;

  return (
    <div className="pt-32 pb-24 bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center mb-8">
              <div className="w-24 h-24 bg-stripe-purple/10 rounded-full flex items-center justify-center text-stripe-purple mx-auto mb-6">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-stripe-dark mb-1 capitalize">{user.first_name} {user.last_name}</h2>
              <p className="text-stripe-slate font-medium mb-6">{user.email}</p>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                Premium Member
              </span>
            </div>

            <nav className="space-y-2">
              {[
                { icon: User, label: "Personal Info", active: true },
                { icon: Shield, label: "Security" },
                { icon: Bell, label: "Notifications" },
                { icon: CreditCard, label: "Billing" },
                { icon: Settings, label: "Settings" },
              ].map((item, i) => (
                <button 
                  key={i}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold ${
                    item.active ? 'bg-stripe-dark text-white shadow-lg' : 'text-stripe-slate hover:bg-white hover:text-stripe-dark'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  <ChevronRight className={`w-4 h-4 ${item.active ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold mt-8"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
              <h3 className="text-3xl font-black text-stripe-dark mb-10">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-stripe-dark font-bold capitalize">
                    {user.first_name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-stripe-dark font-bold capitalize">
                    {user.last_name}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-stripe-dark font-bold flex items-center justify-between">
                    {user.email}
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>
              <button className="mt-12 px-8 py-4 bg-stripe-purple text-white rounded-2xl font-black text-lg hover:bg-stripe-dark transition-all shadow-xl">
                Update Profile
              </button>
            </div>

            <div className="bg-stripe-dark p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-1/4">
                <Shield className="w-64 h-64" />
              </div>
              <div className="relative z-10 max-w-xl">
                <h3 className="text-3xl font-black mb-4">Security Overview</h3>
                <p className="text-slate-400 text-lg mb-8 font-medium">
                  Your account is protected with enterprise-grade encryption. Last sign-in was today from Mumbai, India.
                </p>
                <button className="px-8 py-3 bg-white text-stripe-dark rounded-xl font-bold hover:bg-slate-100 transition-all">
                  Manage Sessions
                </button>
              </div>
            </div>
=======
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
                <Shield className="w-3.4 h-3.4" /> Verified Investor
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
>>>>>>> 74309ae (feat: implement user profiles and personalized investment dashboard)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
