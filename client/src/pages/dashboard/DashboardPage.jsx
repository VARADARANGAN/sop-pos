import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  DollarSign, ShoppingCart, AlertTriangle, Package, 
  TrendingUp, Activity, BarChart3, Clock, AlertCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { apiRequest, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiRequest("/reports/dashboard");
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-skeleton">
        <div className="skeleton-header"></div>
        <div className="skeleton-kpis">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
        <div className="skeleton-grid">
          <div className="skeleton-panel"></div>
          <div className="skeleton-panel"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={32} />
        <h4>Failed to load dashboard</h4>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate some derived stats for UI mock representation (growth metrics, etc)
  const avgOrderValue = stats.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders) : 0;

  return (
    <div className="saas-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back, {user?.name || "Manager"}. Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <span className="badge badge-success" style={{ padding: "6px 12px", fontSize: "14px" }}>
            <Activity size={16} /> Live Data Sync
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Today's Revenue</span>
            <div className="kpi-icon primary"><DollarSign size={20} /></div>
          </div>
          <div className="kpi-body">
            <h3>{formatCurrency(stats.todayRevenue || 0)}</h3>
            <span className="kpi-trend positive"><TrendingUp size={14} /> +12% from yesterday</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Orders</span>
            <div className="kpi-icon secondary"><ShoppingCart size={20} /></div>
          </div>
          <div className="kpi-body">
            <h3>{stats.todayOrders || 0}</h3>
            <span className="kpi-trend positive"><TrendingUp size={14} /> +5% from yesterday</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg. Order Value</span>
            <div className="kpi-icon accent"><BarChart3 size={20} /></div>
          </div>
          <div className="kpi-body">
            <h3>{formatCurrency(avgOrderValue)}</h3>
            <span className="kpi-trend neutral">Stable across shifts</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Low Stock Alerts</span>
            <div className="kpi-icon warning"><AlertTriangle size={20} /></div>
          </div>
          <div className="kpi-body">
            <h3>{stats.lowStockCount || 0}</h3>
            <span className="kpi-trend negative">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column: Top Sellers */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Best Selling Items</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="panel-body">
            {stats.topProducts?.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <p>No sales data available for today yet.</p>
              </div>
            ) : (
              <div className="list-group">
                {stats.topProducts?.map((item, index) => (
                  <div className="list-item" key={item._id}>
                    <div className="item-rank">{index + 1}</div>
                    <div className="item-details">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-meta">{item.quantitySold} units sold</span>
                    </div>
                    <div className="item-value">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Low Stock Alerts */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Inventory Alerts</h3>
            <button className="btn-text">Manage Stock</button>
          </div>
          <div className="panel-body">
            {stats.lowStockDetails?.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={32} style={{ color: "var(--success)" }} />
                <p>All stock levels are optimal.</p>
              </div>
            ) : (
              <div className="list-group">
                {stats.lowStockDetails?.map((item) => (
                  <div className="list-item warning-item" key={item._id}>
                    <div className="item-details">
                      <span className="item-name">{item.productId?.productName || item.name}</span>
                      <span className="item-meta">Min Level: {item.reorderLevel} • Branch: {item.branchId?.branchName || "Main"}</span>
                    </div>
                    <div className="item-badge danger">
                      {item.currentStock} {item.unit || "Left"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Visual Chart Placeholder for SaaS feel */}
      <div className="dashboard-panel full-width">
         <div className="panel-header">
            <h3>Sales Trends Overview</h3>
            <div className="header-filters">
              <span className="filter-chip active">Today</span>
              <span className="filter-chip">7 Days</span>
              <span className="filter-chip">30 Days</span>
            </div>
          </div>
          <div className="panel-body">
             <div className="mock-area-chart">
               {/* Pure CSS decorative chart */}
               <div className="chart-grid-lines">
                 <div className="line"></div>
                 <div className="line"></div>
                 <div className="line"></div>
                 <div className="line"></div>
               </div>
               <div className="chart-bars-wrapper">
                 {[40, 65, 30, 80, 50, 95, 75, 40, 60, 20, 85, 100].map((h, i) => (
                   <div key={i} className="chart-bar-col">
                     <div className="chart-bar-fill" style={{ height: `${h}%` }}></div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
      </div>

    </div>
  );
}

