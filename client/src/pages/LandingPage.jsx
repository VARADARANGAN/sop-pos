import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Sparkles, ShoppingBag, Layers, GitBranch, 
  Users, UserCheck, Truck, TrendingUp, BarChart3,
  ArrowRight, ShieldCheck, ShoppingCart, Store, UtensilsCrossed, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: `${delay}ms` }} 
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      if (user.role === "CASHIER") navigate("/billing");
      else navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const features = [
    { icon: <ShoppingCart className="h-6 w-6 text-primary" />, title: "POS Billing", desc: "Lightning-fast checkouts with dynamic cart totals, split payments, and offline-ready queues." },
    { icon: <Layers className="h-6 w-6 text-accent" />, title: "Inventory", desc: "Real-time stock deduction, multi-location stock transfers, and automated warnings." },
    { icon: <Store className="h-6 w-6 text-secondary" />, title: "Products", desc: "Manage variations, dynamic pricing, and combo meals centrally with automatic sync." },
    { icon: <Users className="h-6 w-6 text-primary" />, title: "Customers", desc: "Track customer history, preferences, and visit analytics to build lasting loyalty." },
    { icon: <Truck className="h-6 w-6 text-accent" />, title: "Suppliers", desc: "Streamlined vendor management and direct purchase order tracking for your supply chain." },
    { icon: <ShoppingBag className="h-6 w-6 text-secondary" />, title: "Purchases", desc: "Automate ingredient restocking and track historical price variations from vendors." },
    { icon: <UtensilsCrossed className="h-6 w-6 text-primary" />, title: "Kitchen", desc: "Direct-to-kitchen digital ticketing system eliminating paper waste and missed orders." },
    { icon: <BarChart3 className="h-6 w-6 text-accent" />, title: "Reports", desc: "Tax summaries, end-of-day cashier reports, and comprehensive PDF/CSV exports." },
    { icon: <LayoutDashboard className="h-6 w-6 text-secondary" />, title: "Dashboard", desc: "Beautiful real-time KPI overviews showing revenue, top items, and live order streams." },
    { icon: <GitBranch className="h-6 w-6 text-primary" />, title: "Multi-Branch", desc: "Scale instantly. Centralized catalog management pushing menus to hundreds of branches." },
    { icon: <ShieldCheck className="h-6 w-6 text-accent" />, title: "RBAC", desc: "Strict role-based access control ensuring cashiers, managers, and admins only see what they need." },
    { icon: <UserCheck className="h-6 w-6 text-secondary" />, title: "Authentication", desc: "Secure, token-based JWT authentication keeping your enterprise data strictly locked down." }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight text-foreground">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span>CulinaFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant={user ? "outline" : "default"} onClick={handleCTA}>
              {user ? "Go to Dashboard" : "Sign In"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            CulinaFlow OS v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] mb-6">
            Smart Restaurant Operations, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Simplified.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            An enterprise-grade POS and inventory framework designed for speed, consistency, and multi-branch intelligence. Stop managing software and start managing your restaurant.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25" onClick={handleCTA}>
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-lg text-muted-foreground">
              A unified suite combining point-of-sale, back-office, and analytics in one beautiful package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <ScrollReveal key={idx} delay={idx * 50}>
                <div className="group h-full p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feat.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>CulinaFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CulinaFlow Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

