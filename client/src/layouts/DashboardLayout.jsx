import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Tags,
  Coffee,
  Package,
  Layers,
  ShoppingBag,
  UsersRound,
  Truck,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/billing",
      label: "POS Terminal",
      icon: ShoppingBag,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"],
    },
    {
      to: "/branches",
      label: "Branches",
      icon: GitBranch,
      roles: ["SUPER_ADMIN"],
    },
    {
      to: "/users",
      label: "Staff / Users",
      icon: Users,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/categories",
      label: "Categories",
      icon: Tags,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/products",
      label: "Menu & Products",
      icon: Coffee,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/inventory",
      label: "Inventory Stock",
      icon: Package,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/ingredients",
      label: "Ingredients",
      icon: Layers,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"],
      condition: () => {
        if (hasRole(["SUPER_ADMIN", "BRANCH_ADMIN"])) return true;
        return user?.hasIngredientsAccess;
      },
    },
    {
      to: "/customers",
      label: "Customers Profile",
      icon: UsersRound,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"],
    },
    {
      to: "/suppliers",
      label: "Suppliers",
      icon: Truck,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/reports",
      label: "Reports & Sales",
      icon: TrendingUp,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN"],
    },
    {
      to: "/audit-logs",
      label: "Audit Trails",
      icon: FileText,
      roles: ["SUPER_ADMIN"],
    },
    {
      to: "/settings",
      label: "Change Password",
      icon: Settings,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"],
    },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles className="logo-icon" />
            <span className="logo-text">SOP POS</span>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <div className="user-profile-badge">
          <div className="avatar-circle">
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h4 className="user-name">
              {user?.firstName} {user?.lastName}
            </h4>
            <span className="user-role-label">
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems
              .filter((item) => hasRole(item.roles))
              .filter((item) => (item.condition ? item.condition() : true))
              .map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      <IconComponent className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button 
              className="hamburger-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Open menu"
            >
              <Menu style={{ width: "20px", height: "20px" }} />
            </button>
            <div className="header-breadcrumbs">
              <span className="breadcrumb-current">SOP POS & Inventory Platform</span>
            </div>
          </div>
          <div className="header-status">
            <span className="branch-badge">
              Branch: {user?.branchId ? `Branch Connected` : "All Branches"}
            </span>
          </div>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
