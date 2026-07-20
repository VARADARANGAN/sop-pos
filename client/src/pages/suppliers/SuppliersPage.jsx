import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Truck, Plus, Edit, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  }, [apiRequest, currentUser.role]);

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

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading suppliers...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Suppliers Registry
        </h2>
        <Button onClick={openCreateModal} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Supplier Name</th>
                <th className="px-6 py-4 font-semibold">Contact Representative</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Assigned Branch</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    No suppliers configured.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{s.name}</div>
                      {((s.linkedProducts && s.linkedProducts.length > 0) || (s.linkedIngredients && s.linkedIngredients.length > 0)) && (
                        <div className="text-[11px] text-muted-foreground mt-1 max-w-[250px] truncate" title={[
                          ...(s.linkedProducts?.map(p => p.productName) || []),
                          ...(s.linkedIngredients?.map(i => i.name) || [])
                        ].join(", ")}>
                          Supplies: {[
                            ...(s.linkedProducts?.map(p => p.productName) || []),
                            ...(s.linkedIngredients?.map(i => i.name) || [])
                          ].join(", ") || "Nothing linked"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{s.contactName || "-"}</td>
                    <td className="px-6 py-4">{s.phone}</td>
                    <td className="px-6 py-4">{s.email || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.branchId?.branchName || "All Branches"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleDelete(s._id)}>
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
          <Card className="w-full max-w-2xl shadow-lg border-border/60 max-h-[90vh] flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 shrink-0">
                <CardTitle className="text-lg">{supplierId ? "Edit Supplier Info" : "Add New Supplier"}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4 overflow-y-auto">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

                <div className="space-y-2">
                  <Label>Supplier Company/Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Acme Organic Fruits"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Marcus Aurelius"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="e.g. sales@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {currentUser.role === "SUPER_ADMIN" && (
                  <div className="space-y-2">
                    <Label>Assigned Branch</Label>
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

                {/* Linked Products & Ingredients list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/40 pt-4 mt-4">
                  <div className="space-y-2">
                    <Label>Link Products</Label>
                    <div className="max-h-[150px] overflow-y-auto border border-border/60 p-3 rounded-md bg-muted/10 space-y-2">
                      {products.map(p => (
                        <label key={p._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 p-1 -mx-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(p._id)}
                            onChange={() => handleProductSelect(p._id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="truncate">{p.productName}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Link Ingredients</Label>
                    <div className="max-h-[150px] overflow-y-auto border border-border/60 p-3 rounded-md bg-muted/10 space-y-2">
                      {ingredients.map(i => (
                        <label key={i._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 p-1 -mx-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(i._id)}
                            onChange={() => handleIngredientSelect(i._id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="truncate">{i.name} <span className="text-muted-foreground text-xs">({i.unit})</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {supplierId ? "Save Changes" : "Create Supplier"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
