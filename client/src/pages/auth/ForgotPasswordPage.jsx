import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Sparkles, ArrowLeft } from "lucide-react";
import "./Auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [demoToken, setDemoToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage("If an account with that email exists, a password reset link has been sent.");
      // In development, the API returns the token in response
      if (res && res.data && res.data.token) {
        setDemoToken(res.data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <Sparkles className="auth-logo" />
          <h2>Forgot Password</h2>
          <p>Request a link to reset your account credentials</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Demo Token Callout */}
        {demoToken && (
          <div className="alert alert-warning" style={{ overflowWrap: "anywhere" }}>
            <strong>[DEMO OVERRIDE] Reset Token:</strong>
            <p style={{ margin: "4px 0", fontFamily: "monospace", fontSize: "12px" }}>
              {demoToken}
            </p>
            <Link to={`/reset-password?token=${demoToken}`} className="auth-link">
              Click here to proceed directly to Reset Page
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="name@sop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
