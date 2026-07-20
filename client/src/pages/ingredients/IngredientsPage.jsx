import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Layers, Plus, Edit, Trash2, ShieldCheck, Settings, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  }, [apiRequest, currentUser.role, hasRole]);

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

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading kitchen ingredients...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          Kitchen Raw Ingredients
        </h2>
        {activeTab === "inventory" && (
          <Button onClick={openCreateModal} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        )}
      </div>

      {hasRole(["SUPER_ADMIN", "BRANCH_ADMIN"]) && (
        <div className="flex flex-wrap gap-2 mb-4 bg-muted/30 p-1.5 rounded-lg border border-border/50 inline-flex">
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            onClick={() => setActiveTab("inventory")}
            className="text-sm rounded-md"
            size="sm"
          >
            Inventory Stock
          </Button>
          <Button
            variant={activeTab === "permissions" ? "default" : "ghost"}
            onClick={() => setActiveTab("permissions")}
            className="text-sm rounded-md gap-2"
            size="sm"
          >
            <ShieldCheck className="h-4 w-4" />
            Cashier Permissions
          </Button>
        </div>
      )}

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      {activeTab === "inventory" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Ingredient Name</th>
                  <th className="px-6 py-4 font-semibold">Current Quantity</th>
                  <th className="px-6 py-4 font-semibold">Unit</th>
                  <th className="px-6 py-4 font-semibold">Min Level</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned Branch</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                      No kitchen raw ingredients registered.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => {
                    const isLow = ing.quantity <= ing.reorderLevel;
                    return (
                      <tr key={ing._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{ing.name}</td>
                        <td className="px-6 py-4 font-medium">{ing.quantity}</td>
                        <td className="px-6 py-4">{ing.unit}</td>
                        <td className="px-6 py-4">{ing.reorderLevel}</td>
                        <td className="px-6 py-4">
                          {isLow ? (
                            <span className="px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold whitespace-nowrap">Low Stock</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold whitespace-nowrap">Good</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{ing.branchId?.branchName || "All Branches"}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(ing)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleDelete(ing._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
        /* Cashier Permissions Tab (SUPER_ADMIN / BRANCH_ADMIN only) */
        <Card>
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
            <CardDescription className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              Toggle which Cashiers can view and write raw kitchen ingredients for their branch.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Employee Code</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Branch</th>
                  <th className="px-6 py-4 font-semibold text-right">Ingredients Access Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {cashiers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                      No cashier staff found.
                    </td>
                  </tr>
                ) : (
                  cashiers.map((cashier) => (
                    <tr key={cashier._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-semibold">{cashier.employeeCode}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">{cashier.firstName} {cashier.lastName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{cashier.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cashier.branchId ? "Assigned" : "All Branches"}</td>
                      <td className="px-6 py-4 text-right">
                        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={cashier.hasIngredientsAccess || false}
                            onChange={() => handleToggleAccess(cashier._id, cashier.hasIngredientsAccess)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className={`text-sm font-semibold ${cashier.hasIngredientsAccess ? "text-emerald-500" : "text-muted-foreground"}`}>
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
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-lg border-border/60">
            <form onSubmit={handleSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">{ingredientId ? "Edit Kitchen Stock" : "Add Kitchen Ingredient"}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}
                
                <div className="space-y-2">
                  <Label>Ingredient Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. White Sugar, Fresh Milk, Flour"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={unit} 
                      onChange={(e) => setUnit(e.target.value)}
                    >
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
                
                <div className="space-y-2">
                  <Label>Low Stock Reorder Threshold</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                  />
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
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {ingredientId ? "Save Changes" : "Create Ingredient"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
