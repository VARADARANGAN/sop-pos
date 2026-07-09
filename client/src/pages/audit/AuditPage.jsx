import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FileText, ShieldAlert } from "lucide-react";

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
  }, []);

  if (loading) return <div className="loading-spinner">Loading system audit trails...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText style={{ color: "var(--accent)" }} />
          Immutable Audit Trails
        </h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "var(--danger)" }}>
          <ShieldAlert style={{ width: "16px", height: "16px", flexShrink: 0 }} />
          These records are immutable and track all modifications, security adjustments, stock transfers, and price discount exceptions.
        </div>

        <div className="table-container" style={{ maxHeight: "65vh" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Staff/Actor</th>
                <th>Action Code</th>
                <th>Affected Target</th>
                <th>Metadata Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }} className="empty-state">
                    No audit records registered.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: "12px" }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{log.actorName}</div>
                      {log.actorId && (
                        <span style={{ fontSize: "11px", color: "var(--secondary)" }}>
                          {log.actorId.role?.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        log.action.includes("LOCKOUT") || log.action.includes("VOID")
                          ? "badge-danger"
                          : log.action.includes("GRANT") || log.action.includes("APPROVE")
                          ? "badge-success"
                          : log.action.includes("REQUEST")
                          ? "badge-warning"
                          : "badge-info"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>{log.entity}</div>
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--secondary)" }}>
                        {log.entityId || "N/A"}
                      </span>
                    </td>
                    <td>
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <pre style={{ margin: 0, fontSize: "11px", fontFamily: "monospace", overflowX: "auto", background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "4px" }}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
