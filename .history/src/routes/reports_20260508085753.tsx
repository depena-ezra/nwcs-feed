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
  type MeasurementReportRow,
  type AttendanceReport,
  type NutritionalImprovementReport,
  type ConsolidatedSchoolFeedingReport,
  type StudentMasterlistRow,
} from "@/lib/reportsService";

import {
  exportMasterlistToPDF,
  exportMeasurementToPDF,
  exportAttendanceToPDF,
  exportImprovementToPDF,
  exportConsolidatedToPDF,
  exportMasterlistToExcel,
  exportMeasurementToExcel,
  exportAttendanceToExcel,
  exportImprovementToExcel,
  exportConsolidatedToExcel,
} from "@/lib/reportExport";

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

function ReportPreview({ selected, filters }: { selected: string | null; filters: ReportFilters }) {
  const computed = useMemo(() => {
    if (!selected) return null;

    switch (selected) {
      case "masterlist":
        return {
          type: "masterlist" as const,
          rows: buildStudentMasterlist(filters),
        };
      case "baseline":
        return {
          type: "baseline" as const,
          rows: buildBaselineReport(filters),
        };
      case "endline":
        return {
          type: "endline" as const,
          rows: buildEndlineReport(filters),
        };
      case "attendance":
        return {
          type: "attendance" as const,
          report: buildFeedingAttendanceSummary(filters),
        };
      case "improvement":
        return {
          type: "improvement" as const,
          report: buildNutritionalImprovement(filters),
        };
      case "consolidated":
        return {
          type: "consolidated" as const,
          report: buildConsolidatedSchoolFeedingReport(filters),
        };
      default:
        return null;
    }
  }, [selected, filters]);

  if (!computed) {
    return <div className="text-sm text-muted-foreground">Select a report type to preview.</div>;
  }

  if (computed.type === "masterlist") {
    const rows = computed.rows;
    return (
      <div>
        <div className="mb-3 text-sm font-medium">Students: {rows.length}</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LRN</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead className="text-right">Beneficiary</TableHead>
              <TableHead className="text-right">Allergy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.lrn}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.grade}</TableCell>
                <TableCell>{r.section}</TableCell>
                <TableCell>{r.sex}</TableCell>
                <TableCell>{r.guardian}</TableCell>
                <TableCell className="text-right">{r.beneficiary ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">{r.allergy ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const statusBadge = (status: unknown) => {
    const key = status as keyof typeof statusColor;
    const className = statusColor[key] ?? "bg-muted text-foreground";
    return <Badge className={className}>{String(status ?? "")}</Badge>;
  };

  if (computed.type === "baseline" || computed.type === "endline") {
    const title = computed.type === "baseline" ? "Baseline" : "Endline";
    const rows: MeasurementReportRow[] = computed.rows;

    return (
      <div>
        <div className="mb-3 text-sm font-medium">
          {title} Measurements: {rows.length}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LRN</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Height</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">BMI</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.type}::${r.studentId}::${r.date}`}>
                <TableCell>{r.lrn}</TableCell>
                <TableCell>{r.studentName}</TableCell>
                <TableCell>{r.grade}</TableCell>
                <TableCell>{r.section}</TableCell>
                <TableCell>{r.sex}</TableCell>
                <TableCell>{r.recordedBy}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell className="text-right">{r.height}</TableCell>
                <TableCell className="text-right">{r.weight}</TableCell>
                <TableCell className="text-right">{r.bmi}</TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (computed.type === "attendance") {
    const report: AttendanceReport = computed.report;
    return (
      <div>
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border bg-card p-2 text-sm">
            Days in range: <span className="font-medium">{report.days.length}</span>
          </div>
          <div className="rounded-md border bg-card p-2 text-sm">
            Students: <span className="font-medium">{report.byStudent.length}</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Present</TableHead>
              <TableHead className="text-right">Absent</TableHead>
              <TableHead className="text-right">Meals Received</TableHead>
              <TableHead className="text-right">Present Rate</TableHead>
              <TableHead className="text-right">Received Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.days.map((d) => (
              <TableRow key={d.date}>
                <TableCell>{d.date}</TableCell>
                <TableCell className="text-right">{d.presentCount}</TableCell>
                <TableCell className="text-right">{d.absentCount}</TableCell>
                <TableCell className="text-right">{d.receivedMealCount}</TableCell>
                <TableCell className="text-right">{d.presentRatePct.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{d.receivedRatePct.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (computed.type === "improvement") {
    const report: NutritionalImprovementReport = computed.report;
    return (
      <div>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border bg-card p-2 text-sm">
            Students: <span className="font-medium">{report.totalStudents}</span>
          </div>
          <div className="rounded-md border bg-card p-2 text-sm">
            Improved: <span className="font-medium">{report.improvedCount}</span>
          </div>
          <div className="rounded-md border bg-card p-2 text-sm">
            Improved Rate: <span className="font-medium">{report.improvedRatePct.toFixed(1)}%</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Baseline</TableHead>
              <TableHead>Endline</TableHead>
              <TableHead className="text-right">BMI Δ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.rows.map((r) => (
              <TableRow key={r.studentId}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.grade}</TableCell>
                <TableCell>{r.section}</TableCell>
                <TableCell>{statusBadge(r.baselineStatus)}</TableCell>
                <TableCell>{statusBadge(r.endlineStatus)}</TableCell>
                <TableCell className="text-right">{r.bmiDelta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (computed.type === "consolidated") {
    const report: ConsolidatedSchoolFeedingReport = computed.report;
    return (
      <div>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border bg-card p-2 text-sm">
            Beneficiaries: <span className="font-medium">{report.totalBeneficiaries}</span>
          </div>
          <div className="rounded-md border bg-card p-2 text-sm">
            Present Rate:{" "}
            <span className="font-medium">{report.attendance.presentRatePct.toFixed(1)}%</span>
          </div>
          <div className="rounded-md border bg-card p-2 text-sm">
            Meals Received Rate:{" "}
            <span className="font-medium">
              {report.attendance.mealsReceivedRatePct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="mb-4 rounded-md border bg-card p-3">
          <div className="mb-2 text-sm font-medium">Nutritional Improvement</div>
          <div className="text-sm">
            Improved:{" "}
            <span className="font-medium">{report.nutritionalImprovement.improvedCount}</span> (
            <span className="font-medium">
              {report.nutritionalImprovement.improvedRatePct.toFixed(1)}%
            </span>
            )
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Baseline</TableHead>
              <TableHead className="text-right">Endline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.nutritionalImprovement.baseline.map((b) => {
              const e = report.nutritionalImprovement.endline.find((x) => x.status === b.status);
              return (
                <TableRow key={b.status}>
                  <TableCell>{statusBadge(b.status)}</TableCell>
                  <TableCell className="text-right">{b.count}</TableCell>
                  <TableCell className="text-right">{e?.count ?? 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return null;
}

function ReportsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: "2025-01-01",
    dateTo: "2025-04-30",
    grade: "all",
    section: "all",
  });

  const getReportData = () => {
    if (!selected) return null;

    switch (selected) {
      case "masterlist":
        return {
          type: "masterlist" as const,
          rows: buildStudentMasterlist(filters),
        };
      case "baseline":
        return {
          type: "baseline" as const,
          rows: buildBaselineReport(filters),
        };
      case "endline":
        return {
          type: "endline" as const,
          rows: buildEndlineReport(filters),
        };
      case "attendance":
        return {
          type: "attendance" as const,
          report: buildFeedingAttendanceSummary(filters),
        };
      case "improvement":
        return {
          type: "improvement" as const,
          report: buildNutritionalImprovement(filters),
        };
      case "consolidated":
        return {
          type: "consolidated" as const,
          report: buildConsolidatedSchoolFeedingReport(filters),
        };
      default:
        return null;
    }
  };

  const handlePreviewReport = () => {
    setPreviewVisible(!previewVisible);
  };

  const handleExportPDF = () => {
    const data = getReportData();
    if (!data || !selected) return;

    if (data.type === "masterlist") {
      exportMasterlistToPDF(data.rows, filters, true);
    } else if (data.type === "baseline" || data.type === "endline") {
      exportMeasurementToPDF(data.rows, data.type, filters, true);
    } else if (data.type === "attendance") {
      exportAttendanceToPDF(data.report, filters, true);
    } else if (data.type === "improvement") {
      exportImprovementToPDF(data.report, filters, true);
    } else if (data.type === "consolidated") {
      exportConsolidatedToPDF(data.report, filters, true);
    }
    toast.success("PDF exported successfully");
  };

  const handleExportExcel = () => {
    const data = getReportData();
    if (!data || !selected) return;

    if (data.type === "masterlist") {
      exportMasterlistToExcel(data.rows, filters);
    } else if (data.type === "baseline" || data.type === "endline") {
      exportMeasurementToExcel(data.rows, data.type, filters);
    } else if (data.type === "attendance") {
      exportAttendanceToExcel(data.report, filters);
    } else if (data.type === "improvement") {
      exportImprovementToExcel(data.report, filters);
    } else if (data.type === "consolidated") {
      exportConsolidatedToExcel(data.report, filters);
    }
    toast.success("Excel exported successfully");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

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
              <div className="space-y-1.5">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom ?? ""}
                  onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo ?? ""}
                  onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Grade</Label>
                <Select
                  value={filters.grade ?? "all"}
                  onValueChange={(v) =>
                    setFilters((p) => ({ ...p, grade: v as ReportFilters["grade"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select
                  value={filters.section ?? "all"}
                  onValueChange={(v) =>
                    setFilters((p) => ({ ...p, section: v as ReportFilters["section"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePreviewReport} className="gap-2">
                <Eye className="h-4 w-4" /> Preview Report
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <FileText className="h-4 w-4" /> Export PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
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

            {previewVisible ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3 printable">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Preview (Draft)
                </div>
                <ReportPreview selected={selected} filters={filters} />
              </div>
            ) : null}
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
