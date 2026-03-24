import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-20 border-b border-white border-opacity-[0.05] px-10 flex items-center justify-between sticky top-0 bg-background bg-opacity-80 backdrop-blur-md z-40">
      <div className="relative w-96">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search markets, stocks, crypto..."
          className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-[0.1] rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-[0.05] text-gray-400 hover:text-white hover:bg-opacity-[0.08] transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        
        <div className="h-8 w-px bg-white bg-opacity-[0.1] mx-2"></div>
        
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-white hover:bg-opacity-[0.03] transition-all">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
            <User size={20} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight">Alex Miller</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Premium Member</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
