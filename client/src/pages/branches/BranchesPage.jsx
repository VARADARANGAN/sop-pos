import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GitBranch, Plus, Edit, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BranchesPage() {
  const { apiRequest } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [branchId, setBranchId] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const fetchBranches = async () => {
    try {
      const res = await apiRequest("/branches");
      if (res.success) {
        setBranches(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [apiRequest]);

  const openCreateModal = () => {
    setBranchId(null);
    setBranchName("");
    setBranchCode("");
    setAddress("");
    setPhone("");
    setEmail("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setBranchId(branch._id);
    setBranchName(branch.branchName);
    setBranchCode(branch.branchCode);
    setAddress(branch.address || "");
    setPhone(branch.phone || "");
    setEmail(branch.email || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { branchName, branchCode, address, phone, email };
    try {
      let res;
      if (branchId) {
        res = await apiRequest(`/branches/${branchId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/branches", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      if (res.success) {
        setShowModal(false);
        fetchBranches();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      const res = await apiRequest(`/branches/${id}`, { method: "DELETE" });
      if (res.success) {
        fetchBranches();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading branches...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          Branch Directory
        </h2>
        <Button onClick={openCreateModal} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Branch Code</th>
                <th className="px-6 py-4 font-semibold">Branch Name</th>
                <th className="px-6 py-4 font-semibold">Contact Phone</th>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Location / Address</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    No branches configured in the system.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-semibold">{b.branchCode}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{b.branchName}</td>
                    <td className="px-6 py-4">{b.phone || "-"}</td>
                    <td className="px-6 py-4">{b.email || "-"}</td>
                    <td className="px-6 py-4">{b.address || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(b)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleDelete(b._id)}>
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

      {/* Custom Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-lg border-border/60">
            <form onSubmit={handleSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">{branchId ? "Edit Branch details" : "Add New Branch"}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Branch Code</Label>
                    <Input
                      type="text"
                      placeholder="e.g. BR001"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      required
                      disabled={!!branchId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Times Square Outlet"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="e.g. branch@sop.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="text"
                      placeholder="e.g. +1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Location details"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {branchId ? "Save Changes" : "Create Branch"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
