import { feedingRecords, measurementRecords, sections, students, type Student, type NutritionStatus, type MeasurementRecord, type FeedingRecord, grades, statusColor } from "@/lib/mockData";

export type Grade = (typeof grades)[number];
export type Section = (typeof sections)[number];

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  grade?: Grade | "all";
  section?: Section | "all";
}

export type DateRange = {
  dateFrom?: string;
  dateTo?: string;
};

function toIsoDate(d: string | undefined): string | undefined {
  if (!d) return undefined;
  // Accept `YYYY-MM-DD` from inputs; keep as-is.
  return d;
}

function inDateRange(date: string, { dateFrom, dateTo }: DateRange) {
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return true;
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!Number.isNaN(from.getTime()) && dt < from) return false;
  }
  if (dateTo) {
    const to = new Date(dateTo);
    if (!Number.isNaN(to.getTime()) && dt > to) return false;
  }
  return true;
}

function studentMatches(student: Student, filters: ReportFilters) {
  const gradeOk = !filters.grade || filters.grade === "all" || student.grade === filters.grade;
  const sectionOk = !filters.section || filters.section === "all" || student.section === filters.section;
  return gradeOk && sectionOk;
}

function filterStudents(filters: ReportFilters) {
  return students.filter((s) => studentMatches(s, filters));
}

export interface StudentMasterlistRow {
  id: string;
  lrn: string;
  name: string;
  grade: string;
  section: string;
  sex: Student["sex"];
  guardian: string;
  beneficiary: boolean;
  allergy: boolean;
  allergyNotes?: string;
}

export function buildStudentMasterlist(filters: ReportFilters): StudentMasterlistRow[] {
  return filterStudents(filters).map((s) => ({
    id: s.id,
    lrn: s.lrn,
    name: s.name,
    grade: s.grade,
    section: s.section,
    sex: s.sex,
    guardian: s.guardian,
    beneficiary: s.beneficiary,
    allergy: s.allergy,
    allergyNotes: s.allergyNotes,
  }));
}

export interface MeasurementReportRow {
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  lrn: string;
  sex: Student["sex"];
  recordedBy: string;
  date: string;
  height: number;
  weight: number;
  bmi: number;
  status: NutritionStatus;
  type: "Baseline" | "Endline";
  notes?: string;
}

function joinMeasurementRow(rec: MeasurementRecord, student: Student, type: "Baseline" | "Endline"): MeasurementReportRow {
  return {
    studentId: student.id,
    studentName: student.name,
    grade: student.grade,
    section: student.section,
    lrn: student.lrn,
    sex: student.sex,
    recordedBy: rec.recordedBy,
    date: rec.date,
    height: rec.height,
    weight: rec.weight,
    bmi: rec.bmi,
    status: rec.status,
    type,
    notes: rec.notes,
  };
}

function buildMeasurementReport(type: "Baseline" | "Endline", filters: ReportFilters): MeasurementReportRow[] {
  const eligibleStudents = new Map<string, Student>(filterStudents(filters).map((s) => [s.id, s]));

  const fromTo: DateRange = { dateFrom: toIsoDate(filters.dateFrom), dateTo: toIsoDate(filters.dateTo) };

  return measurementRecords
    .filter((r) => r.type === type)
    .filter((r) => inDateRange(r.date, fromTo))
    .filter((r) => eligibleStudents.has(r.studentId))
    .map((rec) => joinMeasurementRow(rec, eligibleStudents.get(rec.studentId)!, type))
