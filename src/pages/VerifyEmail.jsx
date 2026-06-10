import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, ArrowRight } from 'lucide-react';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import { PageLoader } from '../components/ui/LoadingSpinner';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const oobCode = searchParams.get('oobCode') || new URLSearchParams(window.location.hash.replace('#', '?')).get('oobCode');
    const mode = searchParams.get('mode');

    if (mode === 'verifyEmail' && oobCode) {
      checkActionCode(auth, oobCode)
        .then((info) => {
          setEmail(info.data.email || '');
          return applyActionCode(auth, oobCode);
        })
        .then(() => {
          setStatus('verified');
          if (auth.currentUser) {
            auth.currentUser.reload().then(() => {
              useAuthStore.getState().setUser(auth.currentUser);
            });
          }
        })
        .catch(() => {
          if (auth.currentUser?.emailVerified) {
            setStatus('verified');
          } else {
            setStatus('error');
          }
        });
    } else if (auth.currentUser) {
      auth.currentUser.reload().then(() => {
        if (auth.currentUser?.emailVerified) {
          useAuthStore.getState().setUser(auth.currentUser);
          setEmail(auth.currentUser.email || '');
          setStatus('verified');
        } else {
          setStatus('error');
        }
      }).catch(() => setStatus('error'));
    } else {
      setEmail(auth.currentUser?.email || '');
      setStatus('verified');
    }
  }, []); 

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-white/5 rounded-2xl p-8 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <div className="py-8">
            <PageLoader />
            <p className="text-sm text-gray-400 mt-4">Verifying your email...</p>
          </div>
        )}

        {status === 'verified' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-sm text-gray-400 mb-6">
              {email ? `${email} has been verified.` : 'Your email has been verified.'}
            </p>
            <button
              onClick={() => navigate('/tracker')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] transition-all"
            >
              View Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-sm text-gray-400 mb-6">
              This link is invalid or has expired. If you already verified, try signing in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] transition-all"
            >
              Back to Login <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
