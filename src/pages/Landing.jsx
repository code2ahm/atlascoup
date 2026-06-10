import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Target,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
  Github,
  Heart,
  Brain,
  Zap,
  ChevronDown,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";

const typewriterPhrases = [
  "Your journey starts with Atlas Coup",
  "Track habits. Build streaks. Grow daily.",
  "Your all-in-one personal growth hub",
  "Small steps lead to big changes",
];

function TypewriterText() {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = typewriterPhrases[idx];
    const timeout = deleting ? 30 : 60;

    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => {
        setText(current.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, timeout);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setText(current.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, timeout);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx((idx + 1) % typewriterPhrases.length);
    }
  }, [charIdx, deleting, idx]);

  return (
    <div className="h-[24px] mb-4 text-center lg:text-left">
      <span className="text-[13px] text-[#4facfe]/80 font-medium">
        {text}<span className="animate-pulse">|</span>
      </span>
    </div>
  );
}

function GradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute top-[-5%] left-[-5%] w-[800px] h-[800px] bg-[#4facfe]/10 rounded-full blur-[200px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[800px] h-[800px] bg-[#2563eb]/8 rounded-full blur-[200px]" />
      <div className="absolute top-[20%] left-[40%] w-[400px] h-[400px] bg-[#8b5cf6]/6 rounded-full blur-[180px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:60px_60px]" />
    </div>
  );
}

function Landing() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeBadge, setActiveBadge] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeWhy, setActiveWhy] = useState(0);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const ctx = canvas.getContext('2d');
    const resize = () => {
      const r = card.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    resize();

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 8 : 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      r: Math.random() * (isMobile ? 1.5 : 2) + (isMobile ? 0.5 : 0.8),
      alpha: Math.random() * 0.35 + 0.15,
    }));

    const animate = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const px = particles.map(p => p.x * w);
      const py = particles.map(p => p.y * h);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = px[i] - px[j], dy = py[i] - py[j];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(px[j], py[j]);
            ctx.strokeStyle = `rgba(79, 172, 254, ${(1 - dist / 150) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(px[i], py[i], p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 172, 254, ${p.alpha})`;
        ctx.fill();
      });

      const now = Date.now();
      trailRef.current = trailRef.current.filter(t => now - t.time < 600);
      if (trailRef.current.length > 2) {
        for (let i = 1; i < trailRef.current.length - 1; i++) {
          const prev = trailRef.current[i - 1];
          const curr = trailRef.current[i];
          const next = trailRef.current[i + 1];
          const progress = i / trailRef.current.length;
          const cp1x = prev.x + (curr.x - prev.x) * 0.5;
          const cp1y = prev.y + (curr.y - prev.y) * 0.5;
          const cp2x = curr.x + (next.x - curr.x) * 0.5;
          const cp2y = curr.y + (next.y - curr.y) * 0.5;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          ctx.strokeStyle = `rgba(79, 172, 254, ${progress * 0.45})`;
          ctx.lineWidth = progress * 2.5 + 0.5;
          ctx.stroke();
        }
      }

      const mx = mouseRef.current.x, my = mouseRef.current.y;
      if (mx >= 0 && my >= 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 20);
        grad.addColorStop(0, 'rgba(79, 172, 254, 0.6)');
        grad.addColorStop(0.4, 'rgba(79, 172, 254, 0.15)');
        grad.addColorStop(1, 'rgba(79, 172, 254, 0)');
        ctx.beginPath();
        ctx.arc(mx, my, 20, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79, 172, 254, 0.5)';
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      trailRef.current.push({ x: mouseRef.current.x, y: mouseRef.current.y, time: Date.now() });
      if (trailRef.current.length > 40) trailRef.current.shift();
    };
    card.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      card.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "dark");
    return () => {
      if (prev) document.documentElement.setAttribute("data-theme", prev);
      else document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBadge((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const badges = [
    { text: "Track Daily Habits", icon: CheckCircle },
    { text: "Set Long-term Goals", icon: Target },
    { text: "Analyze Your Growth", icon: TrendingUp },
  ];

  const whyItems = [
    {
      number: "01",
      icon: Brain,
      title: "Science-Backed",
      desc: "Built on proven habit formation techniques and behavioral psychology principles.",
    },
    {
      number: "02",
      icon: Zap,
      title: "Beautifully Simple",
      desc: "Clean, intuitive interface that makes tracking your goals feel effortless.",
    },
    {
      number: "03",
      icon: Heart,
      title: "Privacy First",
      desc: "Your data is encrypted and secure with enterprise-grade Firebase infrastructure.",
    },
    {
      number: "04",
      icon: Sparkles,
      title: "Always Improving",
      desc: "Regular updates with new features based on community feedback and research.",
    },
  ];

  const features = [
    {
      icon: CheckCircle,
      title: "Habit Tracking",
      desc: "Build and maintain daily habits with visual streak tracking, monthly calendar heatmaps, and smart streak counters that keep you motivated.",
      color: "#4facfe",
      detail: [
        "Daily check-ins",
        "Monthly calendar heatmap",
        "Streak counters",
        "Habit health score",
      ],
      preview: (color) => (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="w-full aspect-square rounded-sm" style={{ background: i % 3 === 0 ? `${color}66` : i % 2 === 0 ? `${color}33` : 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ),
    },
    {
      icon: Target,
      title: "Goal Setting",
      desc: "Set ambitious long-term goals and break them into achievable milestones with quarterly roadmaps and progress tracking.",
      color: "#8b5cf6",
      detail: [
        "Milestone breakdowns",
        "Quarterly roadmaps",
        "Progress rings",
        "Deadline reminders",
      ],
      preview: (color) => (
        <div className="space-y-3">
          {[70, 45, 90, 60].map((pct, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] text-[#94a3b8] mb-1">
                <span>Goal {i + 1}</span><span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      desc: "Unlock deep insights into your performance with health scores, completion rate trends, and personalized tips to keep improving.",
      color: "#2dd4bf",
      detail: [
        "Completion rate charts",
        "Health score trends",
        "Weekly summaries",
        "Personalized tips",
      ],
      preview: (color) => (
        <div className="flex items-end gap-1.5 h-24">
          {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: `${h}%`, background: `linear-gradient(to top, ${color}, ${color}66)` }} />
          ))}
        </div>
      ),
    },
    {
      icon: BookOpen,
      title: "Journal & Mood",
      desc: "Capture your daily thoughts, track your emotional journey, and discover meaningful patterns with mood tracking and reflection prompts.",
      color: "#f472b6",
      detail: [
        "Daily journal entries",
        "Mood tracking",
        "Emotional patterns",
        "Reflection prompts",
      ],
      preview: (color) => (
        <div className="space-y-3">
          {[
            { mood: 4, text: "Great day! Hit all my goals." },
            { mood: 3, text: "Steady progress this week." },
            { mood: 5, text: "Cracked my target early!" },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color, opacity: entry.mood / 5 + 0.3 }} />
              <div className="flex-1 h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full" style={{ width: `${entry.mood * 20}%`, background: `${color}50` }} />
              </div>
              <span className="text-[9px] text-[#64748b] w-14 text-right truncate">{entry.text}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const reviews = [
    {
      name: "Alex M.",
      role: "Freelancer",
      initial: "A",
      text: "This completely transformed how I track my daily habits. The streak system keeps me motivated every single day!",
      stars: 5,
    },
    {
      name: "Sarah K.",
      role: "Student",
      initial: "S",
      text: "The Pomodoro timer + task list combo is exactly what I needed for my study sessions. Game changer!",
      stars: 5,
    },
    {
      name: "James R.",
      role: "Developer",
      initial: "J",
      text: "Clean UI, great analytics. The health score gave me real perspective on my consistency over time.",
      stars: 5,
    },
  ];

  const faqs = [
    {
      q: "Is Atlas Coup free to use?",
      a: "Yes! The core features including habit tracking, task management, goal setting, and journaling are completely free with no hidden charges.",
    },
    {
      q: "Can I sync my data across devices?",
      a: "Absolutely. All your data is synced in real-time through Firebase, so you can access your dashboard from any device, anywhere.",
    },
    {
      q: "How is my personal data protected?",
      a: "Your data is encrypted in transit and at rest using Firebase's enterprise-grade security infrastructure. We never share your data with third parties.",
    },
    {
      q: "Can I export my analytics and reports?",
      a: "Analytics and habit data can be viewed in detailed charts and reports within the app, with comprehensive insights into your progress.",
    },
    {
      q: "What makes Atlas Coup different?",
      a: "Unlike generic habit trackers, Atlas Coup combines habits, tasks, goals, and journaling into one cohesive dashboard with smart analytics.",
    },
  ];

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#why", label: "Why Atlas Coup" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#faq", label: "FAQ" },
  ];

  const scrollTo = (id) => {
    setMobileMenu(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const active = features[activeFeature];
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen bg-[#050811] text-white font-quicksand overflow-x-hidden">
      <GradientBackground />

      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.nav
          animate={{ scale: scrolled ? 0.92 : 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`pointer-events-auto flex items-center justify-between rounded-full transition-all duration-300 ease-out
            ${
              scrolled
                ? "w-[92%] md:w-[58%] bg-[#0b0f1a]/90 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] py-2.5 px-4 sm:px-6 border border-white/[0.12]"
                : "w-[92%] md:w-[78%] lg:w-[72%] bg-[#0b0f1a]/80 backdrop-blur-xl shadow-lg shadow-black/30 py-3.5 px-5 sm:px-8 border border-white/[0.08]"
            }`}
        >
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/favicon.svg"
              alt="Atlas Coup"
              className={`transition-all duration-300 ${scrolled ? "h-7 w-auto" : "h-9 w-auto"}`}
            />
            <span
              className={`text-white font-semibold transition-all duration-300 ${scrolled ? "text-sm" : "text-base"}`}
            >
              Atlas Coup
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-center flex-1 gap-1 px-2">
            <div className="w-px h-7 bg-white/10" />
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href.slice(1));
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:bg-white/5 hover:text-white ${scrolled ? "text-sm" : "text-sm"} text-[#94a3b8]`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="w-px h-7 bg-white/10" />
          </div>

          <div
            className={`hidden sm:block shrink-0 transition-all duration-300 ${scrolled ? "scale-90" : "scale-100"}`}
          >
            {user ? (
              <button
                onClick={() => navigate("/tracker")}
                className={`whitespace-nowrap rounded-full font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200 hover:scale-105 ${scrolled ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"}`}
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className={`whitespace-nowrap rounded-full font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200 hover:scale-105 ${scrolled ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"}`}
              >
                Get Started
              </button>
            )}
          </div>

          <button
            className="flex md:hidden items-center justify-center ml-auto w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#94a3b8] hover:text-white hover:border-[#4facfe]/40 hover:bg-[#4facfe]/10 transition-all duration-200 group"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <div className="flex flex-col items-center justify-center gap-[3.5px]">
              <span
                className={`block w-4 h-[1.5px] rounded-full bg-current transition-all duration-300 ${mobileMenu ? "rotate-45 translate-y-[5px]" : ""}`}
              />
              <span
                className={`block w-4 h-[1.5px] rounded-full bg-current transition-all duration-300 ${mobileMenu ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-4 h-[1.5px] rounded-full bg-current transition-all duration-300 ${mobileMenu ? "-rotate-45 -translate-y-[5px]" : ""}`}
              />
            </div>
          </button>
        </motion.nav>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#050811]/98 backdrop-blur-2xl flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-white/[0.06]">
              <Link
                to="/"
                className="flex items-center gap-2.5"
                onClick={() => setMobileMenu(false)}
              >
                <img
                  src="/favicon.svg"
                  alt="Atlas Coup"
                  className="h-9 w-auto"
                />
                <span className="text-white font-semibold text-base">
                  Atlas Coup
                </span>
              </Link>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#94a3b8] hover:text-white transition-all"
                onClick={() => setMobileMenu(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col flex-1 px-6 pt-8 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href.slice(1));
                  }}
                  className="px-4 py-4 text-lg font-medium text-[#94a3b8] hover:text-white hover:bg-white/[0.04] rounded-xl transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="px-6 pb-12">
              {user ? (
                <button
                  onClick={() => {
                    navigate("/tracker");
                    setMobileMenu(false);
                  }}
                  className="w-full py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb]"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenu(false);
                  }}
                  className="w-full py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb]"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="min-h-screen flex items-center px-[5%] pt-36 pb-20 max-w-[1300px] mx-auto relative z-[1]">
        <div className="grid lg:grid-cols-[1.1fr_1.5fr] gap-12 lg:gap-16 w-full items-center">
          <div className="max-w-[520px] lg:max-w-none">
            <div className="flex justify-center lg:justify-start h-[36px] overflow-hidden relative mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeBadge}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[rgba(45,212,191,0.08)] border border-[rgba(45,212,191,0.2)] text-[#2dd4bf] text-xs"
                >
                  {(() => {
                    const Icon = badges[activeBadge].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {badges[activeBadge].text}
                </motion.div>
              </AnimatePresence>
            </div>

            <h1 className="text-[clamp(32px,3.8vw,50px)] font-bold leading-[1.15] tracking-[-0.02em] mb-4 text-center lg:text-left">
              Build Better Habits.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4facfe] to-[#00f2fe]">
                Achieve More.
              </span>
            </h1>

            <TypewriterText />
            <p className="text-[15px] text-[#94a3b8] max-w-[460px] mx-auto lg:mx-0 leading-relaxed mb-8 text-center lg:text-left">
              Track habits, manage tasks, set long-term goals, and journal your
              journey — all in one beautiful, insight-driven dashboard.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              {user ? (
                <button
                  onClick={() => navigate("/tracker")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200 active:scale-[0.98]"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200 active:scale-[0.98]"
                  >
                    Start Free <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollTo("features")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-[#94a3b8] border border-white/10 hover:border-[#4facfe]/50 hover:text-white transition-all duration-200"
                  >
                    Features
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mb-6">
              {[
                { label: "Active Users", value: "2K+" },
                { label: "Habits Tracked", value: "50K+" },
                { label: "Avg. Streak", value: "12d" },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-[#64748b]">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="lg:hidden flex items-center justify-center mt-4">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#4facfe]/20 via-transparent to-[#2563eb]/20 rounded-2xl blur-2xl pointer-events-none" />
                <img src="/trackerr.png" alt="Atlas Coup tracker" className="w-full block relative rounded-xl" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full">
              <div className="absolute -inset-6 bg-gradient-to-br from-[#4facfe]/15 via-transparent to-[#2563eb]/15 rounded-3xl blur-3xl pointer-events-none" />
              <img
                src="/trackerr.png"
                alt="Atlas Coup tracker"
                className="w-full block relative"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-[5%] py-[100px] max-w-[1300px] mx-auto relative z-[1]">
        <div className="mb-10 lg:mb-14 text-center lg:text-left">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
            App Preview
          </span>
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold mb-4 leading-[1.15]">
            Your personal growth dashboard
          </h2>
          <p className="text-[#94a3b8] leading-relaxed text-sm sm:text-base">
            Everything you need to track daily habits, manage tasks, set long-term goals, journal your thoughts, and understand
            your progress through smart analytics — all beautifully integrated into one seamless experience.
          </p>
        </div>

        <div className="lg:flex lg:gap-14 lg:items-start">
          <div className="lg:w-[44%] space-y-3">
            {[
              {
                icon: CheckCircle,
                color: "#4facfe",
                label: "Streak tracking",
                sub: "Visual habit streaks with monthly calendar views",
              },
              {
                icon: TrendingUp,
                color: "#2dd4bf",
                label: "Smart analytics",
                sub: "Health scores, completion rates, and trend insights",
              },
              {
                icon: Target,
                color: "#8b5cf6",
                label: "Goal milestones",
                sub: "Long-term goals broken into trackable steps",
              },
              {
                icon: Zap,
                color: "#f472b6",
                label: "Pomodoro timer",
                sub: "Focus sessions built right into your workflow",
              },
              {
                icon: BookOpen,
                color: "#f472b6",
                label: "Daily journaling",
                sub: "Capture thoughts, track moods, and spot emotional patterns",
              },
            ].map(({ icon: Icon, color, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex items-center gap-4 p-4 rounded-[14px] bg-white/[0.04] border border-white/[0.08] hover:border-[rgba(79,172,254,0.3)] transition-colors duration-200"
              >
                <div
                  className="w-[38px] h-[38px] rounded-[10px] bg-white/[0.05] flex items-center justify-center shrink-0"
                  style={{ color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 lg:mt-0 lg:w-[55%] lg:self-stretch">
            <div className="rounded-[20px] bg-white/[0.03] border border-white/[0.08] overflow-hidden h-full flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <div className="flex-1 mx-3 bg-white/[0.05] border border-white/[0.06] rounded-md px-3 py-1 text-[11px] text-[#64748b]">
                  atlcoup.web.app/tracker
                </div>
              </div>
              <button onClick={() => navigate(user ? '/tracker' : '/login')} className="relative w-full flex-1 text-left">
                <img
                  src="/preview.png"
                  alt="Atlas Coup dashboard preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#050811]/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#050811]/60 to-transparent pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="px-[5%] py-[120px] max-w-[1300px] mx-auto relative z-[1]"
      >
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
            Features
          </span>
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-[#94a3b8] max-w-[500px] mx-auto">
            A complete toolkit for tracking your personal development journey.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeFeature === i
                    ? "border-transparent"
                    : "text-[#94a3b8] bg-white/[0.03] border-white/[0.08] hover:text-white hover:border-white/20"
                }`}
                style={
                  activeFeature === i
                    ? {
                        background: `linear-gradient(135deg, ${f.color}33, ${f.color}18)`,
                        borderColor: `${f.color}50`,
                        color: f.color,
                      }
                    : {}
                }
              >
                <Icon className="h-4 w-4" />
                {f.title}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col lg:flex-row gap-6 sm:gap-8 bg-white/[0.04] border rounded-[20px] lg:rounded-[24px] p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto"
            style={{ borderColor: `${active.color}30` }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4 sm:gap-5">
                <div
                  className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ background: `${active.color}18`, color: active.color }}
                >
                  <ActiveIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                      {active.title}
                    </h3>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">
                      {active.desc}
                    </p>
                  </div>

                  <div className="my-4 border-t border-white/[0.06]" />

                  <div className="space-y-1">
                    {active.detail.map((d, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: active.color }}
                        />
                        <span className="text-sm text-[#94a3b8]">{d}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${active.color}, ${active.color}aa)`,
                      }}
                    >
                      Try it free <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-[200px] shrink-0 items-center">
              <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                {active.preview(active.color)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <section
        id="why"
        className="px-[5%] py-[120px] max-w-[1300px] mx-auto relative z-[1]"
      >
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
            Why Atlas Coup
          </span>
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold mb-4">
            Built Different
          </h2>
          <p className="text-[#94a3b8] max-w-[500px] mx-auto">
            Every feature is designed with intention to help you build lasting
            habits and achieve meaningful goals.
          </p>
        </div>
        <div className="sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="hidden sm:flex flex-col gap-4 bg-white/[0.04] border border-white/[0.08] rounded-[20px] p-8 hover:border-[rgba(79,172,254,0.3)] hover:bg-white/[0.07] hover:-translate-y-2.5 transition-all duration-300"
              >
                <p className="text-[13px] font-extrabold text-[#64748b] tracking-widest">
                  {item.number}
                </p>
                <div className="w-[50px] h-[50px] rounded-[14px] bg-white/[0.05] flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#4facfe] opacity-90" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="sm:hidden">
          <div
            onTouchStart={(e) => {
              e.currentTarget.dataset.touchX = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const start = parseFloat(e.currentTarget.dataset.touchX || "0");
              const end = e.changedTouches[0].clientX;
              const diff = start - end;
              if (Math.abs(diff) > 40) {
                setActiveWhy((prev) => {
                  if (diff > 0) return Math.min(prev + 1, whyItems.length - 1);
                  return Math.max(prev - 1, 0);
                });
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWhy}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 bg-white/[0.04] border border-white/[0.08] rounded-[20px] p-8"
              >
                <p className="text-[13px] font-extrabold text-[#64748b] tracking-widest">
                  {whyItems[activeWhy].number}
                </p>
                <div className="w-[50px] h-[50px] rounded-[14px] bg-white/[0.05] flex items-center justify-center">
                  {(() => {
                    const Icon = whyItems[activeWhy].icon;
                    return (
                      <Icon className="h-6 w-6 text-[#4facfe] opacity-90" />
                    );
                  })()}
                </div>
                <h3 className="text-lg font-semibold">
                  {whyItems[activeWhy].title}
                </h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {whyItems[activeWhy].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-2 mt-5">
            {whyItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveWhy(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeWhy === i ? "w-6 bg-[#4facfe]" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-[5%] py-[100px] lg:py-[120px] max-w-[1300px] mx-auto relative z-[1]"
      >
        <div className="text-center mb-14 lg:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
            How It Works
          </span>
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold mb-4">
            Start in Three Steps
          </h2>
          <p className="text-[#94a3b8] max-w-[500px] mx-auto">
            Get started with Atlas Coup and build better habits in minutes.
          </p>
        </div>

        <div className="hidden lg:flex items-start justify-center gap-16 xl:gap-24">
          {[
            { num: "01", title: "Create Your Account", desc: "Sign up for free and set up your profile. No credit card required — just you and your goals." },
            { num: "02", title: "Set Up Your Dashboard", desc: "Add your habits, create tasks, set long-term goals, and start journaling your thoughts." },
            { num: "03", title: "Track & Improve", desc: "Check in daily, watch your streaks grow, and use analytics to understand your progress." },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: -80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.4, type: "spring", stiffness: 300, damping: 15, mass: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center">
                <span className="text-sm font-bold text-[#4facfe]">{item.num}</span>
              </div>
              <div className="mt-5 text-center max-w-[260px]">
                <h3 className="text-base font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:hidden space-y-0 max-w-md mx-auto">
          {[
            {
              num: "01",
              title: "Create Your Account",
              desc: "Sign up for free and set up your profile. No credit card required — just you and your goals.",
            },
            {
              num: "02",
              title: "Set Up Your Dashboard",
              desc: "Add your habits, create tasks, set long-term goals, and start journaling your thoughts.",
            },
            {
              num: "03",
              title: "Track & Improve",
              desc: "Check in daily, watch your streaks grow, and use analytics to understand your progress.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex items-start"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.12] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#4facfe]">
                    {item.num}
                  </span>
                </div>
                {i < 2 && (
                  <div className="w-px h-10 border-l border-dashed border-white/[0.1]" />
                )}
              </div>
              <div className="ml-4 pb-8">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-[5%] py-16 sm:py-20 max-w-[1300px] mx-auto relative z-[1] mb-16">
        <div ref={cardRef} className="relative bg-[#080d1a]/90 border border-white/[0.08] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] p-8 sm:p-14 lg:p-20 text-center overflow-hidden cursor-none"
          onMouseLeave={() => { mouseRef.current.x = -100; mouseRef.current.y = -100; trailRef.current = []; }}>
          <div className="absolute inset-0 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] bg-gradient-to-br from-[#4facfe]/12 via-transparent to-[#2563eb]/12 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4 sm:mb-5 relative">
            Get Started
          </span>
          <h2 className="text-[clamp(24px,4vw,46px)] font-bold mb-3 sm:mb-5 relative leading-tight">
            Ready to Transform Your Life?
          </h2>
          <p className="text-sm sm:text-[17px] text-[#94a3b8] max-w-[500px] mx-auto mb-8 sm:mb-10 leading-relaxed relative">
            Your habits, goals, and journal — all in one place. Start building
            the life you want today.
          </p>
          <div className="relative">
            {user ? (
              <button
                onClick={() => navigate("/tracker")}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="px-[5%] py-[80px] sm:py-[120px] max-w-[800px] mx-auto relative z-[1]"
      >
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-3 sm:mb-4">
            FAQ
          </span>
          <h2 className="text-[clamp(22px,3.5vw,48px)] font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white/[0.04] border border-white/[0.08] rounded-[16px] sm:rounded-[20px] transition-all duration-300 ${openFaq === i ? "border-[rgba(79,172,254,0.3)]" : ""}`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
              >
                <span className="text-xs sm:text-sm font-medium text-white pr-3 sm:pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#64748b] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.08] px-[5%] pt-20 pb-8 bg-[#050811]/80 relative z-[1]">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-12 lg:gap-16 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/favicon.svg"
                  alt="Atlas Coup"
                  className="h-10 w-auto"
                />
                <span className="text-white font-semibold text-xl">
                  Atlas Coup
                </span>
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed mb-5 max-w-[300px]">
                Your all-in-one personal development platform. Track habits,
                manage goals, and analyze your growth journey.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Github, href: "https://github.com/code2ahm" },
                  {
                    icon: () => (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                    href: "https://x.com/ahm4sure",
                  },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[38px] h-[38px] rounded-[10px] border border-white/[0.08] flex items-center justify-center text-[#64748b] hover:border-[#4facfe] hover:text-[#4facfe] hover:bg-[rgba(79,172,254,0.06)] transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-5">
                Product
              </h4>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("features");
                }}
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#why"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("why");
                }}
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Why Atlas Coup
              </a>
              <a
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("reviews");
                }}
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Reviews
              </a>
              <Link
                to="/login"
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-5">
                Company
              </h4>
              <a
                href="mailto:mru3337@gmail.com"
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Contact
              </a>
              <Link
                to="/privacy"
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <a
                href="/comingsoon.html"
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Coming Soon
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#64748b]">
            <p>
              &copy; {new Date().getFullYear()} Atlas Coup. All rights reserved.
            </p>
            <p>
              Meet the developer -{" "}
              <a
                href="https://devahm.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4facfe] hover:underline"
              >
                Ahm
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
