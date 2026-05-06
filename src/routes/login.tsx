import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — FEED System" },
      {
        name: "description",
        content: "Sign in to the FEED Feeding Encoding, Evaluation, and Data Management System.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const sessionExpired =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("session") === "expired";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const fe: typeof errors = {};
    if (!username.trim()) fe.username = "Username is required.";
    if (!password) fe.password = "Password is required.";
    setErrors(fe);
    if (Object.keys(fe).length) {
      setError(null);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === "demo" && password !== "demo") {
        setError("Invalid username or password. Please try again.");
        return;
      }
      toast.success("Welcome back, Maria!");
      navigate({ to: "/" });
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-soft via-background to-accent p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />

      <Toaster richColors position="top-center" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/95 p-8 shadow-[var(--shadow-elegant)] backdrop-blur">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg">
              <Sprout className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">FEED System</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Feeding Encoding, Evaluation, and Data Management System
            </p>
          </div>

          {sessionExpired && (
            <Alert className="mb-4 border-warning/40 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning-foreground" />
              <AlertTitle className="text-warning-foreground">Session expired</AlertTitle>
              <AlertDescription className="text-warning-foreground/80">
                Your session has timed out. Please sign in again to continue.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. maria.reyes"
                className={errors.username ? "border-destructive" : ""}
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <div className="flex justify-end pt-1">
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-md hover:opacity-95"
              size="lg"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Authorized personnel only · Department of Education
          </p>
        </div>
      </div>
    </div>
  );
}
