import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, featureName }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stripe-dark/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-stripe-dark"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-stripe-dark mb-4">Authentication Required</h3>
            <p className="text-stripe-slate font-medium mb-8">
              You need to be signed in to access <span className="text-stripe-blue font-bold">{featureName}</span>. Join our institutional-grade platform to unlock advanced insights.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  onClose();
                  navigate('/auth/signin');
                }}
                className="w-full py-4 bg-stripe-blue text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-stripe-slate transition-all"
              >
                <LogIn className="w-5 h-5" /> Sign In Now
              </button>
              
              <button
                onClick={() => {
                  onClose();
                  navigate('/auth/signin'); // Redirect to same page, AuthPage handles toggle
                }}
                className="w-full py-4 bg-slate-50 text-stripe-dark rounded-2xl font-black flex items-center justify-center gap-2 border border-slate-100 hover:bg-slate-100 transition-all"
              >
                <UserPlus className="w-5 h-5" /> Create New Account
              </button>
            </div>

            <button 
              onClick={onClose}
              className="mt-6 text-sm font-bold text-stripe-slate hover:text-stripe-blue transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              Maybe Later <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fincept SECURE PROTECTION ENGINE v1.0</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
