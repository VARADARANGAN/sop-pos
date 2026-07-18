import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Coffee, Plus, Edit, Trash2, Layers, Tag } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function ProductsPage() {
  const { apiRequest, user: currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [productId, setProductId] = useState(null);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [gst, setGst] = useState(0);
  const [unit, setUnit] = useState("PCS");
  const [barcode, setBarcode] = useState("");
  const [sku, setSku] = useState("");
  const [isCombo, setIsCombo] = useState(false);

  // Advanced: Variants array
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

  // Advanced: Combo items array
  const [comboItems, setComboItems] = useState([]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, branchesRes] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/categories"),
        currentUser.role === "SUPER_ADMIN" ? apiRequest("/branches") : Promise.resolve({ success: true, data: [] }),
      ]);

      if (productsRes.success) setProducts(productsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (branchesRes.success) setBranches(branchesRes.data);
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
    setProductId(null);
    setProductName("");
    setDescription("");
    setCategoryId("");
    setBranchId(currentUser.role === "SUPER_ADMIN" ? "" : currentUser.branchId || "");
    setCostPrice(0);
    setSellingPrice(0);
    setGst(0);
    setUnit("PCS");
    setBarcode("");
    setSku("");
    setIsCombo(false);
    setHasVariants(false);
    setVariants([]);
    setComboItems([]);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setProductId(prod._id);
    setProductName(prod.productName);
    setDescription(prod.description || "");
    setCategoryId(prod.categoryId?._id || prod.categoryId || "");
    setBranchId(prod.branchId?._id || prod.branchId || "");
    setCostPrice(prod.costPrice || 0);
    setSellingPrice(prod.sellingPrice || 0);
    setGst(prod.gst || 0);
    setUnit(prod.unit || "PCS");
    setBarcode(prod.barcode || "");
    setSku(prod.sku || "");
    setIsCombo(prod.isCombo || false);
    setHasVariants(prod.variants && prod.variants.length > 0);
    setVariants(prod.variants || []);
    setComboItems(prod.comboItems || []);
    setError(null);
    setShowModal(true);
  };

  // Variants management
  const addVariantRow = () => {
    setVariants([...variants, { name: "", price: 0, costPrice: 0, barcode: "", sku: "" }]);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Combo items management
  const addComboRow = () => {
    setComboItems([...comboItems, { productId: "", variantId: null, quantity: 1 }]);
  };

  const removeComboRow = (index) => {
    setComboItems(comboItems.filter((_, i) => i !== index));
  };

  const updateComboRow = (index, field, value) => {
    const updated = [...comboItems];
    updated[index][field] = value;
    setComboItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      productName,
      description,
      categoryId,
      branchId,
      costPrice,
      sellingPrice,
      gst,
      unit,
      barcode: barcode || null,
      sku: sku || null,
      isCombo,
      variants: hasVariants ? variants : [],
      comboItems: isCombo ? comboItems : [],
    };

    try {
      let res;
      if (productId) {
        res = await apiRequest(`/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/products", {
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
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await apiRequest(`/products/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading product catalog...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Coffee style={{ color: "var(--accent)" }} />
          Product Catalog & Menu
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus style={{ width: "16px", height: "16px" }} />
          Add Product
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Branch</th>
                <th>Type</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }} className="empty-state">
                    No products configured.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="badge badge-info">{p.productCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{p.productName}</div>
                      {p.variants && p.variants.length > 0 && (
                        <div style={{ fontSize: "11px", color: "var(--accent)", marginTop: "4px" }}>
                          Variants: {p.variants.map((v) => `${v.name} (${formatCurrency(v.price)})`).join(", ")}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.categoryId
                        ? p.categoryId.categoryCode
                          ? `${p.categoryId.categoryCode} - ${p.categoryId.categoryName}`
                          : p.categoryId.categoryName
                        : "Unassigned"}
                    </td>
                    <td>{p.branchId?.branchName || "All Branches"}</td>
                    <td>
                      {p.isCombo ? (
                        <span className="badge badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Layers style={{ width: "10px", height: "10px" }} /> Combo
                        </span>
                      ) : p.variants && p.variants.length > 0 ? (
                        <span className="badge badge-info">Variants</span>
                      ) : (
                        <span className="badge badge-success">Single</span>
                      )}
                    </td>
                    <td>{formatCurrency(p.costPrice)}</td>
                    <td>{formatCurrency(p.sellingPrice)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(p)}>
                          <Edit style={{ width: "14px", height: "14px" }} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleDelete(p._id)}>
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
          <div className="modal-content glass-card" style={{ width: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3>{productId ? "Edit Product Details" : "Add New Menu Item"}</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Product/Item Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Pepperoni Pizza"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measure</label>
                    <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)}>
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="GRAM">GRAM</option>
                      <option value="LITRE">LITRE</option>
                      <option value="ML">ML</option>
                      <option value="BOX">BOX</option>
                      <option value="PACK">PACK</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.categoryCode ? `${c.categoryCode} - ${c.categoryName}` : c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentUser.role === "SUPER_ADMIN" ? (
                    <div className="form-group">
                      <label className="form-label">Branch Scoping</label>
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

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Short description of taste or contents"
                    rows="2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Pricing / GST */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Cost Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999"
                      className="form-control"
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                      required={!hasVariants}
                      disabled={hasVariants}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999"
                      className="form-control"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                      required={!hasVariants}
                      disabled={hasVariants}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Tax (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={gst}
                      onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* SKU / Barcode */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">SKU Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. SKU-PIZZA-PEP"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      disabled={hasVariants}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Barcode Value</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 123456789012"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      disabled={hasVariants}
                    />
                  </div>
                </div>

                {/* Switches */}
                <div style={{ display: "flex", gap: "24px", margin: "10px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        if (e.target.checked) setIsCombo(false);
                      }}
                      disabled={isCombo}
                    />
                    Enable Sizes / Variants (e.g. Small, Medium)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isCombo}
                      onChange={(e) => {
                        setIsCombo(e.target.checked);
                        if (e.target.checked) setHasVariants(false);
                      }}
                      disabled={hasVariants}
                    />
                    This is a Combo Meal (bundle of products)
                  </label>
                </div>

                {/* Variants Editor Section */}
                {hasVariants && (
                  <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h4 style={{ margin: 0 }}>Sizes & Pricing Grid</h4>
                      <button type="button" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={addVariantRow}>
                        + Add Size Row
                      </button>
                    </div>
                    {variants.length === 0 ? (
                      <p style={{ fontSize: "13px", fontStyle: "italic", textAlign: "center", margin: "16px 0" }}>No variants configured. Click Add to define small/medium/large options.</p>
                    ) : (
                      variants.map((v, index) => (
                        <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Name (e.g. Large)"
                            value={v.name}
                            onChange={(e) => updateVariantRow(index, "name", e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999999"
                            className="form-control"
                            placeholder="Cost"
                            value={v.costPrice}
                            onChange={(e) => updateVariantRow(index, "costPrice", parseFloat(e.target.value) || 0)}
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999999"
                            className="form-control"
                            placeholder="Sell"
                            value={v.price}
                            onChange={(e) => updateVariantRow(index, "price", parseFloat(e.target.value) || 0)}
                            required
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Barcode"
                            value={v.barcode}
                            onChange={(e) => updateVariantRow(index, "barcode", e.target.value)}
                          />
                          <button type="button" className="btn btn-danger" style={{ padding: "6px" }} onClick={() => removeVariantRow(index)}>
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Combo Items Editor Section */}
                {isCombo && (
                  <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h4 style={{ margin: 0 }}>Combo Meal Components</h4>
                      <button type="button" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={addComboRow}>
                        + Add Component
                      </button>
                    </div>
                    {comboItems.length === 0 ? (
                      <p style={{ fontSize: "13px", fontStyle: "italic", textAlign: "center", margin: "16px 0" }}>No components listed. Link underlying dishes.</p>
                    ) : (
                      comboItems.map((item, index) => (
                        <div key={index} style={{ display: "grid", gridTemplateColumns: "3fr 2fr 1fr", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                          <select
                            className="form-control"
                            value={item.productId}
                            onChange={(e) => {
                              const prod = products.find(p => p._id === e.target.value);
                              updateComboRow(index, "productId", e.target.value);
                              updateComboRow(index, "variantId", prod?.variants?.[0]?._id || null);
                            }}
                            required
                          >
                            <option value="">-- Choose Product --</option>
                            {products.filter(p => p._id !== productId && !p.isCombo).map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.productName}
                              </option>
                            ))}
                          </select>
                          {/* Optional Variant selection if product has variants */}
                          <select
                            className="form-control"
                            value={item.variantId || ""}
                            onChange={(e) => updateComboRow(index, "variantId", e.target.value || null)}
                            disabled={!products.find(p => p._id === item.productId)?.variants?.length}
                          >
                            <option value="">Regular</option>
                            {products.find(p => p._id === item.productId)?.variants?.map(v => (
                              <option key={v._id} value={v._id}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="number"
                              className="form-control"
                              value={item.quantity}
                              onChange={(e) => updateComboRow(index, "quantity", parseInt(e.target.value) || 1)}
                              min="1"
                              required
                            />
                            <button type="button" className="btn btn-danger" style={{ padding: "6px" }} onClick={() => removeComboRow(index)}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {productId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
