import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { students as seed, grades, sections, type Student } from "@/lib/mockData";

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [
      { title: "Student Profiles — FEED System" },
      { name: "description", content: "Manage student profiles for the school feeding program." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const [list, setList] = useState<Student[]>(seed);
  const [q, setQ] = useState("");
  const [fGrade, setFGrade] = useState("all");
  const [fSection, setFSection] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);

  const filtered = list.filter(
    (s) =>
      (q === "" ||
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.id.toLowerCase().includes(q.toLowerCase())) &&
      (fGrade === "all" || s.grade === fGrade) &&
      (fSection === "all" || s.section === fSection),
  );

  return (
    <AppLayout
      title="Student Profiles"
      subtitle="Register and manage student records"
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      }
    >
      <Toaster richColors position="top-right" />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base">All Students</CardTitle>
          <div className="grid gap-2 sm:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or ID..."
                className="pl-9"
              />
            </div>
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
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Allergy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.grade}</TableCell>
                  <TableCell>{s.section}</TableCell>
                  <TableCell>{s.sex}</TableCell>
                  <TableCell>
                    {s.beneficiary ? (
                      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.allergy ? (
                      <Badge className="bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/15">
                        <AlertCircle className="mr-1 h-3 w-3" /> Yes
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(s);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(s)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No students match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StudentFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSave={(s) => {
          setList((prev) => {
            const exists = prev.find((x) => x.id === s.id);
            return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [s, ...prev];
          });
          toast.success(editing ? "Student updated successfully" : "Student added successfully");
          setOpen(false);
        }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">{confirmDelete?.name}</span> from the
              system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  setList((p) => p.filter((x) => x.id !== confirmDelete.id));
                  toast.success("Student record deleted");
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function StudentFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Student | null;
  onSave: (s: Student) => void;
}) {
  const blank: Student = {
    id: "",
    lrn: "",
    name: "",
    grade: "",
    section: "",
    sex: "Female",
    dob: "",
    guardian: "",
    beneficiary: false,
    allergy: false,
    allergyNotes: "",
    baselineBMI: 0,
    endlineBMI: 0,
    baselineStatus: "Normal",
    endlineStatus: "Normal",
  };
  const [form, setForm] = useState<Student>(editing ?? blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Sync when opening
  if (open && editing && form.id !== editing.id) setForm(editing);
  if (open && !editing && form.id !== "" && !errors.__init) {
    // reset on open new
    setForm(blank);
    setErrors({ __init: "1" });
  }
  if (!open && errors.__init) setErrors({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.id.trim()) e.id = "Student ID is required.";
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.grade) e.grade = "Grade is required.";
    if (!form.section) e.section = "Section is required.";
    if (!form.dob) e.dob = "Date of birth is required.";
    if (!form.guardian.trim()) e.guardian = "Guardian name is required.";
    if (form.allergy && !form.allergyNotes?.trim()) e.allergyNotes = "Please describe the allergy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const requiredFilled =
    form.id && form.name && form.grade && form.section && form.dob && form.guardian;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && (form.name || form.id)) {
            setConfirmDiscard(true);
            return;
          }
          onOpenChange(o);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>
              Fields marked with <span className="text-destructive">*</span> are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Identification
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldInput
                  label="Student ID"
                  required
                  value={form.id}
                  onChange={(v) => setForm({ ...form, id: v })}
                  error={errors.id}
                  placeholder="S-1009"
                />
                <FieldInput
                  label="LRN (Learner Reference No.)"
                  value={form.lrn}
                  onChange={(v) => setForm({ ...form, lrn: v })}
                  placeholder="12-digit LRN"
                  helper="Optional"
                />
              </div>
              <FieldInput
                label="Full Name"
                required
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                error={errors.name}
                placeholder="Last name, First name"
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Academic
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <FieldSelect
                  label="Grade Level"
                  required
                  value={form.grade}
                  onChange={(v) => setForm({ ...form, grade: v })}
                  options={grades}
                  error={errors.grade}
                />
                <FieldSelect
                  label="Section"
                  required
                  value={form.section}
                  onChange={(v) => setForm({ ...form, section: v })}
                  options={sections}
                  error={errors.section}
                />
                <FieldSelect
                  label="Sex"
                  required
                  value={form.sex}
                  onChange={(v) => setForm({ ...form, sex: v as "Male" | "Female" })}
                  options={["Male", "Female"]}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className={errors.dob ? "border-destructive" : ""}
                  />
                  {errors.dob && <p className="text-xs text-destructive">{errors.dob}</p>}
                </div>
                <FieldInput
                  label="Parent/Guardian Name"
                  required
                  value={form.guardian}
                  onChange={(v) => setForm({ ...form, guardian: v })}
                  error={errors.guardian}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Program & Health
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Label className="text-sm">Feeding Beneficiary</Label>
                    <p className="text-xs text-muted-foreground">Enrolled in feeding program</p>
                  </div>
                  <Switch
                    checked={form.beneficiary}
                    onCheckedChange={(v) => setForm({ ...form, beneficiary: v })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Label className="text-sm">Has Food Allergy</Label>
                    <p className="text-xs text-muted-foreground">Flag for kitchen staff</p>
                  </div>
                  <Switch
                    checked={form.allergy}
                    onCheckedChange={(v) => setForm({ ...form, allergy: v })}
                  />
                </div>
              </div>
              {form.allergy && (
                <div className="space-y-1.5">
                  <Label>
                    Allergy Notes <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={form.allergyNotes ?? ""}
                    onChange={(e) => setForm({ ...form, allergyNotes: e.target.value })}
                    placeholder="e.g. Peanuts, shellfish"
                    className={errors.allergyNotes ? "border-destructive" : ""}
                  />
                  {errors.allergyNotes && (
                    <p className="text-xs text-destructive">{errors.allergyNotes}</p>
                  )}
                </div>
              )}
            </section>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (form.name || form.id) setConfirmDiscard(true);
                else onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!requiredFilled}
              onClick={() => {
                if (!validate()) {
                  toast.error("Please fill in all required fields correctly.");
                  return;
                }
                onSave(form);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Save Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes will be lost. Are you sure you want to leave this form?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDiscard(false);
                onOpenChange(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FieldInput({
  label,
  required,
  value,
  onChange,
  error,
  placeholder,
  helper,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
function FieldSelect({
  label,
  required,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
