import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Newspaper, 
  BookOpen, 
  Settings,
  CircleDollarSign
} from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Portfolio', icon: Briefcase, path: '/portfolio' },
    { name: 'Analysis', icon: TrendingUp, path: '/analysis' },
    { name: 'Market News', icon: Newspaper, path: '/news' },
    { name: 'Jargon Explainer', icon: BookOpen, path: '/jargon' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-surface border-r border-white border-opacity-[0.05] flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <CircleDollarSign className="text-white w-6 h-6" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">InvestAI</span>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} />
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white border-opacity-[0.05]">
        <button className="nav-link w-full text-left">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
