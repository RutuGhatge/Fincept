import React, { useState, useEffect } from 'react';
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    navigate('/');
    window.location.reload();
  };

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
