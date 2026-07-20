import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FileText, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AuditPage() {
  const { apiRequest } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiRequest("/reports/audit-logs");
        if (res.success) {
          setLogs(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [apiRequest]);

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p>Loading system audit trails...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Immutable Audit Trails
        </h2>
      </div>

      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <Card>
        <CardContent className="p-0">
          <div className="m-6 flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm text-destructive shadow-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="font-medium leading-relaxed">
              These records are immutable and track all modifications, security adjustments, stock transfers, and price discount exceptions.
            </p>
          </div>

          <div className="overflow-x-auto border-t border-border/50 max-h-[65vh]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50 sticky top-0 z-10 backdrop-blur bg-muted/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Staff/Actor</th>
                  <th className="px-6 py-4 font-semibold">Action Code</th>
                  <th className="px-6 py-4 font-semibold">Affected Target</th>
                  <th className="px-6 py-4 font-semibold">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      No audit records registered.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 text-xs font-medium whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{log.actorName}</div>
                        {log.actorId && (
                          <div className="text-[11px] text-muted-foreground font-medium mt-0.5 tracking-wider">
                            {log.actorId.role?.replace("_", " ")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border ${
                          log.action.includes("LOCKOUT") || log.action.includes("VOID") || log.action.includes("DELETE")
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : log.action.includes("GRANT") || log.action.includes("APPROVE") || log.action.includes("CREATE") || log.action.includes("SUCCESS")
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : log.action.includes("REQUEST") || log.action.includes("UPDATE") || log.action.includes("EDIT")
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[13px] text-foreground">{log.entity}</div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-1 tracking-tight">
                          {log.entityId || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <div className="bg-muted/50 border border-border/50 rounded-md p-2.5 max-h-32 overflow-y-auto max-w-[300px]">
                            <pre className="text-[10px] font-mono text-muted-foreground m-0 whitespace-pre-wrap break-all leading-relaxed">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
