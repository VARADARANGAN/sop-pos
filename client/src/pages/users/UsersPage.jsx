import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Users, Plus, Edit, Trash2, Key } from "lucide-react";

export default function UsersPage() {
  const { apiRequest, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");
  const [branchId, setBranchId] = useState("");
  const [phone, setPhone] = useState("");

  const fetchData = async () => {
    try {
      const [usersRes, branchesRes] = await Promise.all([
        apiRequest("/users"),
        currentUser.role === "SUPER_ADMIN" ? apiRequest("/branches") : Promise.resolve({ success: true, data: [] }),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data);
      }
      if (branchesRes.success) {
        setBranches(branchesRes.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setUserId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("CASHIER");
    setBranchId(currentUser.role === "SUPER_ADMIN" ? "" : currentUser.branchId || "");
    setPhone("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setUserId(user._id);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword(""); // Keep blank to avoid modifying unless entered
    setRole(user.role);
    setBranchId(user.branchId || "");
    setPhone(user.phone || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      firstName,
      lastName,
      email,
      role,
      branchId: branchId || null,
      phone,
    };
    if (password) {
      payload.password = password;
    } else if (!userId) {
      return setError("Password is required for new users");
    }

    try {
      let res;
      if (userId) {
        res = await apiRequest(`/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      if (res.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff user?")) return;
    try {
      const res = await apiRequest(`/users/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading users data...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Users style={{ color: "var(--accent)" }} />
          Staff Directory
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus style={{ width: "16px", height: "16px" }} />
          Add User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Assigned Role</th>
                <th>Branch</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }} className="empty-state">
                    No staff users configured.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <span className="badge badge-info">{u.employeeCode}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-h)" }}>
                      {u.firstName} {u.lastName}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <span className={`badge ${u.role === "SUPER_ADMIN" ? "badge-danger" : u.role === "BRANCH_ADMIN" ? "badge-warning" : "badge-success"}`}>
                        {u.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td>{u.branchId ? u.branchId.branchName || "Assigned" : "All Branches"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(u)}>
                          <Edit style={{ width: "14px", height: "14px" }} />
                        </button>
                        {u._id !== currentUser.id && (
                          <button className="btn btn-danger" style={{ padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleDelete(u._id)}>
                            <Trash2 style={{ width: "14px", height: "14px" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>{userId ? "Edit Staff details" : "Add New Staff Member"}</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@sop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password {userId && "(leave blank to keep current)"}</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!userId}
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
                  <label className="form-label">Assigned Role</label>
                  <select
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={currentUser.role !== "SUPER_ADMIN"}
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="BRANCH_ADMIN">Branch Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                {currentUser.role === "SUPER_ADMIN" ? (
                  <div className="form-group">
                    <label className="form-label">Assigned Branch</label>
                    <select
                      className="form-control"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      required={role !== "SUPER_ADMIN"}
                      disabled={role === "SUPER_ADMIN"}
                    >
                      <option value="">-- Select Branch --</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.branchName} ({b.branchCode})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {userId ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
