import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Save, Send, RotateCcw, Users } from "lucide-react";
import { students, grades, sections } from "@/lib/mockData";

export const Route = createFileRoute("/feeding")({
  head: () => ({
    meta: [
      { title: "Feeding Monitoring — FEED System" },
      { name: "description", content: "Daily feeding attendance and meal distribution monitoring." },
    ],
  }),
  component: FeedingPage,
});

interface Row {
  id: string; name: string; present: boolean; absent: boolean; received: boolean; notes: string;
}

function FeedingPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [grade, setGrade] = useState("Grade 1");
  const [section, setSection] = useState("Sampaguita");
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState(false);

  const load = () => {
    const filtered = students.filter((s) => s.grade === grade && s.section === section);
    if (filtered.length === 0) {
      toast.warning("No students found for this grade and section.");
      setRows([]);
      return;
    }
    setRows(filtered.map((s) => ({ id: s.id, name: s.name, present: true, absent: false, received: true, notes: "" })));
    setDirty(false);
    toast.success(`Loaded ${filtered.length} students`);
  };

  const update = (id: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDirty(true);
  };

  const save = () => { toast.success("Monitoring saved as draft"); setDirty(false); };
  const submit = () => {
    toast.success(`Daily record for ${grade} ${section} submitted successfully`);
    setDirty(false);
  };
  const reset = () => {
    if (dirty && !confirm("You have unsaved changes. Reset anyway?")) return;
    setRows([]); setDirty(false);
  };

  const presentCount = rows.filter((r) => r.present).length;
  const absentCount = rows.filter((r) => r.absent).length;
  const receivedCount = rows.filter((r) => r.received).length;

  return (
    <AppLayout title="Feeding Monitoring" subtitle="Record daily attendance and meal distribution">
      <Toaster richColors position="top-right" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Load Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[180px_180px_180px_auto]">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Grade Level</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={load} className="w-full gap-2"><Users className="h-4 w-4" /> Load Students</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Present" value={presentCount} tone="text-success" bg="bg-success/10" />
            <Stat label="Absent" value={absentCount} tone="text-destructive" bg="bg-destructive/10" />
            <Stat label="Meals Distributed" value={receivedCount} tone="text-primary" bg="bg-primary/10" />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Attendance & Meal Distribution — {date}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Food Received</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{r.id}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox className="h-5 w-5" checked={r.present} onCheckedChange={(v) => update(r.id, { present: !!v, absent: v ? false : r.absent })} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox className="h-5 w-5" checked={r.absent} onCheckedChange={(v) => update(r.id, { absent: !!v, present: v ? false : r.present, received: v ? false : r.received })} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox className="h-5 w-5" checked={r.received} onCheckedChange={(v) => update(r.id, { received: !!v })} disabled={r.absent} />
                      </TableCell>
                      <TableCell>
                        <Input value={r.notes} onChange={(e) => update(r.id, { notes: e.target.value })} placeholder="Optional note" className="h-8 text-xs" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {dirty && <Badge className="bg-warning/20 text-warning-foreground border-warning/40">Unsaved changes</Badge>}
              <span>{rows.length} students loaded</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
              <Button variant="outline" onClick={save} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
              <Button onClick={submit} className="gap-2"><Send className="h-4 w-4" /> Submit Daily Record</Button>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

function Stat({ label, value, tone, bg }: { label: string; value: number; tone: string; bg: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`text-2xl font-bold ${tone}`}>{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg ${bg}`} />
      </CardContent>
    </Card>
  );
}
