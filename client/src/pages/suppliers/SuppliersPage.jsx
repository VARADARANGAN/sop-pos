import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Truck, Plus, Edit, Trash2 } from "lucide-react";

export default function SuppliersPage() {
  const { apiRequest, user: currentUser } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const fetchData = async () => {
    try {
      const [suppliersRes, branchesRes, productsRes, ingredientsRes] = await Promise.all([
        apiRequest("/suppliers"),
        currentUser.role === "SUPER_ADMIN" ? apiRequest("/branches") : Promise.resolve({ success: true, data: [] }),
        apiRequest("/products"),
        apiRequest("/ingredients"),
      ]);

      if (suppliersRes.success) setSuppliers(suppliersRes.data);
      if (branchesRes.success) setBranches(branchesRes.data);
      if (productsRes.success) setProducts(productsRes.data);
      if (ingredientsRes.success) setIngredients(ingredientsRes.data);
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
    setSupplierId(null);
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setBranchId(currentUser.role === "SUPER_ADMIN" ? "" : currentUser.branchId || "");
    setSelectedProducts([]);
    setSelectedIngredients([]);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (sup) => {
    setSupplierId(sup._id);
    setName(sup.name);
    setContactName(sup.contactName || "");
    setPhone(sup.phone);
    setEmail(sup.email || "");
    setBranchId(sup.branchId?._id || sup.branchId || "");
    setSelectedProducts(sup.linkedProducts?.map(p => p._id || p) || []);
    setSelectedIngredients(sup.linkedIngredients?.map(i => i._id || i) || []);
    setError(null);
    setShowModal(true);
  };

  const handleProductSelect = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleIngredientSelect = (id) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      contactName,
      phone,
      email: email || null,
      branchId,
      linkedProducts: selectedProducts,
      linkedIngredients: selectedIngredients,
    };

    try {
      let res;
      if (supplierId) {
        res = await apiRequest(`/suppliers/${supplierId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/suppliers", {
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
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const res = await apiRequest(`/suppliers/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading suppliers...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Truck style={{ color: "var(--accent)" }} />
          Suppliers Registry
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus style={{ width: "16px", height: "16px" }} />
          Add Supplier
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Representative</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Assigned Branch</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }} className="empty-state">
                    No suppliers configured.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{s.name}</div>
                      {((s.linkedProducts && s.linkedProducts.length > 0) || (s.linkedIngredients && s.linkedIngredients.length > 0)) && (
                        <div style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "4px" }}>
                          Supplies: {[
                            ...(s.linkedProducts?.map(p => p.productName) || []),
                            ...(s.linkedIngredients?.map(i => i.name) || [])
                          ].join(", ") || "Nothing linked"}
                        </div>
                      )}
                    </td>
                    <td>{s.contactName || "-"}</td>
                    <td>{s.phone}</td>
                    <td>{s.email || "-"}</td>
                    <td>{s.branchId?.branchName || "All Branches"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(s)}>
                          <Edit style={{ width: "14px", height: "14px" }} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleDelete(s._id)}>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ width: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3>{supplierId ? "Edit Supplier Info" : "Add New Supplier"}</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Supplier Company/Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acme Organic Fruits"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Marcus Aurelius"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. sales@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
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

                {/* Linked Products & Ingredients list */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px dashed var(--border)", paddingTop: "16px" }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>Link Products</label>
                    <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", padding: "8px", borderRadius: "6px" }}>
                      {products.map(p => (
                        <label key={p._id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", marginBottom: "6px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(p._id)}
                            onChange={() => handleProductSelect(p._id)}
                          />
                          {p.productName}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>Link Ingredients</label>
                    <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border)", padding: "8px", borderRadius: "6px" }}>
                      {ingredients.map(i => (
                        <label key={i._id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", marginBottom: "6px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(i._id)}
                            onChange={() => handleIngredientSelect(i._id)}
                          />
                          {i.name} ({i.unit})
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {supplierId ? "Save Changes" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
