import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";
import {
  students,
  grades,
  sections,
  statusColor,
  type Student,
  type NutritionStatus,
} from "@/lib/mockData";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutritional Status — FEED System" },
      {
        name: "description",
        content: "Processed health and nutrition results across baseline and endline measurements.",
      },
    ],
  }),
  component: NutritionPage,
});

function improvement(b: NutritionStatus, e: NutritionStatus) {
  const order = { Underweight: 0, "At Risk": 1, Normal: 2, Overweight: 3 };
  const diff = order[e] - order[b];
  if (e === "Normal" && b !== "Normal")
    return {
      label: "Improved",
      icon: TrendingUp,
      tone: "text-success bg-success/10 border-success/30",
    };
  if (diff > 0 && e !== "Overweight")
    return {
      label: "Improved",
      icon: TrendingUp,
      tone: "text-success bg-success/10 border-success/30",
    };
  if (diff < 0)
    return {
      label: "Declined",
      icon: TrendingDown,
      tone: "text-destructive bg-destructive/10 border-destructive/30",
    };
  return { label: "No Change", icon: Minus, tone: "text-muted-foreground bg-muted border-border" };
}

function NutritionPage() {
  const [fGrade, setFGrade] = useState("all");
  const [fSection, setFSection] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [detail, setDetail] = useState<Student | null>(null);

  const filtered = students.filter(
    (s) =>
      (fGrade === "all" || s.grade === fGrade) &&
      (fSection === "all" || s.section === fSection) &&
      (fStatus === "all" || s.endlineStatus === fStatus),
  );

  return (
    <AppLayout
      title="Nutritional Status"
      subtitle="Baseline vs endline comparison and progress tracking"
    >
      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base">Filter Results</CardTitle>
          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={fGrade} onValueChange={setFGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fSection} onValueChange={setFSection}>
              <SelectTrigger>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Endline Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Underweight">Underweight</SelectItem>
                <SelectItem value="Overweight">Overweight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade / Section</TableHead>
                <TableHead>Baseline BMI</TableHead>
                <TableHead>Endline BMI</TableHead>
                <TableHead>Baseline Status</TableHead>
                <TableHead>Endline Status</TableHead>
                <TableHead>Improvement</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const imp = improvement(s.baselineStatus, s.endlineStatus);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{s.id}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.grade}
                      <div className="text-xs text-muted-foreground">{s.section}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{s.baselineBMI}</TableCell>
                    <TableCell className="font-semibold">{s.endlineBMI}</TableCell>
                    <TableCell>
                      <Badge className={`border ${statusColor[s.baselineStatus]}`}>
                        {s.baselineStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${statusColor[s.endlineStatus]}`}>
                        {s.endlineStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 border ${imp.tone}`}>
                        <imp.icon className="h-3 w-3" /> {imp.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetail(s)}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nutritional Progress — {detail?.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ProgressCard
                  label="Baseline"
                  bmi={detail.baselineBMI}
                  status={detail.baselineStatus}
                />
                <ProgressCard
                  label="Endline"
                  bmi={detail.endlineBMI}
                  status={detail.endlineStatus}
                />
              </div>
              <div className="rounded-lg border border-border bg-muted p-3 text-sm">
                <div className="font-medium text-foreground">Summary</div>
                <p className="mt-1 text-muted-foreground text-xs">
                  BMI changed by{" "}
                  <span
                    className={`font-semibold ${detail.endlineBMI >= detail.baselineBMI ? "text-success" : "text-destructive"}`}
                  >
                    {(detail.endlineBMI - detail.baselineBMI).toFixed(2)}
                  </span>{" "}
                  points from baseline to endline.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function ProgressCard({
  label,
  bmi,
  status,
}: {
  label: string;
  bmi: number;
  status: NutritionStatus;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{bmi}</div>
      <Badge className={`mt-2 border ${statusColor[status]}`}>{status}</Badge>
    </div>
  );
}
