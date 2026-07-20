import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  DollarSign, ShoppingCart, AlertTriangle, Package, 
  TrendingUp, Activity, BarChart3, Clock, AlertCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { apiRequest, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiRequest("/reports/dashboard");
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiRequest]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-muted/50 rounded-lg animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/30"></CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="h-[300px] animate-pulse bg-muted/20"></Card>
          <Card className="h-[300px] animate-pulse bg-muted/20"></Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-destructive/5 border border-destructive/20">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h4 className="text-lg font-semibold text-foreground">Failed to load dashboard</h4>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  // Calculate some derived stats for UI representation (growth metrics, etc)
  const avgOrderValue = stats?.todayOrders > 0 ? (stats.todayRevenue / stats.todayOrders) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName || "Manager"}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Data Sync
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.todayRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-secondary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayOrders || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+5%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              Stable across shifts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-destructive font-medium">Requires attention</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Top Sellers */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Best Selling Items</CardTitle>
              <CardDescription>Top products by quantity sold today</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
          </CardHeader>
          <CardContent>
            {!stats?.topProducts?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Package className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No sales data available for today yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map((item, index) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.quantitySold} units sold</p>
                    </div>
                    <div className="font-medium text-sm">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Low Stock Alerts */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Items running below minimum threshold</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs">Manage Stock</Button>
          </CardHeader>
          <CardContent>
            {!stats?.lowStockDetails?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-3 text-emerald-500/50" />
                <p className="text-sm">All stock levels are optimal.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.lowStockDetails.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate text-foreground">
                        {item.productId?.productName || item.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Min Level: {item.reorderLevel} • Branch: {item.branchId?.branchName || "Main"}
                      </p>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-destructive text-destructive-foreground whitespace-nowrap">
                      {item.currentStock} {item.unit || "Left"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Visual Chart Placeholder for SaaS feel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <div className="space-y-1">
            <CardTitle>Sales Trends Overview</CardTitle>
            <CardDescription>Revenue trajectory over time</CardDescription>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md border border-border">
            <button className="px-3 py-1 text-xs font-medium rounded bg-background shadow-sm text-foreground">Today</button>
            <button className="px-3 py-1 text-xs font-medium rounded text-muted-foreground hover:text-foreground">7 Days</button>
            <button className="px-3 py-1 text-xs font-medium rounded text-muted-foreground hover:text-foreground">30 Days</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 w-full border-t border-b border-border/50 py-4 flex items-end gap-2 px-2 overflow-hidden">
            {/* Pure CSS decorative chart */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
              <div className="w-full border-t border-dashed border-muted-foreground"></div>
              <div className="w-full border-t border-dashed border-muted-foreground"></div>
              <div className="w-full border-t border-dashed border-muted-foreground"></div>
              <div className="w-full border-t border-dashed border-muted-foreground"></div>
            </div>
            
            {[40, 65, 30, 80, 50, 95, 75, 40, 60, 20, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full group">
                <div 
                  className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all duration-300 relative border-t-2 border-primary" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded pointer-events-none">
                    {h}k
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

