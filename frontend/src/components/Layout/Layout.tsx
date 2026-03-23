import React from 'react';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Outlet />
    </div>
  );
};

export default Layout;
