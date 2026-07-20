import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Your password was updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full pt-4">
      <Card className="shadow-lg border-border/60">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-border/40 pb-5">
            <CardTitle className="text-xl flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-3.5 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-3.5 text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="font-medium">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 special char"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-5 px-6 pb-6 bg-muted/10">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
