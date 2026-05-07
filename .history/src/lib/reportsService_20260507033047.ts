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
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export function buildBaselineReport(filters: ReportFilters) {
  return buildMeasurementReport("Baseline", filters);
}

export function buildEndlineReport(filters: ReportFilters) {
  return buildMeasurementReport("Endline", filters);
}

export interface AttendanceDayRow {
  date: string;
  presentCount: number;
  absentCount: number;
  receivedMealCount: number;
  totalExpected: number;
  presentRatePct: number;
  receivedRatePct: number;
}

export interface AttendanceStudentRow {
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  lrn: string;
  presentCount: number;
  absentCount: number;
  receivedMealCount: number;
  receivedRatePct: number;
}

export interface AttendanceReport {
  days: AttendanceDayRow[];
  byStudent: AttendanceStudentRow[];
}

export function buildFeedingAttendanceSummary(filters: ReportFilters): AttendanceReport {
  const eligibleStudents = new Map<string, Student>(filterStudents(filters).map((s) => [s.id, s]));
  const fromTo: DateRange = { dateFrom: toIsoDate(filters.dateFrom), dateTo: toIsoDate(filters.dateTo) };

  const filtered = feedingRecords
    .filter((r) => inDateRange(r.date, fromTo))
    .filter((r) => eligibleStudents.has(r.studentId));

  // Collect unique days within range based on feeding records.
  const dayMap = new Map<string, { present: number; absent: number; received: number; totalExpected: number }>();
  const studentMap = new Map<string, { present: number; absent: number; received: number; totalExpected: number }>();

  // We'll compute totals expected per day as count of eligible students that have ANY record that day,
  // which matches our mock behavior.
  const eligibleStudentIds = Array.from(eligibleStudents.keys());
  const recordsByDay = new Map<string, FeedingRecord[]>();
  for (const rec of filtered) {
    const list = recordsByDay.get(rec.date) ?? [];
    list.push(rec);
    recordsByDay.set(rec.date, list);
  }

  for (const [date, recs] of recordsByDay.entries()) {
    const expectedStudentIds = new Set<string>();
    for (const r of recs) expectedStudentIds.add(r.studentId);
    const totalExpected = expectedStudentIds.size;

    let present = 0;
    let absent = 0;
    let received = 0;
    for (const r of recs) {
      if (r.present) present++;
      if (r.absent) absent++;
      if (r.receivedMeal) received++;
    }
    dayMap.set(date, { present, absent, received, totalExpected });

    for (const sid of expectedStudentIds) {
      const sStats = studentMap.get(sid) ?? { present: 0, absent: 0, received: 0, totalExpected: 0 };
      sStats.totalExpected += 1;
      studentMap.set(sid, sStats);
    }

    // Update per-student stats.
    for (const r of recs) {
      const sStats = studentMap.get(r.studentId) ?? { present: 0, absent: 0, received: 0, totalExpected: 0 };
      if (r.present) sStats.present++;
      if (r.absent) sStats.absent++;
      if (r.receivedMeal) sStats.received++;
      studentMap.set(r.studentId, sStats);
    }
  }

  const days = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, s]) => {
      const presentRatePct = s.totalExpected ? (s.present / s.totalExpected) * 100 : 0;
      const receivedRatePct = s.totalExpected ? (s.received / s.totalExpected) * 100 : 0;
      return {
        date,
        presentCount: s.present,
        absentCount: s.absent,
        receivedMealCount: s.received,
        totalExpected: s.totalExpected,
        presentRatePct,
        receivedRatePct,
      };
    });

  const byStudent = eligibleStudentIds
    .map((sid) => {
      const st = studentMap.get(sid) ?? { present: 0, absent: 0, received: 0, totalExpected: 0 };
      const student = eligibleStudents.get(sid)!;
      const receivedRatePct = st.totalExpected ? (st.received / st.totalExpected) * 100 : 0;
      return {
        studentId: sid,
        studentName: student.name,
        grade: student.grade,
        section: student.section,
        lrn: student.lrn,
        presentCount: st.present,
        absentCount: st.absent,
        receivedMealCount: st.received,
        receivedRatePct,
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

  return { days, byStudent };
}

export type StatusBucket = NutritionStatus;

export interface StatusDistribution {
  status: StatusBucket;
  count: number;
}

export interface NutritionalImprovementReport {
  totalStudents: number;
  baseline: StatusDistribution[];
  endline: StatusDistribution[];
  // students that improved from baseline status to a better category
  improvedCount: number;
  improvedRatePct: number;
  // Raw comparison table
  rows: Array<{
