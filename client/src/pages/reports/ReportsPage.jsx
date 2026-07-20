import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { TrendingUp, Calendar, CreditCard, Award } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ReportsPage() {
  const { apiRequest } = useAuth();
  const [paymentReport, setPaymentReport] = useState([]);
  const [cashierReport, setCashierReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter dates (Default: current month)
  const getFirstDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [payRes, cashierRes] = await Promise.all([
        apiRequest(`/reports/sales-by-payment?startDate=${startDate}&endDate=${endDate}`),
        apiRequest(`/reports/cashier-performance?startDate=${startDate}&endDate=${endDate}`),
      ]);

      if (payRes.success) setPaymentReport(payRes.data);
      if (cashierRes.success) setCashierReport(cashierRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, apiRequest]);

  const calculateTotalSales = () => {
    return paymentReport.reduce((sum, item) => sum + item.amount, 0);
  };

  if (loading && paymentReport.length === 0) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading reports data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Reports & Analytics
        </h2>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg border border-border/50 shadow-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="h-8 w-[140px] text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-xs text-muted-foreground font-medium">to</span>
            <Input
              type="date"
              className="h-8 w-[140px] text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Sales by Payment Method */}
        <Card className="xl:col-span-1">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Sales by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-5">
              {paymentReport.map((item) => {
                const total = calculateTotalSales();
                const pct = total > 0 ? (item.amount / total) * 100 : 0;
                return (
                  <div key={item.method} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-foreground/90">{item.method}</span>
                      <span className="text-foreground">{formatCurrency(item.amount)} <span className="text-muted-foreground font-normal ml-1">({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full border border-border/40">
                      <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t border-dashed border-border/60 pt-4 mt-2 flex justify-between items-center">
                <span className="font-bold text-base">Total Revenue</span>
                <span className="font-bold text-lg text-emerald-500">{formatCurrency(calculateTotalSales())}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cashier Performance Report */}
        <Card className="xl:col-span-2">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Staff Performance Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Cashier Profile</th>
                    <th className="px-6 py-4 font-semibold">Employee Code</th>
                    <th className="px-6 py-4 font-semibold text-center">Bills Checked</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Sales</th>
                    <th className="px-6 py-4 font-semibold text-right">Avg Ticket</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Discounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cashierReport.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                        No cashier sales recorded during this date window.
                      </td>
                    </tr>
                  ) : (
                    cashierReport.map((cash) => (
                      <tr key={cash._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{cash.cashierName}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-semibold">{cash.employeeCode}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">{cash.billsProcessed}</td>
                        <td className="px-6 py-4 font-bold text-emerald-500 text-right">{formatCurrency(cash.revenue)}</td>
                        <td className="px-6 py-4 font-medium text-right">{formatCurrency(cash.averageBillValue)}</td>
                        <td className="px-6 py-4 font-medium text-destructive text-right">-{formatCurrency(cash.totalDiscount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
