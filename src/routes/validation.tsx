import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, ShieldAlert, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Data Validation — FEED System" },
      {
        name: "description",
        content: "Identify and resolve incomplete or invalid records before reporting.",
      },
    ],
  }),
  component: ValidationPage,
});

interface Issue {
  id: number;
  student: string;
  recordType: string;
  field: string;
  date: string;
  status: "Open" | "Reviewed" | "Resolved";
  severity: "high" | "medium" | "low";
}

const seed: Issue[] = [
  {
    id: 1,
    student: "Andrea Cruz",
    recordType: "Measurement",
    field: "Missing endline measurement",
    date: "2025-04-21",
    status: "Open",
    severity: "high",
  },
  {
    id: 2,
    student: "Benjie Santos",
    recordType: "Profile",
    field: "Incomplete student profile (no LRN)",
    date: "2025-04-20",
    status: "Open",
    severity: "medium",
  },
  {
    id: 3,
    student: "Daniel Reyes",
    recordType: "Measurement",
    field: "Invalid height value (300 cm)",
    date: "2025-04-19",
    status: "Reviewed",
    severity: "high",
  },
  {
    id: 4,
    student: "Grade 2 — Rosal",
    recordType: "Attendance",
    field: "Duplicate attendance record (2025-04-15)",
    date: "2025-04-18",
    status: "Open",
    severity: "low",
  },
  {
    id: 5,
    student: "Hector Villanueva",
    recordType: "Measurement",
    field: "Missing baseline measurement",
    date: "2025-04-15",
    status: "Open",
    severity: "high",
  },
];

const sevTone: Record<Issue["severity"], string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning-foreground border-warning/40",
  low: "bg-info/15 text-info border-info/30",
};
const statusTone: Record<Issue["status"], string> = {
  Open: "bg-destructive/15 text-destructive border-destructive/30",
  Reviewed: "bg-warning/15 text-warning-foreground border-warning/40",
  Resolved: "bg-success/15 text-success border-success/30",
};

function ValidationPage() {
  const [issues, setIssues] = useState(seed);
  const [filter, setFilter] = useState<string>("all");

  const filtered = issues.filter((i) => filter === "all" || i.recordType === filter);
  const open = issues.filter((i) => i.status === "Open").length;
  const reviewed = issues.filter((i) => i.status === "Reviewed").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;

  return (
    <AppLayout title="Data Validation" subtitle="Review and resolve incomplete or invalid records">
      <Toaster richColors position="top-right" />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Open Issues"
          value={open}
          icon={AlertCircle}
          tone="text-destructive"
          bg="bg-destructive/10"
        />
        <StatCard
          label="Under Review"
          value={reviewed}
          icon={ShieldAlert}
          tone="text-warning-foreground"
          bg="bg-warning/15"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={CheckCircle2}
          tone="text-success"
          bg="bg-success/10"
        />
      </div>

      <Card className="mt-4">
        <CardHeader className="gap-3">
          <CardTitle className="text-base">Validation Issues</CardTitle>
          <div className="max-w-xs">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issue Types</SelectItem>
                <SelectItem value="Measurement">Measurement</SelectItem>
                <SelectItem value="Profile">Profile</SelectItem>
                <SelectItem value="Attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student / Group</TableHead>
                <TableHead>Record Type</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.student}</TableCell>
                  <TableCell>{i.recordType}</TableCell>
                  <TableCell className="text-sm">{i.field}</TableCell>
                  <TableCell>
                    <Badge className={`border ${sevTone[i.severity]}`}>{i.severity}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.date}</TableCell>
                  <TableCell>
                    <Badge className={`border ${statusTone[i.status]}`}>{i.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIssues((p) =>
                          p.map((x) => (x.id === i.id ? { ...x, status: "Reviewed" } : x)),
                        );
                        toast.success("Marked as reviewed");
                      }}
                      disabled={i.status !== "Open"}
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setIssues((p) =>
                          p.map((x) => (x.id === i.id ? { ...x, status: "Resolved" } : x)),
                        );
                        toast.success("Issue resolved");
                      }}
                      disabled={i.status === "Resolved"}
                    >
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${bg} ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
