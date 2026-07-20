import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Package, Plus, MoveHorizontal, AlertTriangle, ShieldCheck, HelpCircle, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [showInitModal, setShowInitModal] = useState(false);

  // Form State: Initialize Stock
  const [initBranchId, setInitBranchId] = useState("");
  const [initProductId, setInitProductId] = useState("");
  const [initVariantId, setInitVariantId] = useState("");
  const [initCurrentStock, setInitCurrentStock] = useState(0);
  const [initReorderLevel, setInitReorderLevel] = useState(0);

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
  }, [apiRequest, currentUser.role]);

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

  const openInitModal = () => {
    setInitBranchId(currentUser.role === "SUPER_ADMIN" ? (branches.length > 0 ? branches[0]._id : "") : currentUser.branchId || "");
    setInitProductId(products.length > 0 ? products[0]._id : "");
    setInitVariantId("");
    setInitCurrentStock(0);
    setInitReorderLevel(0);
    setError(null);
    setShowInitModal(true);
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

  const handleInitSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      branchId: initBranchId,
      productId: initProductId,
      variantId: initVariantId || null,
      currentStock: Number(initCurrentStock),
      reorderLevel: Number(initReorderLevel),
      reservedStock: 0,
    };

    try {
      const res = await apiRequest("/inventory", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setShowInitModal(false);
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

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading inventory modules...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Inventory Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openInitModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Initialize Stock
          </Button>
          <Button variant="outline" onClick={openAdjustModal} className="gap-2 text-amber-600 border-amber-600/20 hover:bg-amber-600/10 hover:text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            Wastage Adjustment
          </Button>
          <Button onClick={openTransferModal} className="gap-2">
            <MoveHorizontal className="h-4 w-4" />
            Request Transfer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50 inline-flex">
        <Button
          variant={activeTab === "stock" ? "default" : "ghost"}
          onClick={() => setActiveTab("stock")}
          className="text-sm rounded-md"
          size="sm"
        >
          Stock Balance
        </Button>
        <Button
          variant={activeTab === "transfers" ? "default" : "ghost"}
          onClick={() => setActiveTab("transfers")}
          className="text-sm rounded-md"
          size="sm"
        >
          Inter-Branch Transfers
        </Button>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      {activeTab === "stock" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product Details</th>
                  <th className="px-6 py-4 font-semibold">Assigned Branch</th>
                  <th className="px-6 py-4 font-semibold">Reorder Limit</th>
                  <th className="px-6 py-4 font-semibold">Current Stock</th>
                  <th className="px-6 py-4 font-semibold">Available Stock</th>
                  <th className="px-6 py-4 font-semibold">Reserved Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                      No stock records initialized. Add products or restock.
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => {
                    const isLow = inv.currentStock <= inv.reorderLevel;
                    // Find variant name if it has variantId
                    const variantName = inv.variantId && inv.productId?.variants?.find(v => v._id === inv.variantId)?.name;
                    return (
                      <tr key={inv._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">
                            {inv.productId?.productName} {variantName ? <span className="text-muted-foreground text-xs font-normal ml-1">({variantName})</span> : ""}
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-0.5 block">
                            {inv.productId?.productCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{inv.branchId?.branchName}</td>
                        <td className="px-6 py-4">{inv.reorderLevel}</td>
                        <td className="px-6 py-4 font-medium">{inv.currentStock}</td>
                        <td className="px-6 py-4 font-medium">{inv.availableStock}</td>
                        <td className="px-6 py-4">{inv.reservedStock}</td>
                        <td className="px-6 py-4">
                          {isLow ? (
                            <span className="px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold whitespace-nowrap">Reorder Alert</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold whitespace-nowrap">Sufficient</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* tab: Inter-Branch transfers dashboard */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Source Branch</th>
                  <th className="px-6 py-4 font-semibold">Dest Branch</th>
                  <th className="px-6 py-4 font-semibold">Details / Items</th>
                  <th className="px-6 py-4 font-semibold">Requested By</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
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
                      <tr key={tf._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{tf.fromBranchId?.branchName}</td>
                        <td className="px-6 py-4 font-medium">{tf.toBranchId?.branchName}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {tf.items?.map((item, idx) => (
                              <div key={idx} className="text-[13px] font-medium p-1.5 bg-muted/50 rounded border border-border/50">
                                <span className="text-muted-foreground text-xs">{item.itemType} ID:</span> <span className="text-foreground">{item.itemId}</span> <span className="mx-2 text-muted-foreground">|</span> <span className="text-primary font-semibold">Qty: {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">{tf.requestedBy?.firstName} {tf.requestedBy?.lastName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap border ${
                            tf.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                            tf.status === "REJECTED" ? "bg-destructive/10 text-destructive border-destructive/20" : 
                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            {tf.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {tf.status === "REQUESTED" && canApprove ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleApproveTransfer(tf._id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectTransfer(tf._id)}>
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="text-right text-xs text-muted-foreground font-medium pr-4">Reviewed</div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Initialize Stock modal */}
      {showInitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-lg border-border/60">
            <form onSubmit={handleInitSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">Initialize Stock Balance</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowInitModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}

                {currentUser.role === "SUPER_ADMIN" && (
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={initBranchId} 
                      onChange={(e) => setInitBranchId(e.target.value)} 
                      required
                    >
                      <option value="">-- Select Branch --</option>
                      {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Select Product</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={initProductId} 
                    onChange={(e) => setInitProductId(e.target.value)} 
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>)}
                  </select>
                </div>

                {products.find(p => p._id === initProductId)?.variants?.length > 0 && (
                  <div className="space-y-2">
                    <Label>Variant / Size</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={initVariantId} 
                      onChange={(e) => setInitVariantId(e.target.value)} 
                      required
                    >
                      <option value="">-- Choose Variant --</option>
                      {products.find(p => p._id === initProductId)?.variants.map(v => (
                        <option key={v._id} value={v._id}>{v.name} ({formatCurrency(v.price)})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opening Stock</Label>
                    <Input
                      type="number"
                      value={initCurrentStock}
                      onChange={(e) => setInitCurrentStock(parseInt(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reorder Alert Level</Label>
                    <Input
                      type="number"
                      value={initReorderLevel}
                      onChange={(e) => setInitReorderLevel(parseInt(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowInitModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Initialize Record
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Stock Adjustment modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-lg border-border/60">
            <form onSubmit={handleAdjustSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">Log Damage / Wastage</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAdjustModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}
                
                <div className="space-y-2">
                  <Label>Item Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={adjItemType} 
                    onChange={(e) => { setAdjItemType(e.target.value); setAdjItemId(""); setAdjVariantId(""); }}
                  >
                    <option value="PRODUCT">Regular Product</option>
                    <option value="INGREDIENT">Kitchen Raw Ingredient</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Select Item</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={adjItemId} 
                    onChange={(e) => setAdjItemId(e.target.value)} 
                    required
                  >
                    <option value="">-- Choose Item --</option>
                    {adjItemType === "PRODUCT"
                      ? products.map(p => <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>)
                      : ingredients.map(i => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)
                    }
                  </select>
                </div>

                {adjItemType === "PRODUCT" && products.find(p => p._id === adjItemId)?.variants?.length > 0 && (
                  <div className="space-y-2">
                    <Label>Variant / Size</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={adjVariantId} 
                      onChange={(e) => setAdjVariantId(e.target.value)} 
                      required
                    >
                      <option value="">-- Choose Variant --</option>
                      {products.find(p => p._id === adjItemId)?.variants.map(v => (
                        <option key={v._id} value={v._id}>{v.name} ({formatCurrency(v.price)})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={adjQuantity}
                      onChange={(e) => setAdjQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason Code</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={adjType} 
                      onChange={(e) => setAdjType(e.target.value)}
                    >
                      <option value="DAMAGE">Damaged / Broken</option>
                      <option value="WASTAGE">Wastage / Spoiled</option>
                      <option value="EXPIRY">Expired</option>
                      <option value="OTHER">Other Reason</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Detailed Notes / Reason</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Enter detailed reason here"
                    rows="2"
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Log Write-Off
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Stock Transfer Request modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-lg border-border/60">
            <form onSubmit={handleTransferSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">Request Inter-Branch Transfer</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowTransferModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}

                {currentUser.role === "SUPER_ADMIN" && (
                  <div className="space-y-2">
                    <Label>Source Branch (From)</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={tfFromBranch} 
                      onChange={(e) => setTfFromBranch(e.target.value)} 
                      required
                    >
                      <option value="">-- Select Source Branch --</option>
                      {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Destination Branch (To)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={tfToBranch} 
                    onChange={(e) => setTfToBranch(e.target.value)} 
                    required
                  >
                    <option value="">-- Select Destination Branch --</option>
                    {branches.filter(b => b._id !== tfFromBranch).map(b => (
                      <option key={b._id} value={b._id}>{b.branchName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Item Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={tfItemType} 
                    onChange={(e) => { setTfItemType(e.target.value); setTfItemId(""); setTfVariantId(""); }}
                  >
                    <option value="PRODUCT">Regular Product</option>
                    <option value="INGREDIENT">Kitchen Raw Ingredient</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Select Item</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={tfItemId} 
                    onChange={(e) => setTfItemId(e.target.value)} 
                    required
                  >
                    <option value="">-- Choose Item --</option>
                    {tfItemType === "PRODUCT"
                      ? products.filter(p => !tfFromBranch || p.branchId?._id === tfFromBranch || p.branchId === tfFromBranch).map(p => <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>)
                      : ingredients.filter(i => !tfFromBranch || i.branchId?._id === tfFromBranch || i.branchId === tfFromBranch).map(i => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)
                    }
                  </select>
                </div>

                {tfItemType === "PRODUCT" && products.find(p => p._id === tfItemId)?.variants?.length > 0 && (
                  <div className="space-y-2">
                    <Label>Variant / Size</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={tfVariantId} 
                      onChange={(e) => setTfVariantId(e.target.value)} 
                      required
                    >
                      <option value="">-- Choose Variant --</option>
                      {products.find(p => p._id === tfItemId)?.variants.map(v => (
                        <option key={v._id} value={v._id}>{v.name} ({formatCurrency(v.price)})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={tfQuantity}
                    onChange={(e) => setTfQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Request
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
