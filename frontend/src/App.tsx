import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import PortfolioPage from "./pages/PortfolioPage";
import AIInsightPage from "./pages/AIInsightPage";
import MarketPulsePage from "./pages/MarketPulsePage";
import JargonDecoderPage from "./pages/JargonDecoderPage";
import TerminalPage from "./pages/TerminalPage";
import Benefits from "./pages/Benefits";
import ProductsOverview from "./pages/ProductsOverview";
import { AboutProject, Documentation } from "./pages/DeveloperPages";
import { Retail, Enterprise, Family } from "./pages/SolutionPages";
import { PrivacyPolicy, TermsOfService, Cookies } from "./pages/LegalPages";
import AuthPage from "./pages/AuthPage";

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/analysis" element={<AIInsightPage />} />
          <Route path="/news" element={<MarketPulsePage />} />
          <Route path="/jargon" element={<JargonDecoderPage />} />
          <Route path="/market-data" element={<TerminalPage />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/products-overview" element={<ProductsOverview />} />
          
          {/* Solutions */}
          <Route path="/solutions/retail" element={<Retail />} />
          <Route path="/solutions/enterprise" element={<Enterprise />} />
          <Route path="/solutions/family" element={<Family />} />
          
          {/* Developers */}
          <Route path="/developer/about" element={<AboutProject />} />
          <Route path="/developer/docs" element={<Documentation />} />
          
          {/* Auth */}
          <Route path="/auth/signin" element={<AuthPage />} />
          
          {/* Legal */}
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms" element={<TermsOfService />} />
          <Route path="/legal/cookies" element={<Cookies />} />
          
          {/* Pricing Placeholder */}
          <Route path="/pricing" element={<div className="pt-32 p-10 text-center text-4xl font-black">Pricing Coming Soon</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
