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
import { Button } from "@/components/ui/button";

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
      label: "Settings",
      icon: Settings,
      roles: ["SUPER_ADMIN", "BRANCH_ADMIN", "CASHIER"],
    },
  ];

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/60 shadow-lg shadow-primary/5 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>CulinaFlow</span>
          </div>
          <button 
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 mx-4 mt-4 mb-2 rounded-xl bg-muted/50 border border-border/50 shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground font-medium truncate uppercase tracking-wider">
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1 custom-scrollbar">
          {navItems
            .filter((item) => hasRole(item.roles))
            .filter((item) => (item.condition ? item.condition() : true))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>

        <div className="p-4 border-t border-border/40 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-card shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-semibold text-lg text-foreground hidden sm:block">
              {/* Breadcrumb could go here if we wanted */}
              Workspace Overview
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
              {user?.branchId ? "Branch Connected" : "All Branches"}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
