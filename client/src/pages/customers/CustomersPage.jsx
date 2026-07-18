import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UsersRound, Plus, Phone, Mail, FileClock, History } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function CustomersPage() {
  const { apiRequest, user: currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // History State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await apiRequest("/customers");
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreateModal = () => {
    setCustomerId(null);
    setName("");
    setPhone("");
    setEmail("");
    setError(null);
    setShowModal(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify({ name, phone, email: email || null }),
      });
      if (res.success) {
        setShowModal(false);
        fetchCustomers();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadHistory = async (customer) => {
    setSelectedCustomer(customer);
    setHistoryList([]);
    setLoadingHistory(true);
    try {
      const res = await apiRequest(`/customers/${customer._id}/history`);
      if (res.success) {
        setHistoryList(res.data);
      }
    } catch (err) {
      alert(`Failed to load history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading customer profiles...</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", alignItems: "start" }}>
      {/* Left side: Customers Directory list */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <UsersRound style={{ color: "var(--accent)" }} />
            Customer Profiles
          </h3>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus style={{ width: "16px", height: "16px" }} />
            New Profile
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Phone</th>
                <th>Email</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }} className="empty-state">
                    No customers found. Attach a profile during checkout.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c._id}
                    style={{ cursor: "pointer", background: selectedCustomer?._id === c._id ? "rgba(170, 59, 255, 0.05)" : "transparent" }}
                    onClick={() => loadHistory(c)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{c.name}</div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Phone style={{ width: "12px", height: "12px" }} /> {c.phone}
                      </span>
                    </td>
                    <td>
                      {c.email ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Mail style={{ width: "12px", height: "12px" }} /> {c.email}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => loadHistory(c)}>
                        <FileClock style={{ width: "14px", height: "14px" }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right side: Purchase History Ledger panel */}
      <div className="glass-card">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
          <History style={{ color: "var(--accent)" }} />
          Purchase Ledger
        </h3>

        {!selectedCustomer ? (
          <p className="empty-state">Select a customer from directory to view their transaction history.</p>
        ) : (
          <div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
              <div style={{ fontWeight: 700, color: "var(--text-h)", fontSize: "16px" }}>{selectedCustomer.name}</div>
              <div style={{ fontSize: "13px", color: "var(--secondary)", marginTop: "4px" }}>
                Phone: {selectedCustomer.phone} {selectedCustomer.email ? `| Email: ${selectedCustomer.email}` : ""}
              </div>
            </div>

            {loadingHistory ? (
              <div className="loading-spinner">Fetching invoice details...</div>
            ) : historyList.length === 0 ? (
              <p className="empty-state">No transaction records found for this customer.</p>
            ) : (
              <div style={{ display: "flex", flexContent: "column", flexDirection: "column", gap: "12px" }}>
                {historyList.map((order) => (
                  <div key={order._id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "14px", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-h)" }}>{order.orderNumber}</span>
                      <span className="badge badge-success">{formatCurrency(order.grandTotal)}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--secondary)", display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border)", paddingBottom: "6px", marginBottom: "6px" }}>
                      <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>Branch ID: Connected</span>
                    </div>
                    <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "12px", color: "var(--text)" }}>
                      {order.items?.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "2px" }}>
                          {item.name} {item.variantName ? `(${item.variantName})` : ""} - x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Create Customer Profile</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Alice Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. alice@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
