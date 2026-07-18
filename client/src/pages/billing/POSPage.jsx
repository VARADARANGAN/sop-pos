import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Search, ShoppingCart, UserPlus, Save, ClipboardList, CreditCard, Receipt, Plus, Minus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import "./POSPage.css";

export default function POSPage() {
  const { apiRequest, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // POS State
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);

  // Variant Modal State
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  // Hold Modal State
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReference, setHoldReference] = useState("");

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [payments, setPayments] = useState([{ method: "CASH", amount: 0 }]);
  const [quickCustName, setQuickCustName] = useState("");
  const [quickCustPhone, setQuickCustPhone] = useState("");
  const [showQuickCust, setShowQuickCust] = useState(false);

  // Split Bill State
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitBillsData, setSplitBillsData] = useState([]);

  // Receipt State
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [error, setError] = useState(null);

  const fetchInitialData = async () => {
    try {
      const [prodRes, catRes, custRes, heldRes] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/categories"),
        apiRequest("/customers"),
        apiRequest("/billing/order/held"),
      ]);

      if (prodRes.success) {
        setProducts(prodRes.data);
        setFilteredProducts(prodRes.data);
      }
      if (catRes.success) setCategories(catRes.data);
      if (custRes.success) setCustomers(custRes.data);
      if (heldRes.success) setHeldOrders(heldRes.data);
    } catch (err) {
      console.error("Failed to load POS data", err.message);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter products by category and query
  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.categoryId?._id === selectedCategory || p.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.productName.toLowerCase().includes(query) || p.productCode.toLowerCase().includes(query));
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // Calculations
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateDiscount = () => {
    const sub = calculateSubtotal();
    return sub * (orderDiscountPercent / 100);
  };

  const calculateTax = () => {
    // Calculate per-item tax based on product.gst
    let totalTax = 0;
    cart.forEach(item => {
      const itemSub = item.price * item.quantity;
      const itemGstRate = item.gst || 0;
      totalTax += (itemSub * itemGstRate) / 100;
    });

    // Pro-rata reduction if order discount exists
    const sub = calculateSubtotal();
    if (sub > 0) {
      const disc = calculateDiscount();
      const discountRatio = disc / sub;
      totalTax = totalTax * (1 - discountRatio);
    }
    
    return totalTax;
  };

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    const disc = calculateDiscount();
    const tax = calculateTax();
    return sub - disc + tax;
  };

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      setActiveProduct(product);
      setShowVariantModal(true);
    } else {
      addToCartState(product, null, product.sellingPrice, product.costPrice, product.productName, "", product.gst);
    }
  };

  const handleVariantSelect = (variant) => {
    addToCartState(
      activeProduct,
      variant._id,
      variant.price,
      variant.costPrice,
      activeProduct.productName,
      variant.name,
      activeProduct.gst
    );
    setShowVariantModal(false);
  };

  const addToCartState = (product, variantId, price, costPrice, name, variantName, gst = 0) => {
    const existingIndex = cart.findIndex(
      item => item.productId === product._id && item.variantId === variantId
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          variantId,
          name,
          variantName,
          price,
          costPrice,
          gst,
          quantity: 1,
        },
      ]);
    }
  };

  const updateCartQuantity = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleDiscountChange = (val) => {
    const numeric = parseFloat(val) || 0;
    // Cashier discount limit: 10% max
    if (user.role === "CASHIER" && numeric > 10) {
      alert("Cashier discounts are capped at maximum 10%. Please seek Admin authorization for larger overrides.");
      setOrderDiscountPercent(10);
    } else {
      setOrderDiscountPercent(numeric);
    }
  };

  // Hold Order
  const handleHoldOrderSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (cart.length === 0) return alert("Cart is empty");

    const orderPayload = {
      items: cart.map(item => ({
        ...item,
        subtotal: item.price * item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      discount: calculateDiscount(),
      grandTotal: calculateGrandTotal(),
      holdReference,
    };

    try {
      const res = await apiRequest("/billing/order/hold", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });
      if (res.success) {
        setCart([]);
        setHoldReference("");
        setShowHoldModal(false);
        fetchInitialData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResumeOrder = (heldOrder) => {
    // Restore cart
    const restored = heldOrder.items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variantName: item.variantName,
      quantity: item.quantity,
      price: item.price,
      costPrice: item.costPrice,
    }));
    setCart(restored);
    // Restore customer and discounts if they exist
    setSelectedCustomerId(heldOrder.customerId?._id || heldOrder.customerId || "");
    const sub = heldOrder.subtotal || 1;
    const disc = heldOrder.discount || 0;
    setOrderDiscountPercent((disc / sub) * 100);
  };

  // Open Checkout Modal
  const openCheckout = () => {
    if (cart.length === 0) return alert("Cart is empty");
    const total = calculateGrandTotal();
    setPayments([{ method: "CASH", amount: parseFloat(total.toFixed(2)) }]);
    setError(null);
    setIsSplitEnabled(false);
    setShowCheckoutModal(true);
  };

  const addPaymentRow = () => {
    setPayments([...payments, { method: "CARD", amount: 0 }]);
  };

  const removePaymentRow = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const updatePaymentRow = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;
    setPayments(updated);
  };

  // Create customer quickly
  const handleQuickCustomer = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify({ name: quickCustName, phone: quickCustPhone }),
      });
      if (res.success) {
        setCustomers([...customers, res.data]);
        setSelectedCustomerId(res.data._id);
        setShowQuickCust(false);
        setQuickCustName("");
        setQuickCustPhone("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const sub = calculateSubtotal();
    const disc = calculateDiscount();
    const tax = calculateTax();
    const grand = calculateGrandTotal();

    const itemsPayload = cart.map(item => ({
      ...item,
      subtotal: item.price * item.quantity,
      tax: (item.price * item.quantity) * 0.05,
      discount: 0,
      total: (item.price * item.quantity) * 1.05,
    }));

    if (isSplitEnabled) {
      // Split bill execution
      const dividedGrandTotal = grand / splitCount;
      const dividedSubtotal = sub / splitCount;
      const dividedTax = tax / splitCount;
      const dividedDiscount = disc / splitCount;

      const splitBills = Array.from({ length: splitCount }).map((_, idx) => ({
        items: itemsPayload.map(item => ({
          ...item,
          quantity: item.quantity / splitCount,
          subtotal: item.subtotal / splitCount,
          tax: item.tax / splitCount,
          total: item.total / splitCount,
        })),
        subtotal: dividedSubtotal,
        tax: dividedTax,
        discount: dividedDiscount,
        grandTotal: dividedGrandTotal,
        customerId: selectedCustomerId || null,
        payments: [{ method: "CASH", amount: parseFloat(dividedGrandTotal.toFixed(2)) }],
      }));

      // Let's hold order and split it using transaction endpoint
      try {
        // Create held order first
        const holdRes = await apiRequest("/billing/order/hold", {
          method: "POST",
          body: JSON.stringify({
            items: itemsPayload,
            subtotal: sub,
            tax: tax,
            discount: disc,
            grandTotal: grand,
            holdReference: `SPLIT-${Date.now()}`,
          }),
        });

        if (holdRes.success) {
          const splitRes = await apiRequest(`/billing/order/${holdRes.data._id}/split`, {
            method: "POST",
            body: JSON.stringify({ bills: splitBills }),
          });

          if (splitRes.success) {
            setCompletedOrder(splitRes.data[0]); // receipt of first split
            setCart([]);
            setShowCheckoutModal(false);
            setShowReceiptModal(true);
            fetchInitialData();
          }
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Single bill checkout
      const payload = {
        items: itemsPayload,
        subtotal: sub,
        tax,
        discount: disc,
        grandTotal: grand,
        customerId: selectedCustomerId || null,
        payments,
      };

      try {
        const res = await apiRequest("/billing/order", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.success) {
          setCompletedOrder(res.data);
          setCart([]);
          setShowCheckoutModal(false);
          setShowReceiptModal(true);
          fetchInitialData();
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="pos-terminal">
      {/* Left side: categories and product catalog grid */}
      <div className="pos-catalog">
        <div className="catalog-header">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search dishes, drinks, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="categories-tab">
          <button
            className={`category-pill ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All Items
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              className={`category-pill ${selectedCategory === c._id ? "active" : ""}`}
              onClick={() => setSelectedCategory(c._id)}
            >
              {c.categoryName}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="products-grid">
          {filteredProducts.map(p => (
            <div key={p._id} className="product-card glass-card" onClick={() => handleAddToCart(p)}>
              <div className="product-card-body">
                <h4 className="prod-name">{p.productName}</h4>
                <span className="prod-code">{p.productCode}</span>
                <span className="prod-price">{formatCurrency(p.sellingPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: shopping cart panel */}
      <div className="pos-sidebar glass-card">
        <div className="sidebar-header-row">
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart style={{ color: "var(--accent)" }} />
            Cart Overview
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowHoldModal(true)} title="Park Bill">
              <Save style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </div>

        {/* Cart Item rows */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingCart style={{ width: "48px", height: "48px", strokeWidth: 1 }} />
              <p>Your sales cart is empty</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item-row">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  {item.variantName && <span className="item-size">({item.variantName})</span>}
                  <span className="item-unit-price">{formatCurrency(item.price)}</span>
                </div>
                <div className="item-qty-controls">
                  <button onClick={() => updateCartQuantity(index, -1)}>
                    <Minus style={{ width: "12px", height: "12px" }} />
                  </button>
                  <span className="item-qty">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(index, 1)}>
                    <Plus style={{ width: "12px", height: "12px" }} />
                  </button>
                </div>
                <span className="item-row-total">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))
          )}
        </div>

        {/* Parked Orders Tray */}
        {heldOrders.length > 0 && (
          <div className="held-orders-tray">
            <h4 style={{ margin: "0 0 8px", fontSize: "12px", textTransform: "uppercase", color: "var(--secondary)" }}>Parked Bills</h4>
            <div className="held-list">
              {heldOrders.map((ho) => (
                <button key={ho._id} className="held-order-pill" onClick={() => handleResumeOrder(ho)}>
                  <ClipboardList style={{ width: "12px", height: "12px" }} />
                  Ref: {ho.holdReference} ({formatCurrency(ho.grandTotal)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Billing summary */}
        <div className="billing-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="summary-row">
            <span>Discount (%)</span>
            <input
              type="number"
              style={{ width: "60px", padding: "2px 6px", border: "1px solid var(--border)", borderRadius: "4px" }}
              value={orderDiscountPercent}
              onChange={(e) => handleDiscountChange(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="summary-row">
            <span>GST Tax (5%)</span>
            <span>{formatCurrency(calculateTax())}</span>
          </div>
          <div className="summary-row grand-total-row">
            <span>Grand Total</span>
            <span>{formatCurrency(calculateGrandTotal())}</span>
          </div>

          <button className="btn btn-primary checkout-btn" onClick={openCheckout} disabled={cart.length === 0}>
            <CreditCard style={{ width: "18px", height: "18px" }} />
            Pay Now
          </button>
        </div>
      </div>

      {/* Select Variant Modal */}
      {showVariantModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Choose Size / Variant</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowVariantModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeProduct?.variants?.map((v) => (
                <button
                  key={v._id}
                  className="btn btn-secondary"
                  style={{ justifyContent: "space-between", padding: "14px", fontWeight: 600 }}
                  onClick={() => handleVariantSelect(v)}
                >
                  <span>{v.name}</span>
                  <span>{formatCurrency(v.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Park Order Modal */}
      {showHoldModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Park Bill / Hold Order</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowHoldModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleHoldOrderSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Hold Reference Code / Table Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Table 12, Call-order"
                    value={holdReference}
                    onChange={(e) => setHoldReference(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowHoldModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Park Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Pay Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ width: "550px" }}>
            <div className="modal-header">
              <h3>Select Payments & Checkout</h3>
              <button className="btn btn-secondary" style={{ padding: "4px" }} onClick={() => setShowCheckoutModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Customer dropdown */}
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label className="form-label" style={{ margin: 0 }}>Customer Profile</label>
                    <button
                      type="button"
                      className="auth-link"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => setShowQuickCust(!showQuickCust)}
                    >
                      <UserPlus style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
                      Quick Create Customer
                    </button>
                  </div>

                  {!showQuickCust ? (
                    <select
                      className="form-control"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">-- Anonymous / Walk-In --</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ border: "1px dashed var(--border)", padding: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.01)" }}>
                      <div className="form-group" style={{ marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Customer Name"
                          value={quickCustName}
                          onChange={(e) => setQuickCustName(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "8px" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Phone Number"
                          value={quickCustPhone}
                          onChange={(e) => setQuickCustPhone(e.target.value)}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button type="button" className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => setShowQuickCust(false)}>Cancel</button>
                        <button type="button" className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={handleQuickCustomer}>Save Profile</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Split Bill Switches */}
                <div style={{ display: "flex", gap: "24px", margin: "10px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isSplitEnabled}
                      onChange={(e) => setIsSplitEnabled(e.target.checked)}
                    />
                    Split Bill by seat/amount
                  </label>
                  {isSplitEnabled && (
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: "70px" }}
                      value={splitCount}
                      onChange={(e) => setSplitCount(Math.max(2, parseInt(e.target.value) || 2))}
                      min="2"
                    />
                  )}
                </div>

                {/* Payment Methods selector */}
                {!isSplitEnabled ? (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h4 style={{ margin: 0 }}>Split Payment Methods</h4>
                      <button type="button" className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={addPaymentRow}>
                        + Add Payment
                      </button>
                    </div>

                    {payments.map((p, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                        <select
                          className="form-control"
                          value={p.method}
                          onChange={(e) => updatePaymentRow(idx, "method", e.target.value)}
                        >
                          <option value="CASH">CASH</option>
                          <option value="CARD">CREDIT/DEBIT CARD</option>
                          <option value="UPI">UPI / WALLET</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          placeholder="Amount"
                          value={p.amount}
                          onChange={(e) => updatePaymentRow(idx, "amount", parseFloat(e.target.value) || 0)}
                          required
                        />
                        <button type="button" className="btn btn-danger" style={{ padding: "6px" }} disabled={payments.length === 1} onClick={() => removePaymentRow(idx)}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontWeight: 700, fontSize: "14px" }}>
                      <span>Grand Total: {formatCurrency(calculateGrandTotal())}</span>
                      <span>Total Input: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "10px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning)" }}>
                      Bill will be split into {splitCount} equal portions of {formatCurrency(calculateGrandTotal() / splitCount)} each. Cashiers can record payment methods on each separately.
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && completedOrder && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ width: "350px", padding: "16px" }}>
            <div className="receipt-view" style={{ fontFamily: "monospace", fontSize: "12px", color: "#000", background: "#fff", padding: "20px", borderRadius: "4px" }}>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#000" }}>SOP KITCHEN & BAR</h3>
                <p style={{ margin: 0 }}>Times Square Outlet</p>
                <p style={{ margin: 0 }}>Tel: 555-0199</p>
              </div>

              <div style={{ borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
                <div>Order: {completedOrder.orderNumber}</div>
                <div>Date: {new Date(completedOrder.createdAt).toLocaleDateString()}</div>
                <div>Cashier ID: {completedOrder.cashierId}</div>
                {completedOrder.customerId && <div>Customer ID: Attached</div>}
              </div>

              <div style={{ borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
                {completedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div>
                      {item.name} {item.variantName ? `(${item.variantName})` : ""}
                      <br />
                      x{item.quantity} @ {formatCurrency(item.price)}
                    </div>
                    <div>{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Discount</span>
                    <span>-{formatCurrency(completedOrder.discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tax (5% GST)</span>
                  <span>{formatCurrency(completedOrder.tax)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "14px" }}>
                  <span>GRAND TOTAL</span>
                  <span>{formatCurrency(completedOrder.grandTotal)}</span>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "12px", color: "#000" }}>PAYMENTS RECORDED</h4>
                {completedOrder.payments?.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{p.method}</span>
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", fontSize: "11px", marginTop: "24px" }}>
                Thank you for your visit!
                <br />
                Please come again.
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>Print Receipt</button>
              <button className="btn btn-primary" onClick={() => { setShowReceiptModal(false); setCompletedOrder(null); }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
