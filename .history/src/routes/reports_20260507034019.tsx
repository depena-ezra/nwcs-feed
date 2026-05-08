import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Eye,
  ClipboardList,
  Activity,
  TrendingUp,
  BarChart3,
  Utensils,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { grades, sections, statusColor } from "@/lib/mockData";
import { useMemo } from "react";

import {
  buildBaselineReport,
  buildConsolidatedSchoolFeedingReport,
  buildEndlineReport,
  buildFeedingAttendanceSummary,
  buildNutritionalImprovement,
  buildStudentMasterlist,
  type ReportFilters,
} from "@/lib/reportsService";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — FEED System" },
      {
        name: "description",
        content:
          "Generate official feeding program reports — masterlist, baseline, endline, attendance, and improvement.",
      },
    ],
  }),
  component: ReportsPage,
});

const reports = [
  {
    id: "masterlist",
    title: "Student Masterlist",
    icon: ClipboardList,
    desc: "Complete list of registered students",
  },
  {
    id: "baseline",
    title: "Baseline Nutritional Status",
    icon: Activity,
    desc: "Initial measurement results per student",
  },
  {
    id: "endline",
    title: "Endline Nutritional Status",
    icon: BarChart3,
    desc: "Final measurement results per student",
  },
  {
    id: "attendance",
    title: "Feeding Attendance Summary",
    icon: Utensils,
    desc: "Daily participation and meal distribution",
  },
  {
    id: "improvement",
    title: "Nutritional Improvement",
    icon: TrendingUp,
    desc: "Baseline vs endline comparison",
  },
  {
    id: "consolidated",
    title: "Consolidated School Feeding",
    icon: Award,
    desc: "Official end-of-program report",
  },
];

function ReportsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: "2025-01-01",
    dateTo: "2025-04-30",
    grade: "all",
    section: "all",
  });

  return (
    <AppLayout title="Reports" subtitle="Generate official and consolidated reports">
      <Toaster richColors position="top-right" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => {
          const active = selected === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`group rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-primary bg-primary-soft/60 shadow-[var(--shadow-elegant)]"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary-soft/30"
              }`}
            >
              <div
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
              >
                <r.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-foreground">{r.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{r.desc}</div>
            </button>
          );
        })}
      </div>

      {selected && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">
              Configure Report — {reports.find((r) => r.id === selected)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <FiltersPanel selected={selected} onChange={(next) => setFilters(next)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Preview generated")} className="gap-2">
                <Eye className="h-4 w-4" /> Preview Report
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Exported to PDF")}
                className="gap-2"
              >
                <FileText className="h-4 w-4" /> Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Exported to Excel")}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Sent to printer")}
                className="gap-2"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button
                variant="default"
                onClick={() => setConfirmFinalize(true)}
                className="ml-auto gap-2 bg-success text-success-foreground hover:bg-success/90"
              >
                <Award className="h-4 w-4" /> Finalize Report
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Preview
              </div>
              <div className="text-sm text-muted-foreground">Preview panel not wired yet.</div>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize and submit this report?</AlertDialogTitle>
            <AlertDialogDescription>
              Once finalized, this report becomes an official record and cannot be edited. A digital
              copy will be archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmFinalize(false);
                toast.success("Report finalized and archived");
              }}
            >
              Finalize
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
