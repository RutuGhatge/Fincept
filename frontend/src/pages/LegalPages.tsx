import { Shield, FileText, Cookie, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalPageContainer: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => {
  const navigate = useNavigate();
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stripe-slate font-bold mb-12 hover:text-stripe-dark group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to home
        </button>
        
        <div className="max-w-3xl bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-4 bg-slate-50 rounded-2xl">
              {icon}
            </div>
            <h1 className="text-4xl font-black text-stripe-dark tracking-tighter">{title}</h1>
          </div>
          <div className="prose prose-slate max-w-none text-stripe-slate font-medium">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <LegalPageContainer title="Privacy Policy" icon={<Shield className="w-8 h-8 text-emerald-500" />}>
    <p className="text-xl mb-8">At Fincept, your privacy is our institutional priority. We do not sell your data; we protect your alpha.</p>
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-stripe-dark">Data Encryption</h3>
      <p>All sensitive information, including API keys and portfolio data, is encrypted using bank-grade AES-256 protocols before storage.</p>
    </div>
  </LegalPageContainer>
);

export const TermsOfService: React.FC = () => (
  <LegalPageContainer title="Terms of Service" icon={<FileText className="w-8 h-8 text-stripe-blue" />}>
    <p className="text-xl mb-8">By using Fincept, you agree to our standard operating procedures for data intelligence and portfolio analysis.</p>
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-stripe-dark">Acceptable Use</h3>
      <p>You agree to use our AI agents and terminal tools for legal investment research and personal portfolio management only.</p>
    </div>
  </LegalPageContainer>
);

export const Cookies: React.FC = () => (
  <LegalPageContainer title="Cookies" icon={<Cookie className="w-8 h-8 text-orange-500" />}>
    <p className="text-xl mb-8">We use essential cookies to maintain your secure session and provide a tailored intelligence experience.</p>
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-stripe-dark">Performance Cookies</h3>
      <p>We use anonymous analytics to understand how you interact with our market pulse and jargon decoder tools.</p>
    </div>
  </LegalPageContainer>
);
