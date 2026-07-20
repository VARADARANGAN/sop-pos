import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Sparkles, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <Card className="w-full max-w-md shadow-xl shadow-primary/5 border-border/50 bg-background/60 backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-6 text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
            <CardDescription>Request a link to reset your account credentials</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {message && (
              <div className="p-3 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{message}</p>
              </div>
            )}

            {/* Demo Token Callout */}
            {demoToken && (
              <div className="p-4 text-sm bg-amber-500/10 border border-amber-500/20 rounded-md">
                <strong className="text-amber-700 dark:text-amber-400 block mb-1">[DEMO OVERRIDE] Reset Token:</strong>
                <p className="font-mono text-xs text-muted-foreground bg-background/50 p-2 rounded mb-3 break-all">
                  {demoToken}
                </p>
                <Link to={`/reset-password?token=${demoToken}`} className="text-primary hover:underline font-medium block text-center">
                  Click here to proceed directly to Reset Page
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@sop.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md shadow-primary/20" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6 pb-6">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
