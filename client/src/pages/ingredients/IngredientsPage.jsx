import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Layers, Plus, Edit, Trash2, ShieldCheck, Settings } from "lucide-react";

export default function IngredientsPage() {
  const { apiRequest, user: currentUser, hasRole } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory"); // inventory | permissions

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [ingredientId, setIngredientId] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("KG");
  const [reorderLevel, setReorderLevel] = useState(10);
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);

  const fetchData = async () => {
    try {
      const [ingredientsRes, branchesRes] = await Promise.all([
        apiRequest("/ingredients"),
        currentUser.role === "SUPER_ADMIN" ? apiRequest("/branches") : Promise.resolve({ success: true, data: [] }),
      ]);

      if (ingredientsRes.success) setIngredients(ingredientsRes.data);
      if (branchesRes.success) setBranches(branchesRes.data);

      // If Admin, fetch cashiers to manage permissions
      if (hasRole(["SUPER_ADMIN", "BRANCH_ADMIN"])) {
        const usersRes = await apiRequest("/users");
        if (usersRes.success) {
          // Filter to only cashiers
          const filtered = usersRes.data.filter(u => u.role === "CASHIER");
          setCashiers(filtered);
        }
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
    setIngredientId(null);
    setName("");
    setQuantity(0);
    setUnit("KG");
    setReorderLevel(10);
    setBranchId(currentUser.role === "SUPER_ADMIN" ? "" : currentUser.branchId || "");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (ing) => {
    setIngredientId(ing._id);
    setName(ing.name);
    setQuantity(ing.quantity);
    setUnit(ing.unit);
    setReorderLevel(ing.reorderLevel || 10);
    setBranchId(ing.branchId?._id || ing.branchId || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { name, quantity, unit, reorderLevel, branchId };

    try {
      let res;
      if (ingredientId) {
        res = await apiRequest(`/ingredients/${ingredientId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/ingredients", {
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
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;
    try {
      const res = await apiRequest(`/ingredients/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAccess = async (cashierId, currentAccess) => {
    try {
      const res = await apiRequest("/ingredients/toggle-access", {
        method: "POST",
        body: JSON.stringify({ cashierId, hasAccess: !currentAccess }),
      });
      if (res.success) {
        // Update local cashiers list
        setCashiers(cashiers.map(c => c._id === cashierId ? { ...c, hasIngredientsAccess: !currentAccess } : c));
      }
    } catch (err) {
      alert(`Access toggle failed: ${err.message}`);
    }
  };

  if (loading) return <div className="loading-spinner">Loading kitchen ingredients...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers style={{ color: "var(--accent)" }} />
          Kitchen Raw Ingredients
        </h2>
        {activeTab === "inventory" && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus style={{ width: "16px", height: "16px" }} />
            Add Ingredient
          </button>
        )}
      </div>

      {hasRole(["SUPER_ADMIN", "BRANCH_ADMIN"]) && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            className={`btn ${activeTab === "inventory" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory Stock
          </button>
          <button
            className={`btn ${activeTab === "permissions" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("permissions")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ShieldCheck style={{ width: "16px", height: "16px" }} />
            Cashier Permissions
          </button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {activeTab === "inventory" ? (
        <div className="glass-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ingredient Name</th>
                  <th>Current Quantity</th>
                  <th>Unit</th>
                  <th>Min Level</th>
                  <th>Status</th>
                  <th>Assigned Branch</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }} className="empty-state">
                      No kitchen raw ingredients registered.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => {
                    const isLow = ing.quantity <= ing.reorderLevel;
                    return (
                      <tr key={ing._id}>
                        <td style={{ fontWeight: 600, color: "var(--text-h)" }}>{ing.name}</td>
                        <td>{ing.quantity}</td>
                        <td>{ing.unit}</td>
                        <td>{ing.reorderLevel}</td>
                        <td>
                          {isLow ? (
                            <span className="badge badge-danger">Low Stock</span>
                          ) : (
                            <span className="badge badge-success">Good</span>
                          )}
                        </td>
                        <td>{ing.branchId?.branchName || "All Branches"}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(ing)}>
                              <Edit style={{ width: "14px", height: "14px" }} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleDelete(ing._id)}>
                              <Trash2 style={{ width: "14px", height: "14px" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cashier Permissions Tab (SUPER_ADMIN / BRANCH_ADMIN only) */
        <div className="glass-card">
          <div style={{ marginBottom: "16px", fontSize: "14px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Settings style={{ width: "16px", height: "16px" }} />
            Toggle which Cashiers can view and write raw kitchen ingredients for their branch.
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th style={{ textAlign: "right" }}>Ingredients Access Toggle</th>
                </tr>
              </thead>
              <tbody>
                {cashiers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }} className="empty-state">
                      No cashier staff found.
                    </td>
                  </tr>
                ) : (
                  cashiers.map((cashier) => (
                    <tr key={cashier._id}>
                      <td>
                        <span className="badge badge-info">{cashier.employeeCode}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-h)" }}>{cashier.firstName} {cashier.lastName}</td>
                      <td>{cashier.email}</td>
                      <td>{cashier.branchId ? "Assigned" : "All Branches"}</td>
                      <td style={{ textAlign: "right" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={cashier.hasIngredientsAccess || false}
                            onChange={() => handleToggleAccess(cashier._id, cashier.hasIngredientsAccess)}
                          />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: cashier.hasIngredientsAccess ? "var(--success)" : "var(--secondary)" }}>
                            {cashier.hasIngredientsAccess ? "Authorized" : "Revoked"}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>{ingredientId ? "Edit Kitchen Stock" : "Add Kitchen Ingredient"}</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Ingredient Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. White Sugar, Fresh Milk, Flour"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Initial Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)}>
                      <option value="KG">KG</option>
                      <option value="GRAM">GRAM</option>
                      <option value="LITRE">LITRE</option>
                      <option value="ML">ML</option>
                      <option value="PCS">PCS</option>
                      <option value="BOX">BOX</option>
                      <option value="PACK">PACK</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Reorder Threshold</label>
                  <input
                    type="number"
                    className="form-control"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                  />
                </div>

                {currentUser.role === "SUPER_ADMIN" ? (
                  <div className="form-group">
                    <label className="form-label">Assigned Branch</label>
                    <select className="form-control" value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
                      <option value="">-- Select Branch --</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.branchName}
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
                  {ingredientId ? "Save Changes" : "Create Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
