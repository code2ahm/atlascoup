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
  Menu,
  X,
  Github,
  Heart,
  Brain,
  Zap,
  ChevronDown,
  Twitter,
} from "lucide-react";
import useAuthStore from "../store/authStore";

function ParticlesBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 172, 254, ${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
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
      desc: "Build and maintain daily habits with visual streak tracking and monthly calendar views.",
      color: "#4facfe",
      detail: [
        "Daily check-ins",
        "Monthly calendar heatmap",
        "Streak counters",
        "Habit health score",
      ],
    },
    {
      icon: Target,
      title: "Goal Setting",
      desc: "Set long-term goals with milestones and quarterly roadmaps that keep you on track.",
      color: "#8b5cf6",
      detail: [
        "Milestone breakdowns",
        "Quarterly roadmaps",
        "Progress rings",
        "Deadline reminders",
      ],
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      desc: "Get deep insights with health scores, completion rates, and personalized improvement tips.",
      color: "#2dd4bf",
      detail: [
        "Completion rate charts",
        "Health score trends",
        "Weekly summaries",
        "Personalized tips",
      ],
    },
    {
      icon: BookOpen,
      title: "Journal & Mood",
      desc: "Capture your thoughts, track your emotional journey, and discover patterns over time.",
      color: "#f472b6",
      detail: [
        "Daily journal entries",
        "Mood tracking",
        "Emotional patterns",
        "Reflection prompts",
      ],
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
    { href: "#reviews", label: "Reviews" },
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
      <ParticlesBackground />

      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.nav
          layout
          animate={{ scale: scrolled ? 0.92 : 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`pointer-events-auto flex items-center rounded-full transition-all duration-300 ease-out
            ${
              scrolled
                ? "bg-[#050811]/85 backdrop-blur-2xl shadow-2xl shadow-black/50 py-2.5 px-4 sm:px-6 border border-white/[0.06] gap-4 sm:gap-6"
                : "bg-[#050811]/70 backdrop-blur-xl shadow-lg shadow-black/30 py-3.5 px-5 sm:px-8 border border-white/[0.04] gap-5 sm:gap-8"
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

          <div className="w-px h-7 bg-white/10" />

          <div className="hidden md:flex items-center gap-1 px-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href.slice(1));
                }}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:bg-white/5 hover:text-white ${scrolled ? "text-sm" : "text-base"} text-[#94a3b8]`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block w-px h-7 bg-white/10" />

          <div
            className={`hidden sm:block transition-all duration-300 ${scrolled ? "scale-90" : "scale-100"}`}
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
            className="flex md:hidden items-center justify-center p-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[#94a3b8] hover:text-white hover:bg-white/[0.1] transition-all duration-200"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu className="h-5 w-5" />
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

      <section className="min-h-screen flex items-center px-[5%] pt-24 pb-20 max-w-[1300px] mx-auto relative z-[1]">
        <div className="grid lg:grid-cols-2 gap-16 w-full items-center">
          <div>
            <div className="flex justify-center lg:justify-start h-[56px] overflow-hidden relative mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeBadge}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="flex items-center gap-2 px-7 py-3 rounded-full bg-[rgba(45,212,191,0.08)] border border-[rgba(45,212,191,0.2)] text-[#2dd4bf]"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] animate-pulse shrink-0" />
                  {(() => {
                    const Icon = badges[activeBadge].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {badges[activeBadge].text}
                </motion.div>
              </AnimatePresence>
            </div>

            <h1 className="text-[clamp(36px,4.5vw,58px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5 text-center lg:text-left">
              Build Better Habits.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4facfe] to-[#00f2fe]">
                Achieve More.
              </span>
            </h1>

            <p className="text-[17px] text-[#94a3b8] max-w-[460px] mx-auto lg:mx-0 leading-relaxed mb-9 text-center lg:text-left">
              Track habits, manage tasks, set long-term goals, and journal your
              journey — all in one beautiful, insight-driven dashboard.
            </p>

            <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start mb-10">
              {user ? (
                <button
                  onClick={() => navigate("/tracker")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200 active:scale-[0.98]"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200 active:scale-[0.98]"
                  >
                    Start Free <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-medium text-[#94a3b8] border border-white/10 hover:border-[#4facfe]/50 hover:text-white transition-all duration-200"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
              {[
                "Habit Streaks",
                "Smart Analytics",
                "Pomodoro Timer",
                "Goal Milestones",
              ].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] text-[#94a3b8] bg-white/[0.04] border border-white/[0.08] hover:border-[rgba(99,180,255,0.3)] transition-colors duration-200"
                >
                  <Sparkles className="h-3 w-3 text-[#4facfe]" /> {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[500px]">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#4facfe]/10 via-transparent to-[#2563eb]/10 rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative rounded-[20px] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <div className="flex-1 mx-3 bg-white/[0.05] border border-white/[0.06] rounded-md px-3 py-1 text-[11px] text-[#64748b]">
                    atlcoup.web.app/tracker
                  </div>
                </div>
                <div className="relative">
                  <img
                    src="/trackerr.png"
                    alt="Atlas Coup tracker"
                    className="w-full block"
                  />
                  <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#050811]/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#050811]/60 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-[5%] py-[100px] max-w-[1300px] mx-auto relative z-[1]">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
              App Preview
            </span>
            <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold mb-4 leading-[1.15]">
              Your personal growth dashboard
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8 max-w-[420px]">
              Everything you need to track habits, manage goals, and understand
              your progress — in one beautifully crafted space.
            </p>
            <div className="space-y-3">
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
              ].map(({ icon: Icon, color, label, sub }) => (
                <div
                  key={label}
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
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-[20px] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <div className="flex-1 mx-3 bg-white/[0.05] border border-white/[0.06] rounded-md px-3 py-1 text-[11px] text-[#64748b]">
                  atlcoup.web.app/tracker
                </div>
              </div>
              <div className="relative">
                <img
                  src="/preview.png"
                  alt="Atlas Coup dashboard preview"
                  className="w-full block"
                />
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#050811]/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#050811]/60 to-transparent pointer-events-none" />
              </div>
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
            className="grid lg:grid-cols-2 gap-8 items-center bg-white/[0.04] border rounded-[28px] p-8 lg:p-12"
            style={{ borderColor: `${active.color}30` }}
          >
            <div>
              <div
                className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mb-6"
                style={{ background: `${active.color}18`, color: active.color }}
              >
                <ActiveIcon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{active.title}</h3>
              <p className="text-[#94a3b8] leading-relaxed mb-8">
                {active.desc}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${active.color}, ${active.color}aa)`,
                }}
              >
                Try it free <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {active.detail.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-[14px] bg-white/[0.04] border border-white/[0.06]"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: active.color }}
                  />
                  <span className="text-sm text-[#94a3b8]">{d}</span>
                </div>
              ))}
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
        <div
          className="flex gap-5 overflow-x-auto pb-4 -mx-[5%] px-[5%] snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {whyItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[75vw] snap-start sm:min-w-0 flex flex-col gap-4 bg-white/[0.04] border border-white/[0.08] rounded-[20px] p-8 hover:border-[rgba(79,172,254,0.3)] hover:bg-white/[0.07] hover:-translate-y-2.5 transition-all duration-300"
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
      </section>

      <section
        id="reviews"
        className="px-[5%] py-[120px] max-w-[1300px] mx-auto relative z-[1]"
      >
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
            Testimonials
          </span>
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold mb-4">
            Loved by Users
          </h2>
          <p className="text-[#94a3b8] max-w-[500px] mx-auto">
            See what our community has to say about their experience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-[20px] p-7 hover:border-[rgba(99,180,255,0.3)] hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="text-[#fbbf24] text-sm tracking-wider mb-3.5">
                {"★".repeat(r.stars)}
              </div>
              <p className="text-[15px] text-white italic leading-relaxed mb-5">
                "{r.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4facfe] to-[#2563eb] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {r.initial}
                </div>
                <div>
                  <strong className="block text-sm">{r.name}</strong>
                  <span className="text-xs text-[#64748b]">{r.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-[5%] py-20 max-w-[1300px] mx-auto relative z-[1] mb-16">
        <div className="relative bg-[#080d1a]/90 border border-white/[0.08] rounded-[40px] p-16 sm:p-20 lg:p-24 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-[#4facfe]/10 to-transparent pointer-events-none" />
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-5 relative">
            Get Started
          </span>
          <h2 className="text-[clamp(28px,4vw,50px)] font-bold mb-5 relative">
            Ready to Transform Your Life?
          </h2>
          <p className="text-[17px] text-[#94a3b8] max-w-[600px] mx-auto mb-10 leading-relaxed relative">
            Join thousands of users who are already building better habits and
            achieving their goals with Atlas Coup.
          </p>
          <div className="relative">
            {user ? (
              <button
                onClick={() => navigate("/tracker")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 hover:shadow-[#4facfe]/40 transition-all duration-200"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="px-[5%] py-[120px] max-w-[800px] mx-auto relative z-[1]"
      >
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] mb-4">
            FAQ
          </span>
          <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white/[0.04] border border-white/[0.08] rounded-[20px] transition-all duration-300 ${openFaq === i ? "border-[rgba(79,172,254,0.3)]" : ""}`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-sm font-medium text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#64748b] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="px-6 pb-6 text-sm text-[#94a3b8] leading-relaxed">
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
                  { icon: Twitter, href: "https://x.com/ahm4sure" },
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
                to="/pp.html"
                className="block text-sm text-[#64748b] hover:text-white mb-3 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/tos.html"
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
