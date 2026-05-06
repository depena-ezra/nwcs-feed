import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, KeyRound, ShieldX, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — FEED System" },
      {
        name: "description",
        content: "Administer user accounts, roles, and access for the FEED system.",
      },
    ],
  }),
  component: UsersPage,
});

interface User {
  id: number;
  name: string;
  username: string;
  role: "Teacher" | "Feeding Coordinator" | "Administrator";
  status: "Active" | "Inactive";
  lastLogin: string;
}

const seed: User[] = [
  {
    id: 1,
    name: "Maria Reyes",
    username: "maria.reyes",
    role: "Feeding Coordinator",
    status: "Active",
    lastLogin: "2025-05-05 08:14",
  },
  {
    id: 2,
    name: "Joseph Tan",
    username: "joseph.tan",
    role: "Administrator",
    status: "Active",
    lastLogin: "2025-05-04 16:22",
  },
  {
    id: 3,
    name: "Anna Bautista",
    username: "anna.b",
    role: "Teacher",
    status: "Active",
    lastLogin: "2025-05-05 07:30",
  },
  {
    id: 4,
    name: "Carlos Domingo",
    username: "carlos.d",
    role: "Teacher",
    status: "Inactive",
    lastLogin: "2025-03-12 10:05",
  },
];

const roleTone: Record<User["role"], string> = {
  Administrator: "bg-info/15 text-info border-info/30",
  "Feeding Coordinator": "bg-primary/15 text-primary border-primary/30",
  Teacher: "bg-accent text-accent-foreground border-border",
};

function UsersPage() {
  const [users, setUsers] = useState<User[]>(seed);
  const [open, setOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [deactivate, setDeactivate] = useState<User | null>(null);

  return (
    <AppLayout
      title="User Management"
      subtitle="Manage user accounts and role-based access"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <AddUserDialog
            onClose={() => setOpen(false)}
            onSave={(u) => {
              setUsers((p) => [u, ...p]);
              setOpen(false);
              toast.success("User account created");
            }}
          />
        </Dialog>
      }
    >
      <Toaster richColors position="top-right" />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <RoleCard
            role="Teacher"
            desc="Encode and view their assigned data only"
            tone="bg-accent"
          />
          <RoleCard
            role="Feeding Coordinator"
            desc="Validate records and generate reports"
            tone="bg-primary-soft"
          />
          <RoleCard
            role="Administrator"
            desc="Full access — manage users and settings"
            tone="bg-info/10"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="font-mono text-xs">{u.username}</TableCell>
                  <TableCell>
                    <Badge className={`border ${roleTone[u.role]}`}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.status === "Active"
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setResetUser(u)}
                      className="gap-1"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeactivate(u)}
                      className="gap-1 text-destructive"
                    >
                      <ShieldX className="h-3.5 w-3.5" />{" "}
                      {u.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reset password */}
      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Generate a new temporary password for {resetUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New Temporary Password</Label>
            <Input type="text" defaultValue="Temp@2025" />
            <p className="text-xs text-muted-foreground">
              User will be required to change this on next login.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setResetUser(null);
                toast.success("Password reset successfully");
              }}
            >
              <Lock className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate */}
      <AlertDialog open={!!deactivate} onOpenChange={(o) => !o && setDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deactivate?.status === "Active" ? "Deactivate" : "Activate"} this account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivate?.status === "Active"
                ? `${deactivate?.name} will lose access to the system immediately.`
                : `${deactivate?.name} will regain access to the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                deactivate?.status === "Active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              onClick={() => {
                if (deactivate) {
                  setUsers((p) =>
                    p.map((x) =>
                      x.id === deactivate.id
                        ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" }
                        : x,
                    ),
                  );
                  toast.success(
                    `Account ${deactivate.status === "Active" ? "deactivated" : "activated"}`,
                  );
                }
                setDeactivate(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function RoleCard({ role, desc, tone }: { role: string; desc: string; tone: string }) {
  return (
    <div className={`rounded-lg border border-border p-3 ${tone}`}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <div className="font-semibold text-foreground">{role}</div>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}

function AddUserDialog({ onClose, onSave }: { onClose: () => void; onSave: (u: User) => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [role, setRole] = useState<User["role"]>("Teacher");
  const [status, setStatus] = useState<User["status"]>("Active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!username.trim()) e.username = "Username is required.";
    if (!pw) e.pw = "Password is required.";
    else if (pw.length < 8) e.pw = "Password must be at least 8 characters.";
    if (pw !== cpw) e.cpw = "Passwords do not match.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the form errors.");
      return;
    }
    onSave({ id: Date.now(), name, username, role, status, lastLogin: "—" });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add New User</DialogTitle>
        <DialogDescription>Create an account and assign a role.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <Field label="Full Name" required value={name} onChange={setName} error={errors.name} />
        <Field
          label="Username"
          required
          value={username}
          onChange={setUsername}
          error={errors.username}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Password"
            required
            type="password"
            value={pw}
            onChange={setPw}
            error={errors.pw}
            helper="Minimum 8 characters"
          />
          <Field
            label="Confirm Password"
            required
            type="password"
            value={cpw}
            onChange={setCpw}
            error={errors.cpw}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as User["role"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Feeding Coordinator">Feeding Coordinator</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as User["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!name || !username || !pw || !cpw}>
          Create User
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  error,
  helper,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helper?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-destructive" : ""}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
