import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Coffee, Plus, Edit, Trash2, Layers, Tag, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  }, [apiRequest]);

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

    if (!hasVariants && sellingPrice <= 0) {
      alert("Product price must be greater than ₹0.");
      return;
    }

    if (hasVariants && variants.some(v => v.price <= 0)) {
      alert("Variant price must be greater than ₹0.");
      return;
    }

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

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading product catalog...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          Product Catalog & Menu
        </h2>
        <Button onClick={openCreateModal} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Cost Price</th>
                <th className="px-6 py-4 font-semibold">Selling Price</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    No products configured.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-semibold whitespace-nowrap">{p.productCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{p.productName}</div>
                      {p.variants && p.variants.length > 0 && (
                        <div className="text-[11px] text-muted-foreground mt-1 max-w-[200px] truncate" title={p.variants.map((v) => `${v.name} (${formatCurrency(v.price)})`).join(", ")}>
                          Variants: {p.variants.map((v) => `${v.name}`).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.categoryId
                        ? p.categoryId.categoryCode
                          ? `${p.categoryId.categoryCode} - ${p.categoryId.categoryName}`
                          : p.categoryId.categoryName
                        : "Unassigned"}
                    </td>
                    <td className="px-6 py-4">{p.branchId?.branchName || "All Branches"}</td>
                    <td className="px-6 py-4">
                      {p.isCombo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                          <Layers className="h-3 w-3" /> Combo
                        </span>
                      ) : p.variants && p.variants.length > 0 ? (
                        <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">Variants</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Single</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(p.costPrice)}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(p.sellingPrice)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleDelete(p._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl shadow-lg border-border/60 max-h-[95vh] flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 shrink-0">
                <CardTitle className="text-lg">{productId ? "Edit Product Details" : "Add New Menu Item"}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto space-y-6">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Product/Item Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Pepperoni Pizza"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit of Measure</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={unit} 
                      onChange={(e) => setUnit(e.target.value)}
                    >
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={categoryId} 
                      onChange={(e) => setCategoryId(e.target.value)} 
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.categoryCode ? `${c.categoryCode} - ${c.categoryName}` : c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentUser.role === "SUPER_ADMIN" && (
                    <div className="space-y-2">
                      <Label>Branch Scoping</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                        value={branchId} 
                        onChange={(e) => setBranchId(e.target.value)} 
                        required
                      >
                        <option value="">-- Select Branch --</option>
                        {branches.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.branchName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Short description of taste or contents"
                    rows="2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Pricing / GST */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Cost Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                      required={!hasVariants}
                      disabled={hasVariants}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                      required={!hasVariants}
                      disabled={hasVariants}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Tax (%)</Label>
                    <Input
                      type="number"
                      value={gst}
                      onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* SKU / Barcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>SKU Code</Label>
                    <Input
                      type="text"
                      placeholder="e.g. SKU-PIZZA-PEP"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      disabled={hasVariants}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode Value</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 123456789012"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      disabled={hasVariants}
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/20 border border-border/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        if (e.target.checked) setIsCombo(false);
                      }}
                      disabled={isCombo}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-sm">Enable Sizes / Variants</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCombo}
                      onChange={(e) => {
                        setIsCombo(e.target.checked);
                        if (e.target.checked) setHasVariants(false);
                      }}
                      disabled={hasVariants}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-sm">This is a Combo Meal</span>
                  </label>
                </div>

                {/* Variants Editor Section */}
                {hasVariants && (
                  <div className="p-4 bg-muted/10 border border-border/50 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">Sizes & Pricing Grid</h4>
                      <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add Size Row
                      </Button>
                    </div>
                    {variants.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground text-center py-4">No variants configured. Click Add to define options.</p>
                    ) : (
                      <div className="space-y-3">
                        {variants.map((v, index) => (
                          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-center">
                            <Input
                              type="text"
                              placeholder="Name"
                              value={v.name}
                              onChange={(e) => updateVariantRow(index, "name", e.target.value)}
                              required
                              className="h-9"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Cost"
                              value={v.costPrice}
                              onChange={(e) => updateVariantRow(index, "costPrice", parseFloat(e.target.value) || 0)}
                              required
                              className="h-9"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Sell"
                              value={v.price}
                              onChange={(e) => updateVariantRow(index, "price", parseFloat(e.target.value) || 0)}
                              required
                              className="h-9"
                            />
                            <Input
                              type="text"
                              placeholder="Barcode"
                              value={v.barcode}
                              onChange={(e) => updateVariantRow(index, "barcode", e.target.value)}
                              className="h-9"
                            />
                            <Button type="button" variant="destructive" size="icon" className="h-9 w-9" onClick={() => removeVariantRow(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Combo Items Editor Section */}
                {isCombo && (
                  <div className="p-4 bg-muted/10 border border-border/50 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">Combo Meal Components</h4>
                      <Button type="button" variant="outline" size="sm" onClick={addComboRow} className="h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add Component
                      </Button>
                    </div>
                    {comboItems.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground text-center py-4">No components listed. Link underlying dishes.</p>
                    ) : (
                      <div className="space-y-3">
                        {comboItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-[3fr_2fr_1fr_auto] gap-2 items-center">
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
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
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateComboRow(index, "quantity", parseInt(e.target.value) || 1)}
                              min="1"
                              required
                              className="h-9"
                            />
                            <Button type="button" variant="destructive" size="icon" className="h-9 w-9" onClick={() => removeComboRow(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 shrink-0 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {productId ? "Save Changes" : "Create Product"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
