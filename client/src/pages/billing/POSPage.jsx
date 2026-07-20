import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Search, ShoppingCart, UserPlus, Save, ClipboardList, CreditCard, Receipt, Plus, Minus, Trash2, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  }, [apiRequest]);

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
    if (price <= 0) {
      alert("Product price must be greater than ₹0.");
      return;
    }

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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-theme(spacing.16))] -m-4 md:-m-6 lg:-m-8 bg-background">
      
      {/* Left side: categories and product catalog grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-background border-r border-border/40">
        <div className="p-4 border-b border-border/40 shrink-0 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search dishes, drinks, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-muted-foreground/20"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 p-4 overflow-x-auto no-scrollbar shrink-0 border-b border-border/40 bg-card/50">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "all" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Items
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === c._id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c.categoryName}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-muted/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(p => (
              <Card 
                key={p._id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border-border/40 bg-card hover:border-primary/30 group"
                onClick={() => handleAddToCart(p)}
              >
                <div className="h-24 bg-muted/40 flex items-center justify-center p-4">
                  {/* Placeholder for image */}
                  <span className="text-4xl opacity-20 font-bold group-hover:opacity-40 transition-opacity">
                    {p.productName.charAt(0)}
                  </span>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 mb-1">{p.productName}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{p.productCode}</span>
                    <span className="font-bold text-sm text-primary">{formatCurrency(p.sellingPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: shopping cart panel */}
      <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col shrink-0 bg-card z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between p-4 border-b border-border/40 shrink-0">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Current Order
          </h3>
          <Button variant="outline" size="sm" onClick={() => setShowHoldModal(true)} title="Park Bill" className="h-8">
            <Save className="h-4 w-4 mr-2" />
            Park
          </Button>
        </div>

        {/* Cart Item rows */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p className="text-sm font-medium">Your sales cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">Variant: {item.variantName}</p>
                      )}
                      <p className="text-xs font-semibold text-muted-foreground mt-1">{formatCurrency(item.price)}</p>
                    </div>
                    <span className="font-bold text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                    <div className="flex items-center bg-muted rounded-md border border-border/50 overflow-hidden">
                      <button 
                        className="px-2.5 py-1 hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => updateCartQuantity(index, -1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium bg-background border-x border-border/50 min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        className="px-2.5 py-1 hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => updateCartQuantity(index, 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => updateCartQuantity(index, -item.quantity)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parked Orders Tray */}
        {heldOrders.length > 0 && (
          <div className="p-4 border-t border-border/40 bg-muted/20 shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Parked Bills</h4>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {heldOrders.map((ho) => (
                <button 
                  key={ho._id} 
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors border border-secondary/20"
                  onClick={() => handleResumeOrder(ho)}
                >
                  <ClipboardList className="h-3 w-3" />
                  Ref: {ho.holdReference} <span className="opacity-60">({formatCurrency(ho.grandTotal)})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Billing summary */}
        <div className="p-4 border-t border-border/40 bg-card shrink-0">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Discount (%)</span>
              <Input
                type="number"
                className="w-16 h-7 text-right text-xs py-0 px-2"
                value={orderDiscountPercent}
                onChange={(e) => handleDiscountChange(e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Tax (5% GST)</span>
              <span className="font-medium text-foreground">{formatCurrency(calculateTax())}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="font-semibold text-foreground">Grand Total</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(calculateGrandTotal())}</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold gap-2 shadow-md shadow-primary/20" 
            onClick={openCheckout} 
            disabled={cart.length === 0}
          >
            <CreditCard className="h-5 w-5" />
            Pay Now
          </Button>
        </div>
      </div>

      {/* Select Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-lg border-border/60">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
              <CardTitle className="text-lg">Choose Size / Variant</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowVariantModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {activeProduct?.variants?.map((v) => (
                  <Button
                    key={v._id}
                    variant="outline"
                    className="w-full justify-between h-14 px-4 text-base font-semibold hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => handleVariantSelect(v)}
                  >
                    <span>{v.name}</span>
                    <span className="text-primary">{formatCurrency(v.price)}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Park Order Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-lg border-border/60">
            <form onSubmit={handleHoldOrderSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">Park Bill / Hold Order</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHoldModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {error && <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="holdRef">Hold Reference / Table</Label>
                  <Input
                    id="holdRef"
                    type="text"
                    placeholder="e.g. Table 12, Call-order"
                    value={holdReference}
                    onChange={(e) => setHoldReference(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6">
                <Button type="button" variant="secondary" onClick={() => setShowHoldModal(false)}>Cancel</Button>
                <Button type="submit">Park Order</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Checkout Pay Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-xl shadow-lg border-border/60 max-h-[90vh] overflow-hidden flex flex-col">
            <form onSubmit={handleCheckoutSubmit} className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Checkout & Payment
                </CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCheckoutModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}

                  {/* Customer Selection */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Customer Profile</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setShowQuickCust(!showQuickCust)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Quick Create
                      </Button>
                    </div>

                    {!showQuickCust ? (
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <div className="p-4 bg-muted/30 border border-border/50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Customer Name</Label>
                            <Input
                              type="text"
                              placeholder="Name"
                              value={quickCustName}
                              onChange={(e) => setQuickCustName(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Phone Number</Label>
                            <Input
                              type="text"
                              placeholder="Phone"
                              value={quickCustPhone}
                              onChange={(e) => setQuickCustPhone(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowQuickCust(false)}>Cancel</Button>
                          <Button type="button" size="sm" className="h-7 text-xs" onClick={handleQuickCustomer}>Save Profile</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Split Bill Toggle */}
                  <div className="flex items-center gap-6 p-4 bg-muted/20 border border-border/50 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSplitEnabled}
                        onChange={(e) => setIsSplitEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="font-semibold text-sm">Split Bill (Equal Portions)</span>
                    </label>
                    {isSplitEnabled && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Into:</Label>
                        <Input
                          type="number"
                          className="w-20 h-8 text-sm"
                          value={splitCount}
                          onChange={(e) => setSplitCount(Math.max(2, parseInt(e.target.value) || 2))}
                          min="2"
                        />
                        <span className="text-xs text-muted-foreground">parts</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Methods */}
                  {!isSplitEnabled ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold">Payment Methods</Label>
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={addPaymentRow}>
                          <Plus className="h-3 w-3 mr-1" /> Add Payment
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {payments.map((p, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              style={{ flex: 2 }}
                              value={p.method}
                              onChange={(e) => updatePaymentRow(idx, "method", e.target.value)}
                            >
                              <option value="CASH">CASH</option>
                              <option value="CARD">CREDIT/DEBIT CARD</option>
                              <option value="UPI">UPI / WALLET</option>
                            </select>
                            <Input
                              type="number"
                              step="0.01"
                              style={{ flex: 2 }}
                              placeholder="Amount"
                              value={p.amount}
                              onChange={(e) => updatePaymentRow(idx, "amount", parseFloat(e.target.value) || 0)}
                              required
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon"
                              className="h-10 w-10 shrink-0" 
                              disabled={payments.length === 1} 
                              onClick={() => removePaymentRow(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg border border-border/50">
                        <span className="font-medium text-sm text-muted-foreground">Total Required: {formatCurrency(calculateGrandTotal())}</span>
                        <span className={`font-bold text-sm ${
                          payments.reduce((sum, p) => sum + p.amount, 0) < calculateGrandTotal() ? 'text-destructive' : 'text-emerald-500'
                        }`}>
                          Input Total: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 items-start">
                      <CreditCard className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                        Bill will be split into <span className="font-bold">{splitCount}</span> equal portions of <span className="font-bold">{formatCurrency(calculateGrandTotal() / splitCount)}</span> each. Cashiers can record specific payment methods on each printed receipt.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-3 border-t border-border/40 pt-4 px-6 pb-6 shrink-0 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowCheckoutModal(false)}>Cancel</Button>
                <Button type="submit" className="min-w-[140px]">Process Checkout</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
          <div className="flex flex-col max-w-sm w-full gap-4">
            <div className="bg-white text-black p-6 rounded-md shadow-2xl font-mono text-xs printable-receipt">
              <div className="text-center mb-6 border-b-2 border-black/20 pb-4">
                <h3 className="m-0 text-lg font-bold tracking-widest">CulinaFlow POS</h3>
                <p className="m-0 mt-1">Times Square Outlet</p>
                <p className="m-0">Tel: 555-0199</p>
              </div>

              <div className="mb-4 border-b border-dashed border-black/30 pb-4 space-y-1">
                <div className="flex justify-between"><span>Order #:</span> <span className="font-bold">{completedOrder.orderNumber}</span></div>
                <div className="flex justify-between"><span>Date:</span> <span>{new Date(completedOrder.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Cashier:</span> <span>{completedOrder.cashierId}</span></div>
                {completedOrder.customerId && <div className="flex justify-between"><span>Customer:</span> <span>Attached</span></div>}
              </div>

              <div className="mb-4 border-b border-dashed border-black/30 pb-4">
                <div className="flex justify-between font-bold border-b border-black/20 pb-1 mb-2">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                {completedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <span className="font-semibold">{item.name}</span>
                      {item.variantName && <span className="block text-[10px] text-black/70">({item.variantName})</span>}
                      <span className="block text-[10px] text-black/70">{item.quantity} x {formatCurrency(item.price)}</span>
                    </div>
                    <div className="font-semibold">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4 border-b-2 border-black/20 pb-4 space-y-1.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-black/80">
                    <span>Discount</span>
                    <span>-{formatCurrency(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black/80">
                  <span>Tax (5% GST)</span>
                  <span>{formatCurrency(completedOrder.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-dashed border-black/30">
                  <span>GRAND TOTAL</span>
                  <span>{formatCurrency(completedOrder.grandTotal)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="m-0 mb-2 font-bold uppercase border-b border-black/10 pb-1">Payments Recorded</h4>
                {completedOrder.payments?.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{p.method}</span>
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 pt-4 border-t border-black/20 opacity-80">
                <p className="m-0 mb-1 font-bold">Thank you for your visit!</p>
                <p className="m-0 text-[10px]">Please come again.</p>
                <p className="m-0 mt-4 text-[9px] opacity-60">Powered by CulinaFlow Enterprise</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Receipt className="h-4 w-4 mr-2" /> Print Receipt
              </Button>
              <Button onClick={() => { setShowReceiptModal(false); setCompletedOrder(null); }}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}iv>
  );
}
