import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GitBranch, Plus, Edit, Trash2 } from "lucide-react";

export default function BranchesPage() {
  const { apiRequest } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [branchId, setBranchId] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const fetchBranches = async () => {
    try {
      const res = await apiRequest("/branches");
      if (res.success) {
        setBranches(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openCreateModal = () => {
    setBranchId(null);
    setBranchName("");
    setBranchCode("");
    setAddress("");
    setPhone("");
    setEmail("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setBranchId(branch._id);
    setBranchName(branch.branchName);
    setBranchCode(branch.branchCode);
    setAddress(branch.address || "");
    setPhone(branch.phone || "");
    setEmail(branch.email || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { branchName, branchCode, address, phone, email };
    try {
      let res;
      if (branchId) {
        res = await apiRequest(`/branches/${branchId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/branches", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      if (res.success) {
        setShowModal(false);
        fetchBranches();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      const res = await apiRequest(`/branches/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchBranches();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading branches...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <GitBranch style={{ color: "var(--accent)" }} />
          Branch Directory
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus style={{ width: "16px", height: "16px" }} />
          Add Branch
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Branch Code</th>
                <th>Branch Name</th>
                <th>Contact Phone</th>
                <th>Email Address</th>
                <th>Location / Address</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }} className="empty-state">
                    No branches configured in the system.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="badge badge-info">{b.branchCode}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-h)" }}>{b.branchName}</td>
                    <td>{b.phone || "-"}</td>
                    <td>{b.email || "-"}</td>
                    <td>{b.address || "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(b)}>
                          <Edit style={{ width: "14px", height: "14px" }} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleDelete(b._id)}>
                          <Trash2 style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Dialog Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>{branchId ? "Edit Branch details" : "Add New Branch"}</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Branch Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BR001"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    required
                    disabled={!!branchId}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Times Square Outlet"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. branch@sop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    placeholder="Location details"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {branchId ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
