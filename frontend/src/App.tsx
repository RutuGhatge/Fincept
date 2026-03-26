import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AnimatedBackground from "./components/AnimatedBackground";
import MainLayout from "./components/MainLayout";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import PortfolioPage from "./pages/PortfolioPage";
import MyPortfolioPage from "./pages/MyPortfolioPage";
import AccountPage from "./pages/AccountPage";
import AIInsightPage from "./pages/AIInsightPage";
import PortfolioAuditPage from "./pages/PortfolioAuditPage";
import MarketPulsePage from "./pages/MarketPulsePage";
import JargonDecoderPage from "./pages/JargonDecoderPage";
import AllocatePage from "./pages/AllocatePage";
import Benefits from "./pages/Benefits";
import BrokerConnectPage from "./pages/BrokerConnectPage";

import ProductsOverview from "./pages/ProductsOverview";

import { AboutProject, Documentation } from "./pages/DeveloperPages";
import PricingPage from "./pages/PricingPage";
import { PrivacyPolicy, TermsOfService, Cookies } from "./pages/LegalPages";

import AuthPage from "./pages/AuthPage";
import ComingSoonPage from "./pages/ComingSoonPage";


const App: React.FC = () => {
  return (
    <Router>
      {/* 🔥 BACKGROUND */}
      <AnimatedBackground />

      <ScrollToTop />

      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/broker-connect" element={<BrokerConnectPage />} />
          <Route path="/my-portfolio" element={<MyPortfolioPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/analysis" element={<AIInsightPage />} />
          <Route path="/analysis/audit" element={<PortfolioAuditPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/news" element={<MarketPulsePage />} />
          <Route path="/jargon" element={<JargonDecoderPage />} />
          <Route path="/allocate" element={<AllocatePage />} />
          <Route path="/pricing" element={<PricingPage />} />


          <Route path="/benefits" element={<Benefits />} />
          <Route path="/products-overview" element={<ProductsOverview />} />


          <Route path="/developer/about" element={<AboutProject />} />
          <Route path="/developer/docs" element={<Documentation />} />

          <Route path="/auth/signin" element={<AuthPage />} />

          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms" element={<TermsOfService />} />
          <Route path="/legal/cookies" element={<Cookies />} />


        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;