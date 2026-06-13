import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, MailCheck, RefreshCw, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import { loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword, linkPassword, logout } from '../services/auth';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const HCAPTCHA_SITE_KEY = '96dc27d6-f804-443a-b9b4-8e5066cc4280';
const VERIFY_URL = `${window.location.origin}/verify`;

function ParticlesBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79, 172, 254, 0.2)';
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}

function Login() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [setupPassword, setSetupPassword] = useState(null);
  const [setupPass, setSetupPass] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyResending, setVerifyResending] = useState(false);
  const [verifyChecking, setVerifyChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const signupRef = useRef(Date.now());
  const [captchaToken, setCaptchaToken] = useState(null);
  const [reRegisterCooldown, setReRegisterCooldown] = useState(() => {
    const raw = localStorage.getItem('atlas_signup_time');
    if (!raw) return 0;
    const elapsed = Date.now() - parseInt(raw);
    return Math.max(0, Math.ceil((15 * 60 * 1000 - elapsed) / 1000));
  });
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const captchaModalRef = useRef(null);

  useEffect(() => {
    document.title = 'Login to Atlas Coup';
    return () => { document.title = 'Atlas Coup - Track Habits, Goals & Tasks'; };
  }, []);

  useEffect(() => {
    if (!HCAPTCHA_SITE_KEY || !showCaptchaModal || !captchaModalRef.current) return;
    if (captchaModalRef.current.hasChildNodes()) return;
    if (!window.hcaptcha) return;
    window.hcaptcha.render(captchaModalRef.current, {
      sitekey: HCAPTCHA_SITE_KEY,
      callback: (token) => setCaptchaToken(token),
      'expired-callback': () => setCaptchaToken(null),
      theme: 'dark',
    });
  }, [showCaptchaModal, HCAPTCHA_SITE_KEY]);

  useEffect(() => {
    setCaptchaToken(null);
  }, [isSignup]);

  const disposableDomains = [
    'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','throwaway.email',
    'yopmail.com','trashmail.com','sharklasers.com','mailcatch.com','spamgourmet.com',
    'mailnator.com','getairmail.com','dispostable.com','temp-mail.org','fakeinbox.com',
    'mailexpire.com','spambox.us','mintemail.com','mailmoat.com','mytrashmail.com',
  ];

  const checkEmailDomain = async (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    if (disposableDomains.includes(domain)) return false;
    try {
      const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await res.json();
      return Array.isArray(data.Answer) && data.Answer.length > 0;
    } catch {
      return true;
    }
  };

  const checkSignupRate = () => {
    const key = 'atlas_signup_ts';
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const timestamps = raw ? JSON.parse(raw).filter(t => now - t < 900000) : [];
    if (timestamps.length >= 3) return false;
    timestamps.push(now);
    localStorage.setItem(key, JSON.stringify(timestamps));
    return true;
  };

  useEffect(() => {
    if (!user || setupPassword) return;
    if (user.emailVerified || user.providerData?.some(p => p.providerId === 'google.com')) {
      navigate('/tracker');
    } else if (!verifyingEmail) {
      setVerifyingEmail(true);
    }
  }, [user, navigate, setupPassword, verifyingEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (reRegisterCooldown <= 0) return;
    const id = setInterval(() => setReRegisterCooldown(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [reRegisterCooldown]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignup) {
      if (Date.now() - signupRef.current < 3000) {
        toast.error('Please wait a moment before signing up.');
        return;
      }
      if (!checkSignupRate()) {
        toast.error('Too many signup attempts. Please try later.');
        return;
      }
      const domainValid = await checkEmailDomain(email);
      if (!domainValid) {
        toast.error('This email domain does not appear to accept mail.');
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignup) {
        if (HCAPTCHA_SITE_KEY && !captchaToken) {
          setShowCaptchaModal(true);
          return;
        }
        await signupWithEmail(email, password);
        try { await loginWithEmail(email, password); } catch {}
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          sendEmailVerification(auth.currentUser, {
            url: VERIFY_URL,
            handleCodeInApp: true,
          }).catch(() => {});
        }
        localStorage.setItem('atlas_signup_time', Date.now().toString());
        setReRegisterCooldown(900);
        if (name.trim() && auth.currentUser) {
          try { await updateProfile(auth.currentUser, { displayName: name.trim() }); } catch {}
        }
        toast.success('Account created! Verify your email to continue.');
        setVerifyingEmail(true);
        setResendCooldown(120);
      } else {
        const result = await loginWithEmail(email, password);
        if (!result.user.emailVerified) {
          setVerifyingEmail(true);
          toast.info('Please verify your email before continuing.');
        } else {
          toast.success('Welcome back!');
          navigate('/tracker');
        }
      }
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists'
        : err.code === 'auth/weak-password' ? 'Password should be at least 6 characters'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.'
        : err.code?.startsWith('auth/') ? 'Invalid email or password.'
        : err.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await loginWithGoogle();
      const hasPassword = result.user?.providerData?.some(p => p.providerId === 'password');
      if (!hasPassword) {
        setSetupPassword(result.user);
        toast.success('Almost there! Set a password to complete your account.');
      } else {
        toast.success('Signed in with Google!');
        navigate('/tracker');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in error:', err.code || err.message);
        toast.error(err.code === 'auth/unauthorized-domain'
          ? 'Google sign-in is not configured for this domain.'
          : 'Google sign-in failed. Please try again.');
      }
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (setupPass !== setupConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (setupPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSetupLoading(true);
    try {
      await linkPassword(setupPassword.email, setupPass);
      toast.success('Account setup complete! Welcome aboard.');
      navigate('/tracker');
    } catch {
      toast.error('Failed to set password. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser || resendCooldown > 0) return;
    setVerifyResending(true);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: VERIFY_URL,
        handleCodeInApp: true,
      });
      toast.success('Verification email resent!');
      setResendCooldown(120);
    } catch {
      toast.error('Failed to resend. Try again shortly.');
    } finally {
      setVerifyResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setVerifyChecking(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        useAuthStore.getState().setUser(auth.currentUser);
        toast.success('Email verified! Welcome aboard.');
        navigate('/tracker');
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch {
      toast.error('Failed to check. Try again.');
    } finally {
      setVerifyChecking(false);
    }
  };

  const handleReset = async () => {
    if (!email) { toast.error('Please enter your email first'); return; }
    try {
      await resetPassword(email);
      setResetSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.code === 'auth/user-not-found' ? 'No account found with this email' : 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <ParticlesBG />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-blue-600/8 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-[1200px]">
        <div className="glass border border-white/5 rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[50vh] lg:min-h-[70vh]">

          <div className="lg:w-[38%] p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 sm:mb-6 lg:mb-8">
              <img src="/favicon.svg" alt="" className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="text-xs sm:text-sm font-semibold text-gray-300 tracking-widest">ATLAS COUP</span>
            </div>

            {verifyingEmail ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary-400/15 flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="h-7 w-7 text-primary-300" />
                  </div>
                  <h1 className="text-xl font-bold">Verify Your Email</h1>
                  <p className="text-sm text-gray-400 mt-1">We sent a verification email to</p>
                  <p className="text-sm font-medium text-white mt-0.5">{user?.email || email}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    Click the link in the email to verify your account, then click the button below.
                  </p>
                  <p className="text-[10px] text-yellow-400/70 text-center">
                    Didn't receive it? Check your spam folder.
                  </p>
                  <Button onClick={handleCheckVerification} loading={verifyChecking} className="w-full" size="lg">
                    <RefreshCw className="h-4 w-4" /> I've Verified — Continue
                  </Button>
                  <Button variant="ghost" className="w-full text-xs" onClick={handleResendVerification}
                    loading={verifyResending} disabled={resendCooldown > 0 || verifyResending}>
                    {resendCooldown > 0
                      ? `Resend in ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')}`
                      : 'Resend verification email'}
                  </Button>
                  {reRegisterCooldown > 0 ? (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                      <Clock className="h-3 w-3" />
                      Re-register in {Math.floor(reRegisterCooldown / 60)}:{String(reRegisterCooldown % 60).padStart(2, '0')}
                    </div>
                  ) : (
                    <button onClick={() => { setVerifyingEmail(false); logout(); localStorage.removeItem('atlas_signup_time'); }}
                      className="block text-center w-full text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      Wrong email? Re-register
                    </button>
                  )}
                  {!isSignup && (
                    <button onClick={() => { setVerifyingEmail(false); logout(); }}
                      className="block text-center w-full text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      Use a different account
                    </button>
                  )}
                </div>
              </>
            ) : setupPassword ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold">Set Your Password</h1>
                  <p className="text-sm text-gray-400 mt-1">Complete your Google account setup</p>
                </div>
                <form onSubmit={handleSetupPassword} className="space-y-4">
                  <Input label="New Password" type="password" placeholder="Create a password"
                    icon={Lock} value={setupPass} onChange={e => setSetupPass(e.target.value)} required />
                  <Input label="Confirm Password" type="password" placeholder="Confirm your password"
                    icon={Lock} value={setupConfirm} onChange={e => setSetupConfirm(e.target.value)} required />
                  <Button type="submit" loading={setupLoading} className="w-full" size="lg">
                    Complete Setup
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-3 sm:mb-4 text-center lg:text-left">
                  <h1 className="text-base sm:text-lg font-bold">
                    {isSignup ? 'Create Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    {isSignup ? 'Start your personal growth journey' : 'Continue your journey'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
                  {isSignup && (
                    <Input label="Full Name" type="text" placeholder="Ahm"
                      icon={User} value={name} onChange={e => setName(e.target.value)} />
                  )}
                  <Input label="Email" type="email" placeholder="youremail@gmail.com"
                    icon={Mail} value={email} onChange={e => setEmail(e.target.value)} required />
                  <div className="relative">
                    <Input label="Password" type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password" icon={Lock} value={password}
                      onChange={e => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] max-sm:top-[30px] text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-surface-700 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${
                          password.length < 6 ? 'w-[25%] bg-red-500' :
                          password.length < 10 ? 'w-[50%] bg-orange-400' :
                          password.length < 14 ? 'w-[75%] bg-yellow-400' :
                          'w-full bg-green-400'
                        }`} />
                      </div>
                      <span className={`text-[10px] font-medium ${
                        password.length < 6 ? 'text-red-400' :
                        password.length < 10 ? 'text-orange-400' :
                        password.length < 14 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {password.length < 6 ? 'Weak' :
                         password.length < 10 ? 'Fair' :
                         password.length < 14 ? 'Good' :
                         'Strong'}
                      </span>
                    </div>
                  )}

                  {!isSignup && (
                    <button type="button" onClick={handleReset} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                      {resetSent ? 'Reset email sent! Check your inbox.' : 'Forgot password?'}
                    </button>
                  )}

                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    {isSignup ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>

                <div className="relative my-4 max-sm:my-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-600" /></div>
                  <div className="relative flex justify-center"><span className="px-3 text-xs text-gray-500 bg-surface-800">or continue with</span></div>
                </div>

                <Button variant="outline" className="w-full" size="lg" onClick={handleGoogle}>
                  <svg className="h-4 w-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </Button>

                <p className="text-center text-xs sm:text-sm text-gray-400 mt-4 max-sm:mt-3">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={() => { setIsSignup(!isSignup); setResetSent(false); }} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </>
            )}

            <p className="text-center text-[10px] text-gray-600 mt-5 leading-relaxed">
              By signing in to Atlas Coup, you agree to our{' '}
              <a href="/terms" className="text-primary-400 hover:text-primary-300 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary-400 hover:text-primary-300 underline">Privacy Policy</a>.
            </p>
            <p className="text-center mt-4">
              <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">&larr; Back to home</a>
            </p>
          </div>

          <div className="hidden lg:flex lg:w-[62%] items-center justify-center p-6">
            <img src="/trackerr.png" alt="Atlas Coup Preview" className="w-full h-full max-h-[62vh] object-contain rounded-lg shadow-2xl" />
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {showCaptchaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowCaptchaModal(false); setCaptchaToken(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass border border-white/10 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-400/15 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary-300" />
              </div>
              <h2 className="text-lg font-bold mb-1">Verify You're Human</h2>
              <p className="text-sm text-gray-400 mb-6">Complete the captcha to create your account.</p>

              <div ref={captchaModalRef} className="flex justify-center mb-5" />

              <Button
                onClick={() => { setShowCaptchaModal(false); handleAuth({ preventDefault: () => {} }); }}
                className="w-full"
                size="lg"
                disabled={!captchaToken}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Login;
