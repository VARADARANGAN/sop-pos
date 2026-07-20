import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Users, Plus, Edit, Trash2, Key, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const { apiRequest, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");
  const [branchId, setBranchId] = useState("");
  const [phone, setPhone] = useState("");

  const fetchData = async () => {
    try {
      const [usersRes, branchesRes] = await Promise.all([
        apiRequest("/users"),
        currentUser.role === "SUPER_ADMIN" ? apiRequest("/branches") : Promise.resolve({ success: true, data: [] }),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data);
      }
      if (branchesRes.success) {
        setBranches(branchesRes.data);
      }
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
    setUserId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("CASHIER");
    setBranchId(currentUser.role === "SUPER_ADMIN" ? "" : currentUser.branchId || "");
    setPhone("");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setUserId(user._id);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword(""); // Keep blank to avoid modifying unless entered
    setRole(user.role);
    setBranchId(user.branchId || "");
    setPhone(user.phone || "");
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      firstName,
      lastName,
      email,
      role,
      branchId: branchId || null,
      phone,
    };
    if (password) {
      payload.password = password;
    } else if (!userId) {
      return setError("Password is required for new users");
    }

    try {
      let res;
      if (userId) {
        res = await apiRequest(`/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest("/users", {
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
    if (!window.confirm("Are you sure you want to delete this staff user?")) return;
    try {
      const res = await apiRequest(`/users/${id}`, { method: "DELETE" });
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
        <p>Loading users data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Staff Directory
        </h2>
        <Button onClick={openCreateModal} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Assigned Role</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    No staff users configured.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-semibold">{u.employeeCode}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap border ${
                        u.role === "SUPER_ADMIN" ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        u.role === "BRANCH_ADMIN" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
                        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                        {u.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{u.branchId ? u.branchId.branchName || "Assigned" : "All Branches"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(u)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {u._id !== currentUser.id && (
                          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleDelete(u._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
          <Card className="w-full max-w-lg shadow-lg border-border/60">
            <form onSubmit={handleSubmit}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">{userId ? "Edit Staff details" : "Add New Staff Member"}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="john@sop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password {userId && <span className="text-muted-foreground font-normal text-xs ml-1">(leave blank to keep current)</span>}</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!userId}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assigned Role</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={currentUser.role !== "SUPER_ADMIN"}
                    >
                      <option value="CASHIER">Cashier</option>
                      <option value="BRANCH_ADMIN">Branch Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  {currentUser.role === "SUPER_ADMIN" && (
                    <div className="space-y-2">
                      <Label>Assigned Branch</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        required={role !== "SUPER_ADMIN"}
                        disabled={role === "SUPER_ADMIN"}
                      >
                        <option value="">-- Select Branch --</option>
                        {branches.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.branchName} ({b.branchCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {userId ? "Save Changes" : "Create User"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
