import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UsersRound, Plus, Phone, Mail, FileClock, History, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomersPage() {
  const { apiRequest, user: currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // History State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await apiRequest("/customers");
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [apiRequest]);

  const openCreateModal = () => {
    setCustomerId(null);
    setName("");
    setPhone("");
    setEmail("");
    setError(null);
    setShowModal(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify({ name, phone, email: email || null }),
      });
      if (res.success) {
        setShowModal(false);
        fetchCustomers();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadHistory = async (customer) => {
    setSelectedCustomer(customer);
    setHistoryList([]);
    setLoadingHistory(true);
    try {
      const res = await apiRequest(`/customers/${customer._id}/history`);
      if (res.success) {
        setHistoryList(res.data);
      }
    } catch (err) {
      alert(`Failed to load history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading customer profiles...</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
      {/* Left side: Customers Directory list */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" />
            Customer Profiles
          </CardTitle>
          <Button onClick={openCreateModal} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Profile
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {error && <div className="p-3 m-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer Details</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                      No customers found. Attach a profile during checkout.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c._id}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedCustomer?._id === c._id ? 'bg-primary/5' : ''}`}
                      onClick={() => loadHistory(c)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{c.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.email ? (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {c.email}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); loadHistory(c); }}>
                          <FileClock className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Right side: Purchase History Ledger panel */}
      <Card className="sticky top-6">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Purchase Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!selectedCustomer ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <UsersRound className="h-12 w-12 mb-4 text-muted/50" />
              <p>Select a customer from directory<br/>to view their transaction history.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                <div className="font-bold text-foreground text-lg">{selectedCustomer.name}</div>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5"/> {selectedCustomer.phone}</span>
                  {selectedCustomer.email && (
                    <>
                      <span className="text-border">|</span>
                      <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5"/> {selectedCustomer.email}</span>
                    </>
                  )}
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                  <p className="text-sm">Fetching invoice details...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/10 border border-dashed border-border/50 rounded-lg">
                  No transaction records found for this customer.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((order) => (
                    <div key={order._id} className="border border-border/50 rounded-lg p-4 bg-card hover:bg-muted/10 transition-colors shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm text-foreground">{order.orderNumber}</span>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded font-semibold text-xs">
                          {formatCurrency(order.grandTotal)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between border-b border-dashed border-border/60 pb-2 mb-2">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>{order.branchId?.branchName || "Connected"}</span>
                      </div>
                      <ul className="pl-4 m-0 text-xs text-foreground/80 list-disc space-y-1">
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{item.name}</span> {item.variantName ? <span className="text-muted-foreground">({item.variantName})</span> : ""} <span className="text-primary ml-1">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-lg border-border/60">
            <form onSubmit={handleCreateCustomer}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <CardTitle className="text-lg">Create Customer Profile</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{error}</div>}
                
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Alice Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="e.g. alice@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-4 px-6 pb-6 bg-muted/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Profile
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
