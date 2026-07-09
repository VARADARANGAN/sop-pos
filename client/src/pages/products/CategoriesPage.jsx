import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Tags, Plus, Edit, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const { apiRequest } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await apiRequest("/categories");
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setCategoryId(null);
    setCategoryName("");
    setDescription("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setCategoryId(cat._id);
    setCategoryName(cat.categoryName);
    setDescription(cat.description || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { categoryName, description };
    try {
      let res;
      if (categoryId) {
        res = await apiRequest(`/categories/${categoryId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      if (res.success) {
        setShowModal(false);
        fetchCategories();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await apiRequest(`/categories/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchCategories();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading categories...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Tags style={{ color: "var(--accent)" }} />
          Product Categories
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus style={{ width: "16px", height: "16px" }} />
          Add Category
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }} className="empty-state">
                    No product categories configured.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600, color: "var(--text-h)" }}>{c.categoryName}</td>
                    <td>{c.description || "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(c)}>
                          <Edit style={{ width: "14px", height: "14px" }} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleDelete(c._id)}>
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
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>{categoryId ? "Edit Category" : "Add New Category"}</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Beverages, Mains, Desserts"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Category details"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {categoryId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
