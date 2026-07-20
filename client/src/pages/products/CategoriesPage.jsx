import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Tags, Plus, Edit, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CategoriesPage() {
  const { apiRequest } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState(null);
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryName, setCategoryName] = useState("");

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
  }, [apiRequest]);

  const openCreateModal = () => {
    setCategoryId(null);
    setCategoryCode("");
    setCategoryName("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setCategoryId(cat._id);
    setCategoryCode(cat.categoryCode || "");
    setCategoryName(cat.categoryName || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { categoryCode, categoryName };
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

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading categories...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Tags className="h-6 w-6 text-primary" />
          Product Categories
        </h2>
        <Button onClick={openCreateModal} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Category Code</th>
                <th className="px-6 py-4 font-semibold">Category Name</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
                    No product categories configured.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{c.categoryCode}</span>
                    </td>
                    <td className="px-6 py-4">{c.categoryName}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(c)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleDelete(c._id)}>
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
          <Card className="w-full max-w-md shadow-lg border-border/60">
            <form onSubmit={handleSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">{categoryId ? "Edit Category" : "Add New Category"}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="categoryCode">Category Code</Label>
                  <Input
                    id="categoryCode"
                    type="text"
                    placeholder="e.g. BEV, MAIN, DESSERT"
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    type="text"
                    placeholder="e.g. Beverages, Mains, Desserts"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {categoryId ? "Save Changes" : "Create Category"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
