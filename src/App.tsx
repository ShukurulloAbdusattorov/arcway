import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CreditCard,
  Flame,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  Moon,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const navItems = [
  "Overview",
  "Learn",
  "Practice",
  "Leaderboard",
  "Profile",
  "Pricing",
];

const lessons = [
  {
    title: "Linear equations",
    detail: "Lesson 04  /  Foundations",
    progress: 72,
    tone: "blue",
  },
  {
    title: "Quadratic functions",
    detail: "Lesson 05  /  Heart of Algebra",
    progress: 18,
    tone: "coral",
  },
  {
    title: "Data and probability",
    detail: "Lesson 06  /  Problem Solving",
    progress: 0,
    tone: "yellow",
  },
];

const leaderboard = [
  ["01", "Maya R.", "1,248 XP", "up"],
  ["02", "Jordan K.", "1,110 XP", "same"],
  ["03", "You", "986 XP", "up"],
  ["04", "Sofia L.", "934 XP", "down"],
];

const scoreBars = [68, 71, 70, 76, 79, 82, 84];
const topicOrbit = ["Algebra", "Functions", "Geometry", "Statistics", "Trig", "Word problems"];

type PublicScreen = "landing" | "login" | "signup";

function PublicPage({ screen, onScreenChange, onAuthenticated }: { screen: PublicScreen; onScreenChange: (screen: PublicScreen) => void; onAuthenticated: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = screen === "signup" ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(`http://localhost:8787${endpoint}`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(screen === "signup" ? { fullName, email, password } : { email, password }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to continue.");
      if (screen === "signup") {
        onScreenChange("login");
        setError("Account created. Sign in to continue.");
      } else onAuthenticated();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to continue.");
    } finally {
      setBusy(false);
    }
  };

  if (screen === "landing") return <div className="public-site"><nav className="public-nav"><button className="public-brand" onClick={() => onScreenChange("landing")}><span className="brand-mark">A</span>Arcway</button><div><button onClick={() => onScreenChange("login")}>Sign in</button><button className="public-nav-cta" onClick={() => onScreenChange("signup")}>Start free <ArrowRight size={15} /></button></div></nav><main><section className="public-hero"><div><span className="public-kicker">SAT &amp; PSAT MATH, DONE PROPERLY</span><h1>Every practice set moves you toward the next tier.</h1><p>Learn each topic, drill it, then take a real level check. Reach 90% and Arcway opens the next route.</p><div className="public-actions"><button className="public-primary" onClick={() => onScreenChange("signup")}>Start free <ArrowRight size={16} /></button><button className="public-secondary" onClick={() => document.querySelector("#public-how")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button></div></div><div className="public-stage"><div className="public-stage-grid" /><div className="public-curve">y = a(x − h)² + k</div><div className="public-orbit-core">A</div>{["Algebra", "Functions", "Geometry", "Score"].map((label, index) => <span className={`public-orbit orbit-${index}`} key={label}>{label}</span>)}</div></section><section className="public-stats"><div><strong>20</strong><span>questions per level check</span></div><div><strong>22 × 2</strong><span>questions in a full mock</span></div><div><strong>90%</strong><span>to unlock the next tier</span></div></section><section className="public-how" id="public-how"><span className="public-kicker">THE ARCWAY METHOD</span><h2>Four stops on the way up.</h2><div className="public-steps"><article><b>01</b><h3>Learn it</h3><p>Explanations and worked examples before practice.</p></article><article><b>02</b><h3>Practice it</h3><p>Questions at rising difficulty, with feedback.</p></article><article><b>03</b><h3>Level check</h3><p>Twenty questions on the skill alone.</p></article><article><b>04</b><h3>Unlock</h3><p>Reach 90% and open the next tier.</p></article></div></section><section className="public-proof"><div><span className="public-kicker">BUILT FOR THE DIGITAL SAT</span><h2>Practice with the shape of the real exam in mind.</h2><p>Adaptive mocks, Desmos context, live rankings, score projection, and a question board that stays attached to the skill.</p></div><div className="public-proof-panel"><span>YOUR ROUTE</span><strong>1,180</strong><small>predicted math score</small><div className="public-progress"><i /></div><button onClick={() => onScreenChange("signup")}>Build my route <ArrowRight size={15} /></button></div></section></main><footer className="public-footer"><strong>Arcway</strong><span>Focused SAT Math practice for the route ahead.</span><a href="mailto:mavenuzb@gmail.com">Contact the team</a></footer></div>;

  return <div className="auth-page"><div className="auth-visual"><button className="public-brand" onClick={() => onScreenChange("landing")}><span className="brand-mark">A</span>Arcway</button><div><span className="public-kicker">THE CLEARER ROUTE TO TEST DAY</span><h1>{screen === "signup" ? "Start with a route, not a pile of worksheets." : "Welcome back to your route."}</h1><p>Learn deliberately. Practice in context. Know exactly what unlocks next.</p></div><span className="auth-equation">y = mx + b</span></div><form className="auth-card" onSubmit={submit}><button type="button" className="auth-back" onClick={() => onScreenChange("landing")}>← Back to Arcway</button><span className="public-kicker">{screen === "signup" ? "CREATE YOUR ACCOUNT" : "STUDENT SIGN IN"}</span><h2>{screen === "signup" ? "Make your first move." : "Pick up where you left off."}</h2><p className="auth-copy">{screen === "signup" ? "Your free route includes lessons, practice, progress, and leaderboards." : "Your study route is waiting."}</p>{screen === "signup" && <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={screen === "signup" ? "new-password" : "current-password"} minLength={8} required /></label>{error && <p className={error.startsWith("Account") ? "auth-success" : "auth-error"}>{error}</p>}<button className="public-primary auth-submit" disabled={busy}>{busy ? "Working..." : screen === "signup" ? "Create account" : "Sign in"} <ArrowRight size={16} /></button><p className="auth-switch">{screen === "signup" ? "Already have an account?" : "New to Arcway?"} <button type="button" onClick={() => { setError(""); onScreenChange(screen === "signup" ? "login" : "signup"); }}>{screen === "signup" ? "Sign in" : "Start free"}</button></p></form></div>;
}

function App() {
  const [publicScreen, setPublicScreen] = useState<PublicScreen | null>(() => {
    const route = window.location.hash.replace("#", "");
    return route === "landing" || route === "login" || route === "signup" ? route : null;
  });
  const [activeNav, setActiveNav] = useState(() => {
    const requestedPage = window.location.hash.replace("#", "");
    return navItems.includes(requestedPage)
      ? requestedPage
      : "Overview";
  });
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [studyMode, setStudyMode] = useState("Focus");
  const [selectedTrack, setSelectedTrack] = useState<"SAT" | "PSAT">("SAT");
  const [missionDone, setMissionDone] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"receipt" | "provider">(
    "receipt",
  );
  const [receiptEmail, setReceiptEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [premiumActive, setPremiumActive] = useState(false);
  const [cancelScheduled, setCancelScheduled] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [topicRotation, setTopicRotation] = useState(0);
  const [orbitDragging, setOrbitDragging] = useState(false);
  const [orbitDragX, setOrbitDragX] = useState(0);
  const [practiceSession, setPracticeSession] = useState<
    "topic" | "sprint" | "mock" | null
  >(null);
  const [practiceQuestion, setPracticeQuestion] = useState(1);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [practiceComplete, setPracticeComplete] = useState(false);

  if (publicScreen) return <PublicPage screen={publicScreen} onScreenChange={setPublicScreen} onAuthenticated={() => { setPublicScreen(null); setActiveNav("Overview"); }} />;

  const startPractice = (mode: "topic" | "sprint" | "mock") => {
    setPracticeSession(mode);
    setPracticeQuestion(1);
    setPracticeCorrect(0);
    setPracticeComplete(false);
  };

  const answerPractice = (correct: boolean) => {
    const nextCorrect = practiceCorrect + (correct ? 1 : 0);
    setPracticeCorrect(nextCorrect);
    if (practiceQuestion >= 5) {
                  setPracticeComplete(true);
                  if (practiceSession) {
                    void recordPracticeAttempt(practiceSession, nextCorrect);
                  }
      return;
    }
    setPracticeQuestion(practiceQuestion + 1);
  };

  const recordPracticeAttempt = async (mode: "topic" | "sprint" | "mock", correct: number) => {
    await fetch("http://localhost:8787/api/practice/attempts", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, correct, total: 5 }),
    });
  };

  const navIcons = [
    LayoutDashboard,
    BookOpen,
    Target,
    Trophy,
    UserCircle,
    CreditCard,
  ];

  return (
    <div
      className={`${isDark ? "app dark" : "app"} ${sidebarOpen ? "drawer-open" : "drawer-closed"}`}
    >
      <button
        className="drawer-backdrop"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="sidebar">
        <button
          className="drawer-close"
          aria-label="Fold navigation"
          onClick={() => setSidebarOpen(false)}
        >
          <PanelLeftClose size={17} />
        </button>
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>Arcway</span>
        </div>
        <div className="track-label">YOUR TRACK</div>
        <div className="track-switch">
          <strong>SAT Math</strong>
          <span>⌄</span>
        </div>
        <nav aria-label="Main navigation">
          {navItems.map((item, index) => {
            const Icon = navIcons[index];
            return (
              <button
                className={activeNav === item ? "nav-item active" : "nav-item"}
                onClick={() => setActiveNav(item)}
                key={item}
              >
                <span className="nav-icon">
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                {item}
                {item === "Practice" && <span className="nav-badge">2</span>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">JM</div>
            <div>
              <strong>Jamie Morgan</strong>
              <small>Level 7 · Explorer</small>
            </div>
            <span>•••</span>
          </div>
        </div>
      </aside>

      <main
        className={`main-content ${activeNav === "Learn" ? "learn-view" : activeNav === "Practice" ? "practice-view" : ""}`}
      >
        <header className="topbar">
          <div className="top-left">
            <button
              className="menu-button"
              aria-label={sidebarOpen ? "Fold navigation" : "Open navigation"}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <PanelLeftClose size={16} />
              ) : (
                <PanelLeftOpen size={16} />
              )}
            </button>
            <div className="breadcrumbs">
              <span>September 11, 2026</span>
              <span className="dot">·</span>
              <span>Thursday</span>
            </div>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sparkles size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="notification"
              aria-label="Open contact and feedback"
              onClick={() => {
                setActiveNav("Overview");
                window.setTimeout(() => document.querySelector(".contact-band")?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
            >
              <MessageCircle size={18} />
              <span />
            </button>
            <button className="header-avatar" aria-label="Open profile" onClick={() => setActiveNav("Profile")}>JM</button>
          </div>
        </header>
        {activeNav === "Learn" && (
          <section className="learn-page">
            <p className="eyebrow">
              THE LEARNING ROUTE <span className="line" />
            </p>
            <h1>Learn by unlocking.</h1>
            <p className="pricing-intro">
              Every topic moves through introduction, explanation, examples,
              practice, and a 20-question level check.
            </p>
            <div className="track-tabs">
              <button className={selectedTrack === "SAT" ? "track-tab active" : "track-tab"} onClick={() => setSelectedTrack("SAT")}>
                SAT Math <small>Desmos on</small>
              </button>
              <button className={selectedTrack === "PSAT" ? "track-tab active" : "track-tab"} onClick={() => setSelectedTrack("PSAT")}>
                PSAT Math <small>Desmos off</small>
              </button>
            </div>
            <div className="topic-route">
              <article className="topic-lesson current">
                <div className="topic-badge">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="signal-label">CHAPTER 04 · IN PROGRESS</span>
                  <h2>Linear equations</h2>
                  <p>
                    Translate change into a model you can solve with confidence.
                  </p>
                  <div className="topic-meta">
                    <span>72% complete</span>
                    <span>4 of 6 steps</span>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: "72%" }} />
                  </div>
                </div>
                <button
                  className="topic-action"
                  onClick={() => setActiveNav("Overview")}
                >
                  Resume <ArrowRight size={15} />
                </button>
              </article>
              <article className="topic-lesson">
                <div className="topic-badge coral-badge">
                  <Target size={18} />
                </div>
                <div>
                  <span className="signal-label">CHAPTER 05 · NEXT UP</span>
                  <h2>Quadratic functions</h2>
                  <p>See how curves, roots, and models tell a richer story.</p>
                  <div className="topic-meta">
                    <span>18% complete</span>
                    <span>1 of 6 steps</span>
                  </div>
                  <div className="progress-track">
                    <div className="coral-progress" style={{ width: "18%" }} />
                  </div>
                </div>
                <button className="topic-action">
                  Start chapter <ArrowRight size={15} />
                </button>
              </article>
              <article className="topic-lesson locked-lesson">
                <div className="topic-badge muted-badge">
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <span className="signal-label">CHAPTER 06 · LOCKED</span>
                  <h2>Data and probability</h2>
                  <p>Reach 90% on the level check to open this chapter.</p>
                  <div className="unlock-rule">
                    <LockKeyhole size={13} /> Unlock at 90% mastery
                  </div>
                </div>
                <button className="topic-action muted-action">Locked</button>
              </article>
            </div>
            <div className="lesson-method">
              <div>
                <span className="signal-label">THE ARCAWAY METHOD</span>
                <h2>Five beats. One clear win.</h2>
              </div>
              <div className="method-steps">
                <span>
                  <b>01</b>Intro
                </span>
                <span>
                  <b>02</b>Explain
                </span>
                <span>
                  <b>03</b>Examples
                </span>
                <span>
                  <b>04</b>Practice
                </span>
                <span>
                  <b>05</b>Level check
                </span>
              </div>
            </div>
          </section>
        )}
        {activeNav === "Practice" && (
          <section className="practice-page">
            <p className="eyebrow">
              THE PRACTICE ROOM <span className="line" />
            </p>
            <h1>Train with intent.</h1>
            <p className="pricing-intro">
              Short drills for today. Full adaptive mocks for test day.
            </p>
            <div className="practice-tabs">
              <button className="practice-tab active">Topic drills</button>
              <button className="practice-tab">Full mocks</button>
              <button className="practice-tab">My mistakes</button>
            </div>
            <div className="practice-options">
              <article className="practice-option featured-option">
                <div className="option-icon">
                  <Target size={20} />
                </div>
                <span className="signal-label">RECOMMENDED</span>
                <h2>Weak spot rescue</h2>
                <p>
                  12 questions focused on quadratics, based on the mistakes you
                  made this week.
                </p>
                <div className="option-footer">
                  <span>12 questions · 10 min</span>
                  <button onClick={() => startPractice("topic")}>
                    Start drill <ArrowRight size={14} />
                  </button>
                </div>
              </article>
              <article className="practice-option">
                <div className="option-icon blue-option">
                  <Zap size={20} />
                </div>
                <span className="signal-label">QUICK WIN</span>
                <h2>Mixed algebra sprint</h2>
                <p>Ten rapid questions across linear equations and systems.</p>
                <div className="option-footer">
                  <span>10 questions · 8 min</span>
                  <button onClick={() => startPractice("sprint")}>
                    Start drill <ArrowRight size={14} />
                  </button>
                </div>
              </article>
              <article className="practice-option">
                <div className="option-icon green-option">
                  <Trophy size={20} />
                </div>
                <span className="signal-label">PREMIUM ROUTE</span>
                <h2>Full SAT Math mock</h2>
                <p>
                  Two adaptive modules, 22 questions, and a real test-day
                  rhythm.
                </p>
                <div className="option-footer">
                  <span>35 min · 2 modules</span>
                  <button onClick={() => startPractice("mock")}>
                    Start mock <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            </div>
            <section className="adaptive-note">
              <div className="adaptive-icon">
                <Gauge size={19} />
              </div>
              <div>
                <strong>Adaptive by design</strong>
                <p>
                  Module 2 difficulty responds to how you perform in Module 1,
                  just like the Digital SAT.
                </p>
              </div>
              <span>22 Q</span>
            </section>
          </section>
        )}
        {practiceSession && (
          <div className="practice-modal" role="dialog" aria-modal="true">
            <div className="practice-modal-card">
              <button
                className="modal-close"
                aria-label="Close practice"
                onClick={() => setPracticeSession(null)}
              >
                <X size={19} />
              </button>
              <span className="price-kicker">
                {practiceSession === "mock"
                  ? "FULL SAT MATH MOCK"
                  : practiceSession === "sprint"
                    ? "ALGEBRA SPRINT"
                    : "WEAK SPOT DRILL"}
              </span>
              {!practiceComplete ? (
                <>
                  <h2>Question {practiceQuestion} of 5</h2>
                  <p>
                    Which value of x makes <strong>2x + 6 = 14</strong> true?
                  </p>
                  <div className="answer-grid">
                    <button onClick={() => answerPractice(false)}>x = 2</button>
                    <button onClick={() => answerPractice(true)}>x = 4</button>
                    <button onClick={() => answerPractice(false)}>x = 6</button>
                    <button onClick={() => answerPractice(false)}>x = 8</button>
                  </div>
                  <div className="practice-modal-progress">
                    <span
                      style={{ width: `${(practiceQuestion / 5) * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2>Session complete.</h2>
                  <p>
                    You got <strong>{practiceCorrect} of 5</strong> questions
                    correct.
                  </p>
                  <button
                    className="price-button"
                    onClick={() => setPracticeSession(null)}
                  >
                    Return to practice <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {activeNav === "Leaderboard" && (
          <section className="leaderboard-page">
            <p className="eyebrow">THE SCOREBOARD <span className="line" /></p>
            <h1>Compete with your best.</h1>
            <p className="pricing-intro">Only rankings, personal records, and the scores that matter today.</p>
            <div className="leaderboard-periods" role="tablist" aria-label="Leaderboard period">
              {(["daily", "weekly", "monthly"] as const).map((period) => (
                <button className={leaderboardPeriod === period ? "leaderboard-period active" : "leaderboard-period"} key={period} onClick={() => setLeaderboardPeriod(period)}>{period}</button>
              ))}
            </div>
            <div className="personal-score-grid">
              <article><span className="signal-label">TODAY'S SCORE</span><strong>84%</strong><small>+6% from yesterday</small></article>
              <article><span className="signal-label">PERSONAL BEST</span><strong>1,280</strong><small>SAT Math estimate</small></article>
              <article><span className="signal-label">CURRENT RANK</span><strong>#03</strong><small>+2 places this {leaderboardPeriod.slice(0, -2)}</small></article>
            </div>
            <section className="leaderboard-table-panel"><div className="leaderboard-table-head"><span>RANK</span><span>STUDENT</span><span>XP</span><span>CHANGE</span></div>{leaderboard.map(([rank, name, score, movement]) => <div className={`leaderboard-table-row ${name === "You" ? "you" : ""}`} key={name}><strong>{rank}</strong><span><i>{name.slice(0, 1)}</i>{name}</span><b>{score}</b><em className={movement}>{movement === "up" ? "↗ rising" : movement === "down" ? "↘ falling" : "— steady"}</em></div>)}</section>
          </section>
        )}
        <div className="dashboard-view">
          {activeNav === "Pricing" ? (
            <section className="pricing-page">
              <p className="eyebrow">
                CHOOSE YOUR PACE <span className="line" />
              </p>
              <h1>More room to grow.</h1>
              <p className="pricing-intro">
                Start free, then unlock the full Arcway route when you are
                ready.
              </p>
              <div className="pricing-grid">
                <article className="price-card">
                  <span className="price-kicker">FOUNDATION</span>
                  <h2>Free</h2>
                  <p className="price-copy">
                    Everything you need to build a steady study habit.
                  </p>
                  <div className="price">
                    $0 <small>/ forever</small>
                  </div>
                  <button className="price-button secondary">
                    Current plan
                  </button>
                  <ul>
                    <li>2 topic test sets per topic</li>
                    <li>5 full practice mocks</li>
                    <li>Progress tracking and streaks</li>
                    <li>Community discussions</li>
                  </ul>
                </article>
                <article className="price-card featured">
                  <span className="price-kicker">FULL ROUTE</span>
                  <h2>Premium</h2>
                  <p className="price-copy">
                    More practice, deeper feedback, and a clearer path to test
                    day.
                  </p>
                  <div className="price">
                    $4.99 <small>/ month</small>
                  </div>
                  <button
                    className="price-button"
                    onClick={() => {
                      setCheckoutStep("receipt");
                      setCheckoutOpen(true);
                    }}
                  >
                    {premiumActive
                      ? "Premium active"
                      : "Start monthly subscription"}{" "}
                    <ArrowRight size={15} />
                  </button>
                  <ul>
                    <li>4× more topic practice and mocks</li>
                    <li>AI-powered explanations</li>
                    <li>Adaptive full SAT practice tests</li>
                    <li>Desmos-supported SAT lessons</li>
                  </ul>
                </article>
              </div>
              <div className="secure-pay">
                <span>
                  <LockKeyhole size={15} />
                </span>
                <div>
                  <strong>Secure recurring billing</strong>
                  <p>
                    Card details are entered on Octo's encrypted checkout. Humo,
                    Uzcard, Visa, and Mastercard are supported. Your
                    subscription renews monthly until canceled.
                  </p>
                </div>
                <span className="secure-badge">
                  <ShieldCheck size={14} /> PCI READY
                </span>
              </div>
              {premiumActive && (
                <div className="billing-status">
                  <div>
                    <strong>Premium subscription active</strong>
                    <p>
                      {cancelScheduled
                        ? "Cancellation scheduled. Premium stays active until the end of your paid billing period."
                        : "Next billing date: October 11, 2026"}
                    </p>
                  </div>
                  <button onClick={() => setCancelScheduled(!cancelScheduled)}>
                    {cancelScheduled ? "Keep subscription" : "Cancel renewal"}
                  </button>
                </div>
              )}
              <p className="pricing-note">
                Transactions, invoices, and subscription status belong in the
                server-side billing database, never in browser storage.
              </p>
              <section className="comparison-sheet" aria-label="Free and Premium comparison">
                <div className="comparison-row comparison-head"><span>WHAT'S INCLUDED</span><span>FREE</span><span>PREMIUM</span></div>
                {[["Practice sets per topic", "2 sets", "8 sets"], ["Full-length mocks", "5 mocks", "20 mocks"], ["AI-powered explanations", "—", "Included"], ["Level checks and tier unlocks", "Included", "Included"], ["Leaderboards and rankings", "Included", "Included"], ["Desmos on SAT sections", "Included", "Included"]].map(([feature, free, premium]) => <div className="comparison-row" key={feature}><span>{feature}</span><span className={free === "—" ? "comparison-muted" : "comparison-yes"}>{free}</span><span className="comparison-yes">{premium}</span></div>)}
              </section>
              {checkoutOpen && (
                <div className="checkout-modal" role="dialog" aria-modal="true">
                  <div className="modal-card">
                    <button
                      className="modal-close"
                      aria-label="Close checkout"
                      onClick={() => setCheckoutOpen(false)}
                    >
                      <X size={19} />
                    </button>
                    <span className="price-kicker">ARCWAY PREMIUM</span>
                    <h2>Ready for the full route?</h2>
                    {checkoutStep === "receipt" ? (
                      <>
                        <p>
                          First, choose where Arcway should send your receipts.
                          Card entry happens on Octo's secure payment page.
                        </p>
                        <label>
                          Email for receipt
                          <input
                            type="email"
                            value={receiptEmail}
                            onChange={(event) =>
                              setReceiptEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                          />
                        </label>
                        <button
                          className="price-button"
                          disabled={!receiptEmail.includes("@")}
                          onClick={() => setCheckoutStep("provider")}
                        >
                          Continue <ArrowRight size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <p>
                          Octo will open the secure card page next. Enter your
                          Humo, Uzcard, Visa, or Mastercard details and complete
                          the bank OTP there.
                        </p>
                        <div className="payment-network-list">
                          <span>HUMO</span>
                          <span>UZCARD</span>
                          <span>VISA</span>
                          <span>MASTERCARD</span>
                        </div>
                        <button
                          className="price-button"
                          onClick={() => {
                            setPremiumActive(true);
                            setCheckoutOpen(false);
                          }}
                        >
                          Open Octo payment page <ArrowRight size={15} />
                        </button>
                        <small className="modal-note">
                          Arcway never sees your full card number, CVV, OTP, or
                          payment password.
                        </small>
                      </>
                    )}
                    <small className="modal-note">
                      Arcway does not receive or store your full card number or
                      payment password.
                    </small>
                  </div>
                </div>
              )}
            </section>
              ) : activeNav === "Profile" ? (
            <section className="profile-page">
              <p className="eyebrow">
                YOUR ACCOUNT <span className="line" />
              </p>
              <h1>Make Arcway yours.</h1>
              <p className="pricing-intro">
                Your identity, preferences, and study boundaries in one calm
                place.
              </p>
              <div className="profile-layout">
                <div className="profile-main">
                  <section className="settings-panel identity-panel">
                    <div className="profile-avatar-large">JM</div>
                    <div>
                      <span className="signal-label">LEVEL 7 · EXPLORER</span>
                      <h2>Jamie Morgan</h2>
                      <p>Member since September 2026 · 986 XP</p>
                    </div>
                    <button className="avatar-button">Change avatar</button>
                  </section>
                  <section className="settings-panel">
                    <div className="settings-title">
                      <div>
                        <h2>Personal details</h2>
                        <p>How your account appears across Arcway.</p>
                      </div>
                      <span className="settings-icon">
                        <UserCircle size={18} />
                      </span>
                    </div>
                    <div className="settings-fields">
                      <label>
                        Full name
                        <input defaultValue="Jamie Morgan" />
                      </label>
                      <label>
                        Arcway ID
                        <input defaultValue="jamie.morgan" />
                      </label>
                      <label className="wide-field">
                        Email for login
                        <input type="email" defaultValue="jamie@example.com" />
                      </label>
                    </div>
                    <button
                      className="save-button"
                      onClick={() => setProfileSaved(true)}
                    >
                      {profileSaved ? "Saved" : "Save changes"}{" "}
                      <Check size={15} />
                    </button>
                  </section>
                  <section className="settings-panel">
                    <div className="settings-title">
                      <div>
                        <h2>Study preferences</h2>
                        <p>Shape the way your route speaks to you.</p>
                      </div>
                      <span className="settings-icon">
                        <Gauge size={18} />
                      </span>
                    </div>
                    <label className="setting-toggle">
                      <span>
                        <strong>Daily reminders</strong>
                        <small>Keep your streak gently visible.</small>
                      </span>
                      <input type="checkbox" defaultChecked />
                    </label>
                    <label className="setting-toggle">
                      <span>
                        <strong>Weekly progress email</strong>
                        <small>Get your score movement every Sunday.</small>
                      </span>
                      <input type="checkbox" defaultChecked />
                    </label>
                    <label className="setting-toggle">
                      <span>
                        <strong>Quiet study mode</strong>
                        <small>
                          Reduce celebrations during focused sessions.
                        </small>
                      </span>
                      <input type="checkbox" />
                    </label>
                  </section>
                </div>
                <aside className="profile-side">
                  <section className="settings-panel score-profile">
                    <span className="signal-label">CURRENT ROUTE</span>
                    <h2>SAT Math</h2>
                    <div className="profile-stat">
                      <strong>1,180</strong>
                      <small>estimated score</small>
                    </div>
                    <div className="mini-progress">
                      <span />
                    </div>
                    <p>Goal: 1,450 by test day</p>
                  </section>
                  <section className="settings-panel security-card">
                    <div className="settings-title">
                      <h2>Account security</h2>
                      <LockKeyhole size={17} />
                    </div>
                    <p>Password last changed 12 days ago.</p>
                    <button className="outline-button">
                      Change password <ArrowRight size={14} />
                    </button>
                    <button className="outline-button">
                      Sign out everywhere <ArrowRight size={14} />
                    </button>
                  </section>
                </aside>
              </div>
            </section>
          ) : activeNav === "Overview" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    WEEK 3 OF 8 <span className="line" />
                  </p>
                  <h1>Keep going, Jamie.</h1>
                  <p className="subtitle">
                    Your next breakthrough is closer than it feels.
                  </p>
                </div>
                <button className="streak">
                  <span>
                    <Flame size={17} />
                  </span>
                  <strong>12</strong>
                  <small>day streak</small>
                </button>
              </div>

              <section className="hero-card">
                <div className="hero-copy">
                  <span className="pill">CONTINUE LEARNING</span>
                  <h2>Linear equations</h2>
                  <p>
                    Master the language of change. You are 72% through this
                    chapter.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => setActiveNav("Learn")}
                  >
                    Continue lesson <ArrowRight size={15} />
                  </button>
                </div>
                <div className="orbit-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit-dot dot-one" />
                  <div className="orbit-dot dot-two" />
                  <div className="equation">y = mx + b</div>
                  <div className="orbit-center">
                    72<span>%</span>
                  </div>
                </div>
                <div className="hero-index">
                  04 <span>/ 08</span>
                </div>
              </section>

              <section className="arcway-platform-story" id="how">
                <div className="story-heading">
                  <span className="signal-label">THE ARCWAY METHOD</span>
                  <h2>Every practice set moves you toward the next tier.</h2>
                  <p>Learn the topic, drill it, then take a real level check. Score 90% or better and the next tier opens.</p>
                </div>
                <div className="topic-orbit-stage" onPointerDown={(event) => { setOrbitDragging(true); setOrbitDragX(event.clientX); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!orbitDragging) return; setTopicRotation((value) => value + (event.clientX - orbitDragX) * 0.5); setOrbitDragX(event.clientX); }} onPointerUp={() => setOrbitDragging(false)} onPointerCancel={() => setOrbitDragging(false)}>
                  <div className="orbit-floor" />
                  <div className="topic-orbit" style={{ transform: `rotateX(58deg) rotateY(${topicRotation}deg)` }}>
                    {topicOrbit.map((topic, index) => <button className="topic-orbit-item" key={topic} onClick={() => { setSelectedTrack(selectedTrack); setActiveNav("Learn"); }} style={{ transform: `rotateY(${index * 60}deg) translateZ(142px) rotateX(-58deg)` }}>{topic}</button>)}
                  </div>
                  <div className="orbit-vertex">A</div>
                  <span className="orbit-caption">drag to explore topics</span>
                </div>
                <div className="story-stats"><div><strong>20</strong><span>questions per level check</span></div><div><strong>22 × 2</strong><span>questions in a full mock</span></div><div><strong>90%</strong><span>to unlock the next tier</span></div></div>
              </section>

              <section className="skill-path" id="features">
                <div className="story-heading"><span className="signal-label">YOUR SKILL PATH</span><h2>Four stops on the way up.</h2><p>Arcway keeps the order visible, so you always know what to do next.</p></div>
                <div className="skill-path-grid"><button onClick={() => setActiveNav("Learn")}><b>01</b><strong>Learn it</strong><span>Intro, explanation, and worked examples.</span></button><button onClick={() => startPractice("topic")}><b>02</b><strong>Practice it</strong><span>Questions at rising difficulty.</span></button><button onClick={() => setActiveNav("Practice")}><b>03</b><strong>Level check</strong><span>Twenty questions on this topic alone.</span></button><button onClick={() => setMissionDone(true)}><b>04</b><strong>Unlock</strong><span>Reach 90% and open the next tier.</span></button></div>
              </section>

              <section className="platform-feature-grid">
                <article className="platform-feature"><div><span className="signal-label">ADAPTIVE MOCKS</span><h3>Built for the real digital exam.</h3><p>Two modules, 22 questions each. Your performance in module one shapes the difficulty of module two.</p></div><div className="device-preview"><div className="preview-bars"><span style={{ height: "54%" }} /><span style={{ height: "84%" }} /></div><small>Module 1 · 620 &nbsp;&nbsp; Module 2 · 680</small></div></article>
                <article className="platform-feature"><div><span className="signal-label">DESMOS CONTEXT</span><h3>Calculator practice that matches the track.</h3><p>{selectedTrack === "SAT" ? "SAT Math includes Desmos workflows where the real test allows them." : "PSAT Math keeps the calculator off so your practice matches the real section."}</p></div><div className="desmos-preview"><span>y = −0.5x² + 3x + 1</span><svg viewBox="0 0 240 100" aria-hidden="true"><path d="M4 87 C 64 12, 105 10, 128 43 C 153 78, 194 80, 236 18" /></svg></div></article>
                <article className="platform-feature"><div><span className="signal-label">SCORE PROJECTION</span><h3>Your predicted score moves with you.</h3><p>Every check and mock feeds one running estimate, so progress is a number you can act on.</p></div><div className="score-gauge"><div><strong>1,180</strong><small>predicted math score</small></div></div></article>
                <article className="platform-feature"><div><span className="signal-label">QUESTION BOARD</span><h3>Ask where you are stuck.</h3><p>Keep questions attached to the exact skill, with screened threads that stay useful.</p></div><div className="thread-preview"><span>Under: Systems of equations</span><p>Why does elimination fail here?</p><span>Under: Circles and radians</span><p>Is there a faster conversion?</p></div></article>
              </section>

              <section className="active-study">
                <div className="study-intro">
                  <span className="signal-label">YOUR NEXT MOVE</span>
                  <h2>Shape today's session.</h2>
                  <p>Pick a rhythm and Arcway will keep the route moving.</p>
                </div>
                <div
                  className="mode-picker"
                  role="group"
                  aria-label="Study mode"
                >
                  {["Focus", "Sprint", "Review"].map((mode) => (
                    <button
                      className={studyMode === mode ? "mode active" : "mode"}
                      key={mode}
                      onClick={() => setStudyMode(mode)}
                    >
                      {mode}
                      <small>
                        {mode === "Focus"
                          ? "25 min"
                          : mode === "Sprint"
                            ? "10 min"
                            : "15 min"}
                      </small>
                    </button>
                  ))}
                </div>
                <div className="session-line">
                  <span className="session-dot" />
                  {studyMode} mode{" "}
                  <strong>
                    {studyMode === "Focus"
                      ? "2 lessons + 1 check"
                      : studyMode === "Sprint"
                        ? "10 rapid questions"
                        : "Review missed questions"}
                  </strong>
                  <button onClick={() => setActiveNav("Practice")}>
                    Begin session <span>→</span>
                  </button>
                </div>
              </section>

              <section className="mission-map">
                <div className="mission-head">
                  <div>
                    <span className="signal-label">THE DAILY ROUTE</span>
                    <h2>Three small wins before sunset.</h2>
                  </div>
                  <span className="route-count">
                    {missionDone ? "3 / 3" : "2 / 3"} complete
                  </span>
                </div>
                <div className="route-line">
                  <div
                    className="route-progress"
                    style={{ width: missionDone ? "100%" : "67%" }}
                  />
                </div>
                <div className="route-steps">
                  <button className="route-step complete">
                    <span>
                      <Check size={12} />
                    </span>
                    <strong>Warm-up</strong>
                    <small>5 questions</small>
                  </button>
                  <button className="route-step complete">
                    <span>
                      <Check size={12} />
                    </span>
                    <strong>Learn</strong>
                    <small>Linear equations</small>
                  </button>
                  <button
                    className={
                      missionDone ? "route-step complete" : "route-step current"
                    }
                    onClick={() => setMissionDone(true)}
                  >
                    <span>{missionDone ? <Check size={12} /> : "3"}</span>
                    <strong>{missionDone ? "Complete" : "Level check"}</strong>
                    <small>{missionDone ? "Nice work" : "20 questions"}</small>
                  </button>
                </div>
              </section>

              <section className="signal-grid">
                <article className="signal-card diagnostic-card">
                  <div className="signal-symbol">
                    <Gauge size={24} />
                  </div>
                  <div>
                    <span className="signal-label">START HERE</span>
                    <h3>Find your baseline</h3>
                    <p>
                      A 20-minute placement test maps your next best lessons.
                    </p>
                    <button
                      className="signal-link"
                      onClick={() => setActiveNav("Practice")}
                    >
                      Take diagnostic <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
                <article className="signal-card score-card">
                  <div className="signal-card-head">
                    <div>
                      <span className="signal-label">SCORE TRAJECTORY</span>
                      <h3>
                        1,180 <small>/ 1,450 goal</small>
                      </h3>
                    </div>
                    <span className="score-change">+80 pts</span>
                  </div>
                  <div className="score-bars">
                    {scoreBars.map((height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="score-axis">
                    <span>Aug 24</span>
                    <span>Today</span>
                  </div>
                </article>
                <article className="signal-card competition-card">
                  <div className="competition-top">
                    <span className="signal-label">WEEKLY COMPETITION</span>
                    <span className="live-dot">LIVE</span>
                  </div>
                  <h3>Algebra sprint</h3>
                  <p>Beat your personal best before Sunday.</p>
                  <div className="competition-progress">
                    <span style={{ width: "64%" }} />
                  </div>
                  <div className="competition-foot">
                    <span>12 / 20 questions</span>
                    <strong>+64 XP</strong>
                  </div>
                </article>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Build your momentum</h2>
                  <p>Small steps add up to big scores.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setShowAllLessons(!showAllLessons)}
                >
                  {showAllLessons ? "Show less" : "View all"} <span>↗</span>
                </button>
              </div>
              <section className="lesson-grid">
                {(showAllLessons ? lessons : lessons.slice(0, 3)).map(
                  (lesson, index) => (
                    <article
                      className={`lesson-card ${lesson.tone}`}
                      key={lesson.title}
                    >
                      <div className="lesson-top">
                        <span className="lesson-number">0{index + 4}</span>
                        <span className="lesson-status">
                          {lesson.progress === 0
                            ? "LOCKED"
                            : `${lesson.progress}%`}
                        </span>
                      </div>
                      <h3>{lesson.title}</h3>
                      <p>{lesson.detail}</p>
                      <div className="progress-track">
                        <div style={{ width: `${lesson.progress}%` }} />
                      </div>
                      <button className="lesson-action">
                        {lesson.progress === 0 ? "Unlock" : "Open lesson"}{" "}
                        <span>→</span>
                      </button>
                    </article>
                  ),
                )}
              </section>

              <div className="lower-grid">
                <section className="practice-panel">
                  <div className="section-heading compact">
                    <div>
                      <h2>Practice room</h2>
                      <p>Ready when you are.</p>
                    </div>
                    <span className="free-label">FREE PLAN</span>
                  </div>
                  <div className="practice-row">
                    <div className="practice-icon">⌁</div>
                    <div>
                      <strong>Topic practice</strong>
                      <p>Mixed questions from your current lessons</p>
                    </div>
                    <span className="practice-time">10 min</span>
                    <button className="round-arrow">→</button>
                  </div>
                  <div className="practice-row locked">
                    <div className="practice-icon">▣</div>
                    <div>
                      <strong>Full SAT Math test</strong>
                      <p>22 questions · adaptive modules</p>
                    </div>
                    <span className="premium-label">PREMIUM</span>
                    <button className="round-arrow">→</button>
                  </div>
                </section>
                <section className="rank-panel">
                  <div className="section-heading compact">
                    <div>
                      <h2>Leaderboard</h2>
                      <p>Your weekly position</p>
                    </div>
                    <button className="kebab">•••</button>
                  </div>
                  <div className="rank-tabs">
                    <button className="selected">Week</button>
                    <button>Month</button>
                    <button>All time</button>
                  </div>
                  {leaderboard.map(([rank, name, score, movement]) => (
                    <div
                      className={`rank-row ${name === "You" ? "you" : ""}`}
                      key={name}
                    >
                      <span className="rank-number">{rank}</span>
                      <div className="rank-avatar">{name.slice(0, 1)}</div>
                      <strong>{name}</strong>
                      <span className={`movement ${movement}`}>
                        {movement === "up"
                          ? "↗"
                          : movement === "down"
                            ? "↘"
                            : "—"}
                      </span>
                      <span className="rank-score">{score}</span>
                    </div>
                  ))}
                </section>
              </div>
            </>
          ) : null}
          {activeNav === "Overview" && (
            <>
              <section className="contact-band">
                <div>
                  <span className="signal-label">
                    STUCK, CURIOUS, OR HAVE A BETTER IDEA?
                  </span>
                  <h2>Bring it to the team.</h2>
                  <p>
                    Tell us what felt unclear, share a question, or send a
                    screenshot. We read every message.
                  </p>
                </div>
                <div className="feedback-composer">
                  {feedbackSent ? (
                    <strong className="feedback-success">
                      Thanks. Your note is ready for the team.
                    </strong>
                  ) : (
                    <>
                      <textarea
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        placeholder="Got feedback? Tell us..."
                        aria-label="Feedback message"
                      />
                      <div className="composer-actions">
                        <button
                          className="attach-button"
                          aria-label="Attach screenshot"
                        >
                          <Paperclip size={14} />
                        </button>
                        <button
                          className="contact-button"
                          onClick={() =>
                            setFeedbackSent(Boolean(feedback.trim()))
                          }
                        >
                          Send note <ArrowRight size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
              <section className="faq-section" id="faq">
                <div className="section-heading faq-heading">
                  <div>
                    <span className="signal-label">HELP DESK</span>
                    <h2>Questions, made lighter.</h2>
                    <p>Quick answers before your next study session.</p>
                  </div>
                </div>
                <div className="faq-list">
                  {[
                    [
                      "What is the difference between PSAT and SAT Math?",
                      "PSAT lessons build the same core skills with a gentler runway. SAT lessons add Desmos workflows and harder adaptive practice.",
                    ],
                    [
                      "How does the 90% progression rule work?",
                      "Reach 90% or higher on a topic level check to unlock the next tier. You can always revisit completed topics.",
                    ],
                    [
                      "Are the practice tests like the real Digital SAT?",
                      "Full mocks use two timed adaptive math modules. Your module 1 performance guides the difficulty and scoring range of module 2.",
                    ],
                    [
                      "Can I ask for help or report a problem?",
                      "Yes. Use Contact the team below or email mavenuzb@gmail.com with a screenshot and a short description.",
                    ],
                  ].map(([question, answer], index) => (
                    <div
                      className={`faq-item ${openFaq === index ? "expanded" : ""}`}
                      key={question}
                    >
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === index ? -1 : index)
                        }
                      >
                        <span>{question}</span>
                        <b>{openFaq === index ? "−" : "+"}</b>
                      </button>
                      {openFaq === index && <p>{answer}</p>}
                    </div>
                  ))}
                </div>
              </section>
              <section className="reference-section" id="reference">
                <div className="reference-heading">
                  <div>
                    <span className="signal-label">REFERENCE DESK</span>
                    <h2>Know what your tools are for.</h2>
                    <p>Keep the important context close while you study.</p>
                  </div>
                  <span className="reference-mark">A / 03</span>
                </div>
                <div className="reference-grid">
                  <article>
                    <span className="reference-number">01</span>
                    <h3>Digital SAT map</h3>
                    <p>
                      See the two-module rhythm, timing, and skill domains in
                      one place.
                    </p>
                    <button className="signal-link">
                      Open guide <span>→</span>
                    </button>
                  </article>
                  <article>
                    <span className="reference-number">02</span>
                    <h3>Desmos field notes</h3>
                    <p>
                      Short, practical patterns for graphing, tables,
                      intersections, and regressions.
                    </p>
                    <button className="signal-link">
                      Open guide <span>→</span>
                    </button>
                  </article>
                  <article>
                    <span className="reference-number">03</span>
                    <h3>Arcway glossary</h3>
                    <p>
                      Plain-language definitions for every score, tier, and
                      practice mode.
                    </p>
                    <button className="signal-link">
                      Open guide <span>→</span>
                    </button>
                  </article>
                </div>
              </section>
            </>
          )}
          {activeNav === "Practice" && (
            <section className="weak-spot">
              <div className="weak-spot-icon">
                <Zap size={19} />
              </div>
              <div>
                <span className="signal-label">SMART RECOVERY</span>
                <h2>Quadratics are asking for a rematch.</h2>
                <p>
                  You missed 3 questions here this week. A short targeted drill
                  can turn that gap into XP.
                </p>
              </div>
              <button onClick={() => setActiveNav("Practice")}>
                Rescue this skill <ArrowRight size={15} />
              </button>
            </section>
          )}
          {activeNav === "Overview" && <footer>
            <div className="footer-brand">
              <span className="brand-mark">A</span>
              <strong>Arcway</strong>
              <p>The SAT route that keeps you moving.</p>
              <a href="mailto:mavenuzb@gmail.com">mavenuzb@gmail.com</a>
            </div>
            <div>
              <strong>Platform</strong>
              <a href="#top">Dashboard</a>
              <a href="#practice">Practice room</a>
              <a href="#leaderboard">Leaderboard</a>
            </div>
            <div>
              <strong>Resources</strong>
              <a href="#faq">FAQ</a>
              <a href="#reference">Reference desk</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div>
              <strong>Community</strong>
              <a href="mailto:mavenuzb@gmail.com">Contact</a>
              <a href="mailto:mavenuzb@gmail.com">Report a problem</a>
              <span>© 2026 Arcway</span>
            </div>
          </footer>}
        </div>
        {["Learn", "Practice", "Leaderboard"].includes(activeNav) && (
          <>
            <section className="contact-band shared-end"><div><span className="signal-label">NEED A HUMAN?</span><h2>Bring it to the team.</h2><p>Questions, ideas, bugs, or screenshots are welcome.</p></div><a className="contact-button" href="mailto:mavenuzb@gmail.com">Contact the team <ArrowRight size={15} /></a></section>
            <section className="shared-help-row"><a href="#faq"><MessageCircle size={17} /><span><strong>Help desk</strong><small>Answers to common SAT questions.</small></span><ArrowRight size={15} /></a><a href="#reference"><BookOpen size={17} /><span><strong>Reference desk</strong><small>Formulas, Desmos notes, and exam maps.</small></span><ArrowRight size={15} /></a></section>
            <footer className="shared-footer"><div className="footer-brand"><span className="brand-mark">A</span><strong>Arcway</strong><p>The SAT route that keeps you moving.</p></div><div><strong>Platform</strong><a onClick={() => setActiveNav("Overview")}>Dashboard</a><a onClick={() => setActiveNav("Practice")}>Practice</a><a onClick={() => setActiveNav("Leaderboard")}>Leaderboard</a></div><div><strong>Resources</strong><a href="#faq">FAQ</a><a href="#reference">Reference desk</a><a onClick={() => setActiveNav("Pricing")}>Pricing</a></div><div><strong>Community</strong><a href="mailto:mavenuzb@gmail.com">Contact</a><a href="mailto:mavenuzb@gmail.com">Report a problem</a><span>© 2026 Arcway</span></div></footer>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
