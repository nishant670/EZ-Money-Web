"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Mic,
  Brain,
  ShieldCheck,
  LayoutDashboard,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Wallet,
  CreditCard,
  TrendingUp,
  Smartphone,
  Menu,
  X,
  Plus,
  ArrowDownRight,
  ChevronDown
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-morphism py-3 shadow-sm" : "bg-transparent py-5"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 relative bg-accent rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-accent/20">
              <Image src="/logo.png" alt="Finnri Logo" fill className="p-1 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight font-rounded">Finnri</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-accent transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-accent transition-colors">How it works</Link>
            <Link href="#security" className="text-sm font-medium hover:text-accent transition-colors">Security</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-accent transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm font-semibold text-accent hover:opacity-80 transition-opacity">Web Dashboard</Link>
            <Link href="#download" className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all">
              Download App
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-b border-border shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col p-6 gap-4">
              <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Features</Link>
              <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">How it works</Link>
              <Link href="#security" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Security</Link>
              <Link href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Pricing</Link>
              <div className="h-px bg-border my-2" />
              <Link href="/login" className="text-lg font-bold text-accent">Web Dashboard Login</Link>
              <Link href="#download" className="bg-accent text-white px-6 py-4 rounded-2xl text-center font-bold shadow-lg">
                Download App
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-accent-secondary text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Brain className="w-4 h-4" />
                <span>Confirm-first AI Intelligence</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] font-rounded">
                Money, made <span className="text-accent underline decoration-accent/20 underline-offset-8">intelligent.</span>
              </h1>
              <p className="text-xl text-text-muted mb-10 leading-relaxed max-w-lg">
                Track expenses & income instantly with AI. Just speak — Finnri understands, categorizes, and stays in your control.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="#" className="flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-foreground/10 group">
                  <Smartphone className="w-5 h-5" />
                  Download for Android
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#" className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-border px-8 py-4 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-md">
                  <Smartphone className="w-5 h-5 text-accent" />
                  Download for iOS
                </Link>
              </div>
              <Link href="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-accent font-medium transition-colors mb-12">
                Try Web Dashboard <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex flex-wrap gap-8 items-center border-t border-border pt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">No spreadsheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Designed for India (UPI, cards)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Confirm-first AI</span>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex justify-center items-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[100px] rounded-full" />
              <div className="relative w-full max-w-[450px] aspect-[4/5] animate-float">
                <Image
                  src="/hero.png"
                  alt="Finnri App Interface"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-accent-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-rounded">Effortless Tracking in 3 Steps</h2>
            <p className="text-text-muted">Say goodbye to manual entry. Finnri makes managing money as easy as talking.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Speak or type",
                desc: "Just say 'Ordered pizza for ₹450' or type a quick note. Voice-first design for speed."
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI extracts details",
                desc: "Our smart AI identifies amount, merchant, and category instantly. No more manual tagging."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "You confirm & save",
                desc: "Always in control. Review the details, tap confirm, and it's securely saved in your accounts."
              }
            ].map((step, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-border group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 text-accent/10 font-bold text-6xl group-hover:text-accent/20 transition-colors">
                  0{i + 1}
                </div>
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-rounded">Powerful Features, Zero Clutter</h2>
            <p className="text-text-muted">Everything you need to manage personal & business finances intelligently.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: "Voice-first Tracking",
                desc: "Designed for the move. Speak your expenses as they happen."
              },
              {
                icon: <PieChart className="w-6 h-6" />,
                title: "Smart Categorization",
                desc: "AI automatically puts your spending into logical buckets."
              },
              {
                icon: <Wallet className="w-6 h-6" />,
                title: "Multi-Account Sync",
                desc: "Track Bank, Wallets, UPI, and Credit Cards in one place."
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Insights & Trends",
                desc: "Visualize your spending patterns with beautiful, easy charts."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Confirm-first Trust",
                desc: "AI suggests, you decide. Full control over what gets saved."
              },
              {
                icon: <LayoutDashboard className="w-6 h-6" />,
                title: "Web Dashboard",
                desc: "Deep analysis and bulk editing on the big screen."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] border border-border hover:border-accent/40 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 transition-all">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-zinc-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-8 font-rounded leading-tight">Built for every financial journey.</h2>
              <div className="space-y-6">
                {[
                  { title: "Track UPI spending", icon: <Smartphone className="text-accent" /> },
                  { title: "Manage credit card expenses", icon: <CreditCard className="text-accent" /> },
                  { title: "Personal budgeting made easy", icon: <Wallet className="text-accent" /> },
                  { title: "Business & freelance tracking", icon: <TrendingUp className="text-accent" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl">
                      {item.icon}
                    </div>
                    <span className="text-lg font-medium">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square bg-gradient-to-br from-accent/20 to-transparent rounded-[3rem] border border-white/10 p-12 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 animate-float">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs uppercase tracking-widest text-zinc-400">Monthly Budget</span>
                    <span className="text-accent text-sm font-bold">75% Used</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[75%]" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4 translate-x-12 dark:bg-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center dark:bg-zinc-700">🛒</div>
                      <div>
                        <p className="text-zinc-900 font-bold dark:text-white">Starbucks</p>
                        <p className="text-xs text-zinc-500">Coffee • Bangalore</p>
                      </div>
                    </div>
                    <span className="text-zinc-900 font-bold dark:text-white">₹320</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 relative z-10">
                <p className="text-2xl font-bold mb-2">Detailed insights at your fingertips.</p>
                <p className="text-zinc-400">Visualize where every rupee goes with real-time analytics.</p>
              </div>
              {/* Decorative dots */}
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full" style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Web Dashboard Section */}
      <section className="py-24 bg-accent/5 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-white dark:bg-zinc-800 rounded-[3rem] p-8 lg:p-16 border border-border shadow-2xl relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-rounded">Analyze on the big screen.</h2>
                <p className="text-text-muted text-lg mb-8 leading-relaxed">
                  Some things are better seen on a larger canvas. Use the Web Dashboard for deep dives, bulk management, and professional summaries.
                </p>
                <ul className="space-y-4 mb-10 text-lg font-medium">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
                    View interactive reports & spending trends
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
                    Bulk edit or categorize historical transactions
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
                    Export data for accounting or tax purposes
                  </li>
                </ul>
                <Link href="/login" className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-transform">
                  Login to Web Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-4 border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-200 dark:bg-zinc-700 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                  </div>
                  <div className="p-12 h-full flex flex-col justify-center gap-6">
                    <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-accent/20 rounded-xl" />
                      <div className="h-24 bg-accent/10 rounded-xl" />
                      <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
                    </div>
                    <div className="h-32 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-border animate-float">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-secondary flex items-center justify-center rounded-xl text-accent">
                      <ArrowDownRight className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">CSV Export</p>
                      <p className="text-xs text-text-muted">Ready for download</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-border rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="md:w-1/2 p-12 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                <ShieldCheck className="w-32 h-32 text-accent relative z-10" />
              </div>
            </div>
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6 font-rounded">Bank-grade security. <br />Privacy by design.</h2>
              <ul className="space-y-4 text-text-muted">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Your data stays private</span>
                    <p className="text-sm">We never sell your financial data to third parties.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">End-to-end Encryption</span>
                    <p className="text-sm">Secure storage and communication for all your records.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">No forced bank sync</span>
                    <p className="text-sm">You decide what to import. Use voice, type, or manual sync.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-accent-secondary/10">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 font-rounded">Loved by thousands.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Rahul S.", role: "Software Engineer", quote: "Voice tracking is a game changer for my UPI spends." },
              { name: "Priya V.", role: "Freelance Designer", quote: "Finally, an app that doesn't force me to sync my bank." },
              { name: "Arjun & Sneha", role: "Couple", quote: "Perfect for managing our shared household expenses." },
              { name: "Karan M.", role: "Student", quote: "The AI understands everything. Tracking is finally fun." }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <CheckCircle2 key={j} className="w-4 h-4 text-accent fill-accent" />)}
                </div>
                <p className="italic text-text-muted mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-bold font-rounded">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-rounded">Simple Plans for Everyone</h2>
            <p className="text-text-muted">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-[2rem] border border-border bg-white dark:bg-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Finnri Free</h3>
                <p className="text-text-muted mb-6">Essential tracking for everyone.</p>
                <div className="text-4xl font-bold mb-8 font-rounded">₹0 <span className="text-sm font-normal text-zinc-400">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> Voice & Text tracking</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> AI Categorization</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> Basic Insights</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> Up to 3 accounts</li>
                </ul>
              </div>
              <button className="w-full py-4 rounded-2xl border-2 border-foreground font-bold hover:bg-foreground hover:text-background transition-all">Current Plan</button>
            </div>
            <div className="p-8 rounded-[2rem] border-2 border-accent bg-accent/5 dark:bg-accent/10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Coming Soon</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Finnri Pro</h3>
                <p className="text-text-muted mb-6">Advanced power for finances.</p>
                <div className="text-4xl font-bold mb-8 font-rounded">₹199 <span className="text-sm font-normal text-zinc-400">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> Unlimited accounts</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> CSV & PDF Exports</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> Automation rules</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-accent" /> Detailed tax reports</li>
                </ul>
              </div>
              <button className="w-full py-4 rounded-2xl bg-accent text-white font-bold shadow-lg shadow-accent/30 opacity-80 cursor-not-allowed">Join Waitlist</button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-rounded">Wealth Wisdom</h2>
            <Link href="#" className="hidden sm:flex items-center gap-2 text-accent font-bold">View all posts <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tag: "Knowledge",
                title: "How to track expenses automatically in India",
                date: "Jan 12, 2026",
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
              },
              {
                tag: "Comparison",
                title: "UPI vs Credit Card: Spending patterns revealed",
                date: "Jan 08, 2026",
                image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80"
              },
              {
                tag: "Guides",
                title: "Best way to manage monthly subscriptions",
                date: "Jan 03, 2026",
                image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
              }
            ].map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6 shadow-sm">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-accent">{post.tag}</div>
                </div>
                <div className="text-sm text-text-muted mb-2 font-medium">{post.date}</div>
                <h3 className="text-xl font-bold font-rounded group-hover:text-accent transition-colors leading-snug">{post.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 font-rounded">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Do I need to connect my bank?", a: "No. Finnri is designed to give you options. You can use voice input, manual entry, or choose to sync via secure providers if you want full automation. You are never forced to link your bank accounts." },
              { q: "How does voice input work?", a: "Just tap the microphone icon in the mobile app and speak naturally. For example, 'Paid ₹1200 for electricity bill'. Our AI extracts the amount, merchant, and category, then asks for your confirmation." },
              { q: "Is my data safe?", a: "Extremely. We use industry-standard encryption to protect your data. More importantly, we operate on a 'Privacy First' model. We don't sell your data, and we don't have access to your bank passwords." },
              { q: "Can I export my data?", a: "Yes, Pro users can export their data in CSV or PDF formats at any time. We believe your data belongs to you." }
            ].map((faq, i) => (
              <div key={i} className="border border-border rounded-2xl p-6 bg-white dark:bg-zinc-800">
                <h4 className="text-lg font-bold mb-3 flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                </h4>
                <p className="text-text-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section id="download" className="py-24 px-6">
        <div className="container mx-auto">
          <div className="bg-accent rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-accent/40">
            {/* Decorative circles */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 font-rounded leading-tight">Start tracking smarter today.</h2>
              <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">Download the Finnri app and take control of your financial intelligence in seconds.</p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="#" className="flex items-center gap-3 bg-white text-accent px-10 py-5 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                  <Smartphone className="w-6 h-6" />
                  Google Play Store
                </Link>
                <Link href="#" className="flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                  <Smartphone className="w-6 h-6" />
                  Apple App Store
                </Link>
              </div>

              <div className="mt-12">
                <Link href="/login" className="text-white hover:underline text-lg font-medium opacity-80 hover:opacity-100 transition-opacity">
                  Login to Web Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                <Image src="/logo.png" alt="Finnri Logo" fill className="p-1 object-contain" />
              </div>
              <span className="text-lg font-bold font-rounded">Finnri</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-text-muted">
              <Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-accent transition-colors">Contact Us</Link>
              <Link href="#" className="hover:text-accent transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-accent transition-colors">Instagram</Link>
            </div>

            <p className="text-xs text-text-muted">© 2026 Finnri Technologies. Made with ❤️ for India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
