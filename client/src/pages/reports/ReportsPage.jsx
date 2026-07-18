import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { TrendingUp, Calendar, CreditCard, Award } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function ReportsPage() {
  const { apiRequest } = useAuth();
  const [paymentReport, setPaymentReport] = useState([]);
  const [cashierReport, setCashierReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter dates (Default: current month)
  const getFirstDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [payRes, cashierRes] = await Promise.all([
        apiRequest(`/reports/sales-by-payment?startDate=${startDate}&endDate=${endDate}`),
        apiRequest(`/reports/cashier-performance?startDate=${startDate}&endDate=${endDate}`),
      ]);

      if (payRes.success) setPaymentReport(payRes.data);
      if (cashierRes.success) setCashierReport(cashierRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const calculateTotalSales = () => {
    return paymentReport.reduce((sum, item) => sum + item.amount, 0);
  };

  if (loading && paymentReport.length === 0) return <div className="loading-spinner">Loading reports data...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <TrendingUp style={{ color: "var(--accent)" }} />
          Reports & Analytics
        </h2>

        {/* Date Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--glass-bg)", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Calendar style={{ width: "16px", height: "16px", color: "var(--secondary)" }} />
          <input
            type="date"
            className="form-control"
            style={{ width: "130px", padding: "4px 8px" }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ fontSize: "12px", color: "var(--secondary)" }}>to</span>
          <input
            type="date"
            className="form-control"
            style={{ width: "130px", padding: "4px 8px" }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        {/* Sales by Payment Method */}
        <div className="glass-card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
            <CreditCard style={{ color: "var(--accent)" }} />
            Sales by Payment Method
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            {paymentReport.map((item) => {
              const total = calculateTotalSales();
              const pct = total > 0 ? (item.amount / total) * 100 : 0;
              return (
                <div key={item.method}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                    <span>{item.method}</span>
                    <span>{formatCurrency(item.amount)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: "4px" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "12px", marginTop: "12px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "16px" }}>
              <span>Total Revenue</span>
              <span style={{ color: "var(--success)" }}>{formatCurrency(calculateTotalSales())}</span>
            </div>
          </div>
        </div>

        {/* Cashier Performance Report */}
        <div className="glass-card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
            <Award style={{ color: "var(--accent)" }} />
            Staff Performance Ledger
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Cashier Profile</th>
                  <th>Employee Code</th>
                  <th>Bills Checked</th>
                  <th>Total Sales (₹)</th>
                  <th>Avg Ticket (₹)</th>
                  <th>Total Discounts (₹)</th>
                </tr>
              </thead>
              <tbody>
                {cashierReport.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }} className="empty-state">
                      No cashier sales recorded during this date window.
                    </td>
                  </tr>
                ) : (
                  cashierReport.map((cash) => (
                    <tr key={cash._id}>
                      <td style={{ fontWeight: 600, color: "var(--text-h)" }}>{cash.cashierName}</td>
                      <td>
                        <span className="badge badge-info">{cash.employeeCode}</span>
                      </td>
                      <td>{cash.billsProcessed}</td>
                      <td style={{ fontWeight: 700, color: "var(--success)" }}>{formatCurrency(cash.revenue)}</td>
                      <td>{formatCurrency(cash.averageBillValue)}</td>
                      <td style={{ color: "var(--danger)" }}>-{formatCurrency(cash.totalDiscount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
