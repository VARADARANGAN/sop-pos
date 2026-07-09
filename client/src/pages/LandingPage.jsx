import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Sparkles, Shield, ShoppingBag, Layers, GitBranch, 
  Users, UsersRound, Truck, TrendingUp, Cpu, ArrowRight 
} from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Monitor scroll for parallax calculations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer hook to trigger slide-in reveal animations
  const ScrollReveal = ({ children }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.15 }
      );
      if (ref.current) {
        observer.observe(ref.current);
      }
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, []);

    return (
      <div ref={ref} className={`reveal-section ${isVisible ? "revealed" : ""}`}>
        {children}
      </div>
    );
  };

  const handleCTA = () => {
    if (user) {
      if (user.role === "CASHIER") navigate("/billing");
      else navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="landing-page">
      {/* Sticky Header Nav */}
      <header className="landing-header">
        <div className="header-container">
          <div className="landing-logo">
            <Sparkles className="logo-icon-glow" />
            <span>SOP POS</span>
          </div>
          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
            <a href="#about">About</a>
          </nav>
          <button className="btn btn-primary nav-cta-btn" onClick={handleCTA}>
            {user ? "Enter Terminal" : "Access Terminal"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Parallax background shapes */}
        <div className="hero-bg-glow" style={{ transform: `translateY(${scrollY * 0.3}px)` }}></div>
        <div className="hero-mesh" style={{ transform: `translateY(${scrollY * 0.15}px)` }}></div>

        <div className="hero-content">
          <span className="hero-tagline">
            <Sparkles className="inline-icon" /> Premium Gastronomy OS
          </span>
          <h1>The Operating System for Modern Restaurants</h1>
          <p>
            An enterprise-grade POS and inventory framework designed for speed, 
            consistency, and multi-branch intelligence. Built for modern dining.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary cta-large" onClick={handleCTA}>
              Get Started Free <ArrowRight style={{ width: "16px", height: "16px" }} />
            </button>
            <a href="#features" className="btn btn-secondary cta-large-sec">Explore Features</a>
          </div>
        </div>

        {/* Floating POS Tablet Mockup (Interactive CSS Design) */}
        <div className="hero-mockup-wrapper" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
          <div className="tablet-frame">
            <div className="tablet-screen">
              <div className="mock-pos-header">
                <div className="mock-pos-title">SOP POS Terminal</div>
                <div className="mock-pos-badge">Branch: connected</div>
              </div>
              <div className="mock-pos-workspace">
                <div className="mock-pos-menu">
                  <div className="mock-menu-tabs">
                    <span className="tab-active">Beverages</span>
                    <span>Pizza</span>
                    <span>Pasta</span>
                  </div>
                  <div className="mock-menu-grid">
                    <div className="mock-item-card">
                      <h5>Espresso Double</h5>
                      <span>$4.50</span>
                    </div>
                    <div className="mock-item-card">
                      <h5>Cappuccino</h5>
                      <span>$5.20</span>
                    </div>
                    <div className="mock-item-card">
                      <h5>Iced Latte</h5>
                      <span>$6.00</span>
                    </div>
                    <div className="mock-item-card">
                      <h5>Flat White</h5>
                      <span>$5.50</span>
                    </div>
                  </div>
                </div>
                <div className="mock-pos-cart">
                  <div className="mock-cart-title">Billing Cart</div>
                  <div className="mock-cart-items">
                    <div className="mock-cart-item">
                      <span>Cappuccino (Large)</span>
                      <span>1x $5.20</span>
                    </div>
                    <div className="mock-cart-item">
                      <span>Iced Latte (Regular)</span>
                      <span>2x $12.00</span>
                    </div>
                  </div>
                  <div className="mock-cart-totals">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Subtotal</span>
                      <span>$17.20</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--text-h)" }}>
                      <span>Total Due</span>
                      <span>$18.06</span>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%", padding: "6px", fontSize: "11px", marginTop: "10px" }} onClick={handleCTA}>Checkout Order</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature storytelling list */}
      <section id="features" className="features-showcase">
        <div className="section-header-block">
          <h2>Engineered for High-Performance Dining</h2>
          <p>Every workflow optimized for sub-second responses, database guarantees, and visual clarity.</p>
        </div>

        {/* Feature 1: POS Billing */}
        <ScrollReveal>
          <div className="feature-block">
            <div className="feature-info">
              <div className="feature-icon"><ShoppingBag /></div>
              <h3>Smart POS Billing</h3>
              <p>
                Record orders in milliseconds, apply cashier-capped discounts, and handle split bills dynamically. 
                Keep orders parked server-side with our hold & resume order tray.
              </p>
            </div>
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-receipt">
                  <div style={{ textAlign: "center", marginBottom: "8px", borderBottom: "1px dashed var(--border)", paddingBottom: "8px" }}>
                    <h4>SOP TERMINAL</h4>
                    <span>Order: #ORD-98831</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", fontSize: "12px" }}>
                    <span>1x Classic Burger (Double Cheese)</span>
                    <span>$12.50</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", fontSize: "12px" }}>
                    <span>1x French Fries (Large)</span>
                    <span>$5.50</span>
                  </div>
                  <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "8px", marginTop: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                      <span>Total Settled</span>
                      <span>$18.90</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)", marginTop: "4px" }}>
                      <span>Paid: Card/UPI Split</span>
                      <span>Done</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 2: Inventory & Stock */}
        <ScrollReveal>
          <div className="feature-block reverse">
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-stock-adjust">
                  <h4>Inventory Stock levels</h4>
                  <div className="stock-level-bar">
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>Cheddar Cheese Slice</span>
                    <span className="badge badge-danger">Reorder Alert (2.5 KG Left)</span>
                  </div>
                  <div className="stock-level-bar" style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>Fresh Whole Milk</span>
                    <span className="badge badge-success">Sufficient (28.0 Litres)</span>
                  </div>
                  <button className="btn btn-secondary" style={{ width: "100%", marginTop: "16px", padding: "8px" }} onClick={handleCTA}>
                    Approve Stock Transfer Request
                  </button>
                </div>
              </div>
            </div>
            <div className="feature-info">
              <div className="feature-icon"><Layers /></div>
              <h3>Inventory & Stock Control</h3>
              <p>
                Keep track of items down to size variants and raw ingredients. Approve inter-branch stock 
                transfers atomically and write off wasted or damaged stock with reason logs.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 3: Categories & Combo Meals */}
        <ScrollReveal>
          <div className="feature-block">
            <div className="feature-info">
              <div className="feature-icon"><Cpu /></div>
              <h3>Categories, Variants & Combos</h3>
              <p>
                Organize menu items in flexible categories. Build product variants (Sizes, Options) with separate pricing, 
                and group items into Combo Meals that automatically track stock levels of component dishes.
              </p>
            </div>
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-combo-builder">
                  <h4>Meal Combo Builder</h4>
                  <div className="combo-wrapper">
                    <div className="combo-header">Combo: Happy Meal Bundle</div>
                    <ul className="combo-item-list">
                      <li>🍔 Cheeseburger (Variant: Double) - 1x</li>
                      <li>🍟 French Fries (Variant: Regular) - 1x</li>
                      <li>🥤 Coca Cola (Variant: Ice Cold) - 1x</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 4: Supplier & Procurement */}
        <ScrollReveal>
          <div className="feature-block reverse">
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-suppliers">
                  <h4>Suppliers directory</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="supplier-row">
                      <strong>Acme Organic Farms</strong>
                      <span>Linked: Avocado, Lettuce, Spinach</span>
                    </div>
                    <div className="supplier-row">
                      <strong>Metro Bakeries Inc</strong>
                      <span>Linked: Burger Buns, Sandwich Slices</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-info">
              <div className="feature-icon"><Truck /></div>
              <h3>Supplier & Procurement</h3>
              <p>
                Associate raw ingredients and menu items directly with suppliers. Manage profiles, contact coordinates, 
                and trace shipments back to branches.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 5: Multi-Branch */}
        <ScrollReveal>
          <div className="feature-block">
            <div className="feature-info">
              <div className="feature-icon"><GitBranch /></div>
              <h3>Multi-Branch Administration</h3>
              <p>
                Enforce clean role permissions. Super Admins oversee the entire system, while Branch Admins and Cashiers 
                are locked to their respective branch locations.
              </p>
            </div>
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-branches">
                  <h4>Connected Branches Map</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="branch-card-mock">
                      <h5>Times Square Outlet</h5>
                      <span>Active Cashiers: 4</span>
                    </div>
                    <div className="branch-card-mock">
                      <h5>Soho Kitchen</h5>
                      <span>Active Cashiers: 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 6: Customer History */}
        <ScrollReveal>
          <div className="feature-block reverse">
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-customer">
                  <h4>Customer Profile</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div className="avatar-circle" style={{ width: "32px", height: "32px", fontSize: "12px" }}>JD</div>
                    <div style={{ textAlign: "left" }}>
                      <h5 style={{ margin: 0 }}>John Doe</h5>
                      <span style={{ fontSize: "11px", color: "var(--text)" }}>+1-555-0199</span>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "8px" }}>
                    <strong>Last Order:</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "12px" }}>Cappuccino Large x2, Cranberry Scone x1</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-info">
              <div className="feature-icon"><UsersRound /></div>
              <h3>Customer Profiles & History</h3>
              <p>
                Bind purchases directly to customer records. View loyalty history, average bill sizes, and preferences 
                directly from the POS checkout screen.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 7: Lockout & Roles */}
        <ScrollReveal>
          <div className="feature-block">
            <div className="feature-info">
              <div className="feature-icon"><Shield /></div>
              <h3>Secure Auth & Lockout Policies</h3>
              <p>
                Defend terminals from brute force attempts with automatic 15-minute lockouts after 5 failed login attempts. 
                Every security lockout is logged to the system audit trail.
              </p>
            </div>
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-security">
                  <div className="alert alert-danger" style={{ margin: 0 }}>
                    <strong>LOCKOUT WARNING:</strong>
                    <br />
                    This account is temporarily suspended for 15 minutes due to consecutive invalid credentials.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 8: Analytics & Reports */}
        <ScrollReveal>
          <div className="feature-block reverse">
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-analytics">
                  <h4>Sales revenue</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "100px", padding: "10px 0" }}>
                    <div style={{ height: "40%", width: "20px", background: "var(--border)", borderRadius: "4px" }}></div>
                    <div style={{ height: "60%", width: "20px", background: "var(--border)", borderRadius: "4px" }}></div>
                    <div style={{ height: "90%", width: "20px", background: "var(--primary)", borderRadius: "4px" }}></div>
                    <div style={{ height: "75%", width: "20px", background: "var(--accent)", borderRadius: "4px" }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text)" }}>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-info">
              <div className="feature-icon"><TrendingUp /></div>
              <h3>Analytics & Sales Reporting</h3>
              <p>
                Aggregate sales collections by payment methods (Cash, Card, UPI) and trace cashier performance metrics 
                over customized dates.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature 9: Scalable Architecture */}
        <ScrollReveal>
          <div className="feature-block">
            <div className="feature-info">
              <div className="feature-icon"><Cpu /></div>
              <h3>Fast, Secure & Scalable Architecture</h3>
              <p>
                Powered by Node.js, Express, MongoDB Atlas, and React. Transactions are fully isolated and atomic, 
                guaranteeing stock deductions and payments succeed or rollback safely.
              </p>
            </div>
            <div className="feature-visual">
              <div className="mock-card-glow">
                <div className="mock-tech-stack">
                  <div className="tech-badge">Express</div>
                  <div className="tech-badge">MongoDB</div>
                  <div className="tech-badge">React 19</div>
                  <div className="tech-badge">JWT Cookies</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer Section */}
      <footer id="about" className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Sparkles className="logo-icon-glow" />
            <h3>SOP POS & Inventory Framework</h3>
            <p>The premium management tool for modern restaurant operators.</p>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} SOP POS Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
