import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Calculator, Save, RotateCcw } from "lucide-react";
import { students, computeBMI, classifyBMI, statusColor } from "@/lib/mockData";

export const Route = createFileRoute("/measurements")({
  head: () => ({
    meta: [
      { title: "Measurements — FEED System" },
      { name: "description", content: "Encode baseline and endline measurements with auto-computed BMI and nutritional status." },
    ],
  }),
  component: MeasurementsPage,
});

interface Record {
  date: string; type: string; height: number; weight: number; bmi: number; status: string;
}

const seedHistory: Record<string, Record[]> = {
  "S-1001": [
    { date: "2025-01-12", type: "Baseline", height: 110, weight: 16.0, bmi: 13.22, status: "Underweight" },
    { date: "2025-04-20", type: "Endline", height: 113, weight: 18.6, bmi: 14.57, status: "Normal" },
  ],
};

function MeasurementsPage() {
  const [studentId, setStudentId] = useState<string>("");
  const [type, setType] = useState<"Baseline" | "Endline">("Baseline");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState(seedHistory);

  const student = students.find((s) => s.id === studentId);
  const h = parseFloat(height);
  const w = parseFloat(weight);
  const bmi = useMemo(() => computeBMI(h, w), [h, w]);
  const status = bmi > 0 ? classifyBMI(bmi) : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!studentId) e.student = "Please select a student first.";
    if (!height) e.height = "Height is required.";
    else if (h <= 0 || h > 250) e.height = "Height must be between 1 and 250 cm.";
    if (!weight) e.weight = "Weight is required.";
    else if (w <= 0 || w > 200) e.weight = "Weight value is invalid.";
    if (!date) e.date = "Date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => { setHeight(""); setWeight(""); setErrors({}); };

  const save = () => {
    if (!validate()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    const existing = history[studentId] ?? [];
    if (existing.some((r) => r.type === type)) {
      toast.warning(`A ${type} record already exists for this student. Saving will create a duplicate.`);
    }
    const rec: Record = { date, type, height: h, weight: w, bmi, status: status! };
    setHistory({ ...history, [studentId]: [rec, ...existing] });
    toast.success("Measurement record saved successfully");
    reset();
  };

  const formComplete = studentId && height && weight && date;
  const studentHistory = studentId ? history[studentId] ?? [] : [];

  return (
    <AppLayout title="Measurements" subtitle="Encode baseline and endline measurements">
      <Toaster richColors position="top-right" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Encode New Measurement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Student <span className="text-destructive">*</span></Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger className={errors.student ? "border-destructive" : ""}>
                    <SelectValue placeholder="Search and select student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — {s.grade} {s.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.student && <p className="text-xs text-destructive">{errors.student}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Measurement Type <span className="text-destructive">*</span></Label>
                <Select value={type} onValueChange={(v) => setType(v as "Baseline" | "Endline")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baseline">Baseline</SelectItem>
                    <SelectItem value="Endline">Endline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {student && (
              <div className="grid gap-3 rounded-lg border border-primary/20 bg-primary-soft/40 p-3 sm:grid-cols-3">
                <Info label="Grade" value={student.grade} />
                <Info label="Section" value={student.section} />
                <Info label="Sex" value={student.sex} />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Height (cm) <span className="text-destructive">*</span></Label>
                <Input type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)}
                  className={errors.height ? "border-destructive" : ""} placeholder="e.g. 110" />
                {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Weight (kg) <span className="text-destructive">*</span></Label>
                <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className={errors.weight ? "border-destructive" : ""} placeholder="e.g. 18.5" />
                {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date Recorded <span className="text-destructive">*</span></Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={errors.date ? "border-destructive" : ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Recorded By</Label>
              <Input value="Maria Reyes (Coordinator)" readOnly className="bg-muted" />
            </div>

            <div className="rounded-xl border border-border bg-gradient-to-br from-primary-soft/60 to-accent/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Calculator className="h-4 w-4 text-primary" /> Auto-computed Result
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] text-muted-foreground">BMI</div>
                  <div className="text-2xl font-bold text-foreground">{bmi > 0 ? bmi : "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Nutritional Status</div>
                  <div>
                    {status ? (
                      <Badge className={`mt-1 border ${statusColor[status]} hover:opacity-100`}>{status}</Badge>
                    ) : <span className="text-sm text-muted-foreground">—</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Interpretation</div>
                  <div className="text-xs text-foreground">
                    {status === "Normal" ? "Within healthy range." :
                      status === "Underweight" ? "Requires immediate intervention." :
                      status === "At Risk" ? "Monitor closely; nutritional support recommended." :
                      status === "Overweight" ? "Dietary counseling recommended." : "Enter measurements to see result."}
                  </div>
                </div>
              </div>
            </div>

            {(h > 0 && (h < 60 || h > 200)) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unusual height value</AlertTitle>
                <AlertDescription>The height seems outside the typical range for elementary students. Please double-check.</AlertDescription>
              </Alert>
            )}

            <div className="sticky bottom-0 -mx-6 flex flex-wrap gap-2 border-t border-border bg-card/95 px-6 py-3 backdrop-blur">
              <Button onClick={save} disabled={!formComplete} className="gap-2">
                <Save className="h-4 w-4" /> Save Record
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Tip icon={<CheckCircle2 className="h-4 w-4 text-success" />} text="Select a student before encoding height and weight." />
            <Tip icon={<CheckCircle2 className="h-4 w-4 text-success" />} text="BMI and status are auto-computed as you type." />
            <Tip icon={<AlertCircle className="h-4 w-4 text-warning-foreground" />} text="Review the result before saving — duplicate entries will warn you." />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Measurement History {student && <span className="text-muted-foreground font-normal">— {student.name}</span>}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Height (cm)</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    {studentId ? "No previous measurements for this student." : "Select a student to view their measurement history."}
                  </TableCell>
                </TableRow>
              ) : studentHistory.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.height}</TableCell>
                  <TableCell>{r.weight}</TableCell>
                  <TableCell className="font-semibold">{r.bmi}</TableCell>
                  <TableCell>
                    <Badge className={`border ${statusColor[r.status as keyof typeof statusColor]}`}>{r.status}</Badge>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
function Tip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-2"><div className="mt-0.5">{icon}</div><span className="text-xs text-muted-foreground">{text}</span></div>;
}
