import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Sparkles, ShoppingBag, Layers, GitBranch, 
  Users, UserCheck, Truck, TrendingUp, BarChart3,
  ArrowRight, ShieldCheck, ShoppingCart, Store, UtensilsCrossed, LayoutDashboard
} from "lucide-react";
import "./LandingPage.css";

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
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal-section ${isVisible ? "revealed" : ""}`}>
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
    { icon: <ShoppingCart />, title: "POS Billing", desc: "Lightning-fast checkouts with dynamic cart totals, split payments, and offline-ready hold/resume queues." },
    { icon: <Layers />, title: "Inventory", desc: "Real-time stock deduction, multi-location stock transfers, and automated low-stock warnings." },
    { icon: <Store />, title: "Products", desc: "Manage variations, dynamic pricing, and combo meals centrally with automatic sync." },
    { icon: <Users />, title: "Customers", desc: "Track customer history, preferences, and visit analytics to build lasting loyalty." },
    { icon: <Truck />, title: "Suppliers", desc: "Streamlined vendor management and direct purchase order tracking for your supply chain." },
    { icon: <ShoppingBag />, title: "Purchases", desc: "Automate ingredient restocking and track historical price variations from vendors." },
    { icon: <UtensilsCrossed />, title: "Kitchen", desc: "Direct-to-kitchen digital ticketing system eliminating paper waste and missed orders." },
    { icon: <BarChart3 />, title: "Reports", desc: "Tax summaries, end-of-day cashier reports, and comprehensive PDF/CSV exports." },
    { icon: <LayoutDashboard />, title: "Dashboard", desc: "Beautiful real-time KPI overviews showing revenue, top items, and live order streams." },
    { icon: <GitBranch />, title: "Multi-Branch", desc: "Scale instantly. Centralized catalog management pushing menus to hundreds of branches." },
    { icon: <ShieldCheck />, title: "RBAC", desc: "Strict role-based access control ensuring cashiers, managers, and admins only see what they need." },
    { icon: <UserCheck />, title: "Authentication", desc: "Secure, token-based JWT authentication keeping your enterprise data strictly locked down." }
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-container">
          <div className="landing-logo">
            <Sparkles className="logo-icon-glow" />
            <span>CulinaFlow</span>
          </div>
          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </nav>
          <div className="header-actions">
            <button className="btn btn-primary nav-cta-btn" onClick={handleCTA}>
              {user ? "Go to Dashboard" : "Sign In"}
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-bg-gradients">
          <div className="gradient-orb orb-primary"></div>
          <div className="gradient-orb orb-accent"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            CulinaFlow OS v2.0
          </div>
          <h1>Smart Restaurant Operations, Simplified.</h1>
          <p>
            An enterprise-grade POS and inventory framework designed for speed, consistency, and multi-branch intelligence. Stop managing software and start managing your restaurant.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary cta-large" onClick={handleCTA}>
              Get Started Now <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn btn-secondary cta-large-sec">Explore Features</a>
          </div>
        </div>

        <div className="hero-illustration">
          <div className="mock-saas-window">
            <div className="mock-window-header">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="mock-window-body">
              <div className="mock-sidebar">
                <div className="mock-bar mock-bar-short"></div>
                <div className="mock-bar"></div>
                <div className="mock-bar"></div>
                <div className="mock-bar mock-bar-short"></div>
              </div>
              <div className="mock-main">
                <div className="mock-kpi-row">
                  <div className="mock-kpi-card"><TrendingUp size={24} className="mock-icon" /><div className="mock-bar"></div></div>
                  <div className="mock-kpi-card"><ShoppingBag size={24} className="mock-icon" /><div className="mock-bar"></div></div>
                  <div className="mock-kpi-card"><Users size={24} className="mock-icon" /><div className="mock-bar"></div></div>
                </div>
                <div className="mock-chart-card">
                  <div className="mock-chart-bars">
                    <div className="mock-chart-bar" style={{height: "40%"}}></div>
                    <div className="mock-chart-bar" style={{height: "70%"}}></div>
                    <div className="mock-chart-bar" style={{height: "50%"}}></div>
                    <div className="mock-chart-bar" style={{height: "90%"}}></div>
                    <div className="mock-chart-bar" style={{height: "60%"}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Everything you need. Nothing you don't.</h2>
          <p>A unified suite combining point-of-sale, back-office, and analytics in one beautiful package.</p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => (
            <ScrollReveal key={idx} delay={idx * 50}>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  {feat.icon}
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
      
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Sparkles className="logo-icon-glow" />
            <span>CulinaFlow</span>
          </div>
          <p>© 2026 CulinaFlow Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
