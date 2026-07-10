import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Package, Plus, MoveHorizontal, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function InventoryPage() {
  const { apiRequest, user: currentUser, hasRole } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("stock"); // stock | transfers

  // Modal Controls
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form State: Stock Adjustment (Damage/Wastage)
  const [adjItemType, setAdjItemType] = useState("PRODUCT");
  const [adjItemId, setAdjItemId] = useState("");
  const [adjVariantId, setAdjVariantId] = useState("");
  const [adjType, setAdjType] = useState("DAMAGE");
  const [adjQuantity, setAdjQuantity] = useState(1);
  const [adjReason, setAdjReason] = useState("");

  // Form State: Stock Transfer Request
  const [tfFromBranch, setTfFromBranch] = useState("");
  const [tfToBranch, setTfToBranch] = useState("");
  const [tfItemType, setTfItemType] = useState("PRODUCT");
  const [tfItemId, setTfItemId] = useState("");
  const [tfVariantId, setTfVariantId] = useState("");
  const [tfQuantity, setTfQuantity] = useState(1);

  const fetchData = async () => {
    try {
      const [invRes, tfRes, branchesRes, productsRes, ingredientsRes] = await Promise.all([
        apiRequest("/inventory"),
        apiRequest("/stock-transfers"),
        currentUser.role === "SUPER_ADMIN" ? apiRequest("/branches") : Promise.resolve({ success: true, data: [] }),
        apiRequest("/products"),
        apiRequest("/ingredients"),
      ]);

      if (invRes.success) setInventory(invRes.data);
      if (tfRes.success) setTransfers(tfRes.data);
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

  const openAdjustModal = () => {
    setAdjItemType("PRODUCT");
    setAdjItemId("");
    setAdjVariantId("");
    setAdjType("DAMAGE");
    setAdjQuantity(1);
    setAdjReason("");
    setError(null);
    setShowAdjustModal(true);
  };

  const openTransferModal = () => {
    setTfFromBranch(currentUser.role === "SUPER_ADMIN" ? "" : currentUser.branchId || "");
    setTfToBranch("");
    setTfItemType("PRODUCT");
    setTfItemId("");
    setTfVariantId("");
    setTfQuantity(1);
    setError(null);
    setShowTransferModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      itemType: adjItemType,
      itemId: adjItemId,
      variantId: adjVariantId || null,
      type: adjType,
      quantity: adjQuantity,
      reason: adjReason,
    };

    try {
      const res = await apiRequest("/stock-adjustments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setShowAdjustModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      fromBranchId: tfFromBranch,
      toBranchId: tfToBranch,
      items: [
        {
          itemType: tfItemType,
          itemId: tfItemId,
          variantId: tfVariantId || null,
          quantity: tfQuantity,
        },
      ],
    };

    try {
      const res = await apiRequest("/stock-transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setShowTransferModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveTransfer = async (id) => {
    if (!window.confirm("Approve this transfer request? Stock will be automatically moved.")) return;
    try {
      const res = await apiRequest(`/stock-transfers/${id}/approve`, { method: "POST" });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleRejectTransfer = async (id) => {
    if (!window.confirm("Reject this transfer request?")) return;
    try {
      const res = await apiRequest(`/stock-transfers/${id}/reject`, { method: "POST" });
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  if (loading) return <div className="loading-spinner">Loading inventory modules...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Package style={{ color: "var(--accent)" }} />
          Inventory Management
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={openAdjustModal}>
            <AlertTriangle style={{ width: "16px", height: "16px" }} />
            Wastage Adjustment
          </button>
          <button className="btn btn-primary" onClick={openTransferModal}>
            <MoveHorizontal style={{ width: "16px", height: "16px" }} />
            Request Transfer
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          className={`btn ${activeTab === "stock" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("stock")}
        >
          Stock Balance
        </button>
        <button
          className={`btn ${activeTab === "transfers" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("transfers")}
        >
          Inter-Branch Transfers
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeTab === "stock" ? (
        <div className="glass-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Assigned Branch</th>
                  <th>Reorder Limit</th>
                  <th>Current Stock</th>
                  <th>Available Stock</th>
                  <th>Reserved Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }} className="empty-state">
                      No stock records initialized. Add products or restock.
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => {
                    const isLow = inv.currentStock <= inv.reorderLevel;
                    // Find variant name if it has variantId
                    const variantName = inv.variantId && inv.productId?.variants?.find(v => v._id === inv.variantId)?.name;
                    return (
                      <tr key={inv._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-h)" }}>
                            {inv.productId?.productName} {variantName ? `(${variantName})` : ""}
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--secondary)" }}>
                            {inv.productId?.productCode}
                          </span>
                        </td>
                        <td>{inv.branchId?.branchName}</td>
                        <td>{inv.reorderLevel}</td>
                        <td>{inv.currentStock}</td>
                        <td>{inv.availableStock}</td>
                        <td>{inv.reservedStock}</td>
                        <td>
                          {isLow ? (
                            <span className="badge badge-danger">Reorder Alert</span>
                          ) : (
                            <span className="badge badge-success">Sufficient</span>
                          )}
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
        /* tab: Inter-Branch transfers dashboard */
        <div className="glass-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Source Branch</th>
                  <th>Dest Branch</th>
                  <th>Details / Items</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }} className="empty-state">
                      No transfer requests registered.
                    </td>
                  </tr>
                ) : (
                  transfers.map((tf) => {
                    // Check if current user is admin of source or destination branch
                    const isActorSourceBranchAdmin = currentUser.role !== "SUPER_ADMIN" && tf.fromBranchId?._id?.toString() === currentUser.branchId?.toString();
                    const isActorDestBranchAdmin = currentUser.role !== "SUPER_ADMIN" && tf.toBranchId?._id?.toString() === currentUser.branchId?.toString();
                    const canApprove = currentUser.role === "SUPER_ADMIN" || isActorSourceBranchAdmin || isActorDestBranchAdmin;

                    return (
                      <tr key={tf._id}>
                        <td>{tf.fromBranchId?.branchName}</td>
                        <td>{tf.toBranchId?.branchName}</td>
                        <td>
                          {tf.items?.map((item, idx) => (
                            <div key={idx} style={{ fontSize: "13px", fontWeight: 600 }}>
                              {item.itemType} ID: {item.itemId} - Qty: {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td>{tf.requestedBy?.firstName} {tf.requestedBy?.lastName}</td>
                        <td>
                          <span className={`badge ${tf.status === "COMPLETED" ? "badge-success" : tf.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                            {tf.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {tf.status === "REQUESTED" && canApprove ? (
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                              <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleApproveTransfer(tf._id)}>
                                Approve
                              </button>
                              <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }} onClick={() => handleRejectTransfer(tf._id)}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment modal */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Log Damage / Wastage Stock Adjustment</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowAdjustModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Item Type</label>
                  <select className="form-control" value={adjItemType} onChange={(e) => { setAdjItemType(e.target.value); setAdjItemId(""); setAdjVariantId(""); }}>
                    <option value="PRODUCT">Regular Product</option>
                    <option value="INGREDIENT">Kitchen Raw Ingredient</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Item</label>
                  <select className="form-control" value={adjItemId} onChange={(e) => setAdjItemId(e.target.value)} required>
                    <option value="">-- Choose Item --</option>
                    {adjItemType === "PRODUCT"
                      ? products.map(p => <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>)
                      : ingredients.map(i => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)
                    }
                  </select>
                </div>

                {adjItemType === "PRODUCT" && products.find(p => p._id === adjItemId)?.variants?.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Variant / Size</label>
                    <select className="form-control" value={adjVariantId} onChange={(e) => setAdjVariantId(e.target.value)} required>
                      <option value="">-- Choose Variant --</option>
                      {products.find(p => p._id === adjItemId)?.variants.map(v => (
                        <option key={v._id} value={v._id}>{v.name} (${v.price})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Adjustment Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={adjQuantity}
                      onChange={(e) => setAdjQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason Code</label>
                    <select className="form-control" value={adjType} onChange={(e) => setAdjType(e.target.value)}>
                      <option value="DAMAGE">Damaged / Broken</option>
                      <option value="WASTAGE">Wastage / Spoiled</option>
                      <option value="EXPIRY">Expired</option>
                      <option value="OTHER">Other Reason</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Notes / Reason</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter detailed reason here"
                    rows="2"
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log Write-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Request modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Request Inter-Branch Stock Transfer</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowTransferModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                {currentUser.role === "SUPER_ADMIN" ? (
                  <div className="form-group">
                    <label className="form-label">Source Branch (From)</label>
                    <select className="form-control" value={tfFromBranch} onChange={(e) => setTfFromBranch(e.target.value)} required>
                      <option value="">-- Select Source Branch --</option>
                      {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
                    </select>
                  </div>
                ) : null}

                <div className="form-group">
                  <label className="form-label">Destination Branch (To)</label>
                  <select className="form-control" value={tfToBranch} onChange={(e) => setTfToBranch(e.target.value)} required>
                    <option value="">-- Select Destination Branch --</option>
                    {branches.filter(b => b._id !== tfFromBranch).map(b => (
                      <option key={b._id} value={b._id}>{b.branchName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Item Type</label>
                  <select className="form-control" value={tfItemType} onChange={(e) => { setTfItemType(e.target.value); setTfItemId(""); setTfVariantId(""); }}>
                    <option value="PRODUCT">Regular Product</option>
                    <option value="INGREDIENT">Kitchen Raw Ingredient</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Item</label>
                  <select className="form-control" value={tfItemId} onChange={(e) => setTfItemId(e.target.value)} required>
                    <option value="">-- Choose Item --</option>
                    {tfItemType === "PRODUCT"
                      ? products.filter(p => !tfFromBranch || p.branchId?._id === tfFromBranch || p.branchId === tfFromBranch).map(p => <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>)
                      : ingredients.filter(i => !tfFromBranch || i.branchId?._id === tfFromBranch || i.branchId === tfFromBranch).map(i => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)
                    }
                  </select>
                </div>

                {tfItemType === "PRODUCT" && products.find(p => p._id === tfItemId)?.variants?.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Variant / Size</label>
                    <select className="form-control" value={tfVariantId} onChange={(e) => setTfVariantId(e.target.value)} required>
                      <option value="">-- Choose Variant --</option>
                      {products.find(p => p._id === tfItemId)?.variants.map(v => (
                        <option key={v._id} value={v._id}>{v.name} (${v.price})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={tfQuantity}
                    onChange={(e) => setTfQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
