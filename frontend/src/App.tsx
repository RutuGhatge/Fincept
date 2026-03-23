import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { motion } from 'framer-motion';

// Layout Components
import Layout from './components/Layout/Layout';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Page Components
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Analysis from './pages/Analysis';
import News from './pages/News';
import Jargon from './pages/Jargon';
import Recommendations from './pages/Recommendations';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortfolioProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Layout>
                <Navbar />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6 lg:p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/jargon" element={<Jargon />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                      </Routes>
                    </motion.div>
                  </main>
                </div>
              </Layout>
            </div>
          </Router>
        </PortfolioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
