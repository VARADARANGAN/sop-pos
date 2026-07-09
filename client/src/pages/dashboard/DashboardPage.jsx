import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { DollarSign, ShoppingCart, AlertTriangle, Flame, AlertCircle } from "lucide-react";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { apiRequest } = useAuth();
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
    return <div className="loading-spinner" style={{ marginTop: "40px" }}>Loading dashboard stats...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="dashboard-grid">
      {/* Top Metrics Cards */}
      <div className="metrics-row">
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <DollarSign />
          </div>
          <div className="metric-info">
            <span className="metric-title">Today's Revenue</span>
            <h3 className="metric-value">${stats.todayRevenue?.toFixed(2) || "0.00"}</h3>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
            <ShoppingCart />
          </div>
          <div className="metric-info">
            <span className="metric-title">Today's Orders</span>
            <h3 className="metric-value">{stats.todayOrders || 0}</h3>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <AlertTriangle />
          </div>
          <div className="metric-info">
            <span className="metric-title">Low Stock Items</span>
            <h3 className="metric-value">{stats.lowStockCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Low Stock List, Right Top Products */}
      <div className="dashboard-content-grid">
        {/* Low Stock Alerts */}
        <div className="glass-card table-section">
          <h3 className="section-title">
            <AlertCircle style={{ color: "#f59e0b" }} />
            Low Stock Alerts
          </h3>
          {stats.lowStockDetails?.length === 0 ? (
            <p className="empty-state">No items are currently low on stock.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product / Ingredient</th>
                    <th>Branch</th>
                    <th>Min Level</th>
                    <th>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockDetails?.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-h)" }}>
                          {item.productId?.productName || item.name}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--secondary)" }}>
                          {item.productId?.productCode || "Raw supply"}
                        </span>
                      </td>
                      <td>{item.branchId?.branchName}</td>
                      <td>{item.reorderLevel}</td>
                      <td>
                        <span className="badge badge-danger">
                          {item.currentStock ?? item.quantity} {item.productId?.unit || item.unit || "PCS"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="glass-card list-section">
          <h3 className="section-title">
            <Flame style={{ color: "#ef4444" }} />
            Top Selling Menu Items
          </h3>
          {stats.topProducts?.length === 0 ? (
            <p className="empty-state">No order sales records found yet.</p>
          ) : (
            <ul className="top-selling-list">
              {stats.topProducts?.map((prod, index) => (
                <li key={prod._id} className="top-selling-item">
                  <div className="item-rank">{index + 1}</div>
                  <div className="item-details">
                    <h4>{prod.productName}</h4>
                    <span>{prod.quantitySold} units sold</span>
                  </div>
                  <div className="item-revenue">${prod.revenue?.toFixed(2)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
