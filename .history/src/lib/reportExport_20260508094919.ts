import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableCell, TableRow, WidthType } from "docx";

const SCHOOL_NAME = "San Isidro Elementary School";
const SCHOOL_ID = "136521";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getReportTitle(selected: string): string {
  const titles: Record<string, string> = {
    masterlist: "Student Masterlist",
    baseline: "Baseline Nutritional Status",
    endline: "Endline Nutritional Status",
    attendance: "Feeding Attendance Summary",
    improvement: "Nutritional Improvement",
    consolidated: "Consolidated School Feeding Report",
  };
  return titles[selected] || "Report";
}

function addHeader(doc: jsPDF, title: string, filters: any) {
  doc.setFontSize(20);
  doc.text(SCHOOL_NAME, 20, 20);
  doc.setFontSize(14);
  doc.text(title, 20, 30);
  doc.setFontSize(10);
  doc.text(`School ID: ${SCHOOL_ID}`, 20, 35);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);

  if (filters.dateFrom || filters.dateTo) {
    const dateRange = `Date Range: ${filters.dateFrom ? formatDate(filters.dateFrom) : "N/A"} - ${filters.dateTo ? formatDate(filters.dateTo) : "N/A"}`;
    doc.text(dateRange, 20, 45);
  }
  if (filters.grade && filters.grade !== "all") {
    doc.text(`Grade: ${filters.grade}`, 20, 50);
  }
  if (filters.section && filters.section !== "all") {
    doc.text(`Section: ${filters.section}`, 20, 55);
  }
}

export function exportMasterlistToPDF(rows: any[], filters: any, download = true) {
  const doc = new jsPDF();
  const title = getReportTitle("masterlist");
  addHeader(doc, title, filters);

  const tableData = rows.map((r) => [
    r.lrn,
    r.name,
    r.grade,
    r.section,
    r.sex,
    r.guardian,
    r.beneficiary ? "Yes" : "No",
    r.allergy ? "Yes" : "No",
  ]);

  autoTable(doc, {
    head: [["LRN", "Name", "Grade", "Section", "Sex", "Guardian", "Beneficiary", "Allergy"]],
    body: tableData,
    startY: 65,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 128, 0] },
  });

  if (download) {
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  } else {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}

export function exportMeasurementToPDF(
  rows: any[],
  type: "baseline" | "endline",
  filters: any,
  download = true,
) {
  const doc = new jsPDF("landscape");
  const title = getReportTitle(type);
  addHeader(doc, title, filters);

  const tableData = rows.map((r) => [
    r.lrn,
    r.studentName,
    r.grade,
    r.section,
    r.sex,
    r.recordedBy,
    formatDate(r.date),
    r.height,
    r.weight,
    r.bmi,
    r.status,
  ]);

  autoTable(doc, {
    head: [
      [
        "LRN",
        "Name",
        "Grade",
        "Section",
        "Sex",
        "Recorded By",
        "Date",
        "Height (cm)",
        "Weight (kg)",
        "BMI",
        "Status",
      ],
    ],
    body: tableData,
    startY: 65,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [0, 128, 0] },
  });

  if (download) {
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  } else {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}

export function exportAttendanceToPDF(report: any, filters: any, download = true) {
  const doc = new jsPDF("landscape");
  const title = getReportTitle("attendance");
  addHeader(doc, title, filters);

  doc.setFontSize(12);
  doc.text("Daily Attendance Summary", 20, 65);
  const dailyData = report.days.map((d: any) => [
    formatDate(d.date),
    d.presentCount,
    d.absentCount,
    d.receivedMealCount,
    `${d.presentRatePct.toFixed(1)}%`,
    `${d.receivedRatePct.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    head: [["Date", "Present", "Absent", "Meals Received", "Present Rate", "Received Rate"]],
    body: dailyData,
    startY: 70,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 128, 0] },
  });

  // Student summary
  if (doc.lastAutoTable.finalY < 250) {
    doc.text("Student Attendance Summary", 20, doc.lastAutoTable.finalY + 15);
    const studentData = report.byStudent.map((s: any) => [
      s.lrn,
      s.studentName,
      s.grade,
      s.section,
      s.presentCount,
      s.absentCount,
      s.receivedMealCount,
      `${s.receivedRatePct.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      head: [
        ["LRN", "Name", "Grade", "Section", "Present", "Absent", "Meals Received", "Received Rate"],
      ],
      body: studentData,
      startY: doc.lastAutoTable.finalY + 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 128, 0] },
    });
  }

  if (download) {
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  } else {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}

export function exportImprovementToPDF(report: any, filters: any, download = true) {
  const doc = new jsPDF("landscape");
  const title = getReportTitle("improvement");
  addHeader(doc, title, filters);

  doc.setFontSize(12);
  doc.text(
    `Total Students: ${report.totalStudents}, Improved: ${report.improvedCount} (${report.improvedRatePct.toFixed(1)}%)`,
    20,
    65,
  );

  const tableData = report.rows.map((r: any) => [
    r.name,
    r.grade,
    r.section,
    r.baselineStatus,
    r.endlineStatus,
    r.bmiDelta,
  ]);

  autoTable(doc, {
    head: [["Name", "Grade", "Section", "Baseline Status", "Endline Status", "BMI Δ"]],
    body: tableData,
    startY: 70,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 128, 0] },
  });

  if (download) {
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  } else {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}

export function exportConsolidatedToPDF(report: any, filters: any, download = true) {
  const doc = new jsPDF();
  const title = getReportTitle("consolidated");
  addHeader(doc, title, filters);

  doc.setFontSize(12);
  doc.text("Summary", 20, 65);
  doc.setFontSize(10);
  doc.text(`Beneficiaries: ${report.totalBeneficiaries}`, 20, 75);
  doc.text(`Attendance Present Rate: ${report.attendance.presentRatePct.toFixed(1)}%`, 20, 80);
  doc.text(`Meals Received Rate: ${report.attendance.mealsReceivedRatePct.toFixed(1)}%`, 20, 85);
  doc.text(
    `Nutritional Improvement: ${report.nutritionalImprovement.improvedCount} (${report.nutritionalImprovement.improvedRatePct.toFixed(1)}%)`,
    20,
    90,
  );

  const statusData = report.nutritionalImprovement.baseline.map((b: any) => {
    const e = report.nutritionalImprovement.endline.find((x: any) => x.status === b.status);
    return [b.status, b.count, e?.count || 0];
  });

  autoTable(doc, {
    head: [["Status", "Baseline", "Endline"]],
    body: statusData,
    startY: 100,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 128, 0] },
  });

  if (download) {
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  } else {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}

type ReportFinalMode = {
  final?: boolean;
};

function reportFileSuffix(final?: boolean) {
  return final ? "_FINAL" : "";
}

function reportOfficialLabel(final?: boolean) {
  return final ? "OFFICIAL / FINAL" : "DRAFT";
}

// DOCX exports
function buildDocxTitleBlock(args: {
  title: string;
  filters: any;
  final?: boolean;
}) {
  const { title, filters, final } = args;
  const parts: Array<string | undefined> = [
    SCHOOL_NAME,
    title,
    `Report Status: ${reportOfficialLabel(final)}`,
    filters.dateFrom || filters.dateTo
      ? `Date Range: ${filters.dateFrom ? formatDate(filters.dateFrom) : "N/A"} - ${filters.dateTo ? formatDate(filters.dateTo) : "N/A"}`
      : undefined,
    filters.grade && filters.grade !== "all" ? `Grade: ${filters.grade}` : undefined,
    filters.section && filters.section !== "all" ? `Section: ${filters.section}` : undefined,
  ];

  const rows = parts.filter(Boolean) as string[];
  return rows.map(
    (txt, idx) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: idx === 1 ? 200 : 120 },
        children: [
          new TextRun({
            text: txt,
            bold: idx === 0 || idx === 1,
            size: idx === 1 ? 28 : 22,
          }),
        ],
      }),
  );
}



function makeDocxTable(args: { headers: string[]; rows: string[][] }) {
  const { headers, rows } = args;
  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: h, bold: true })],
          }),
        ],
      }),
  );

  const tableRows = [new TableRow({ children: headerCells })];
  for (const r of rows) {
    tableRows.push(
      new TableRow({
        children: r.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph(String(cell))],
            }),
        ),
      }),
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

function downloadDocx(doc: Document, fileName: string) {
  Packer.toBlob(doc).then((blob) => {
    // Avoid dependency on file-saver if possible
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

export function exportMasterlistToWord(rows: any[], filters: any, final = false) {
  const title = getReportTitle("masterlist");
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...buildDocxTitleBlock({ title, filters, final }),
          new Paragraph({ text: " ", spacing: { after: 200 } }),
          makeDocxTable({
            headers: ["LRN", "Name", "Grade", "Section", "Sex", "Guardian", "Beneficiary", "Allergy"],
            rows: rows.map((r: any) => [
              String(r.lrn ?? ""),
              String(r.name ?? ""),
              String(r.grade ?? ""),
              String(r.section ?? ""),
              String(r.sex ?? ""),
              String(r.guardian ?? ""),
              r.beneficiary ? "Yes" : "No",
              r.allergy ? "Yes" : "No",
            ]),
          }),
        ],
      },
    ],
  });

  downloadDocx(doc, `${title.replace(/\s+/g, "_")}${reportFileSuffix(final)}.docx`);
}

export function exportMeasurementToWord(
  rows: any[],
  type: "baseline" | "endline",
  filters: any,
  final = false,
) {
  const title = getReportTitle(type);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...buildDocxTitleBlock({ title, filters, final }),
          new Paragraph({ text: " " }),
          makeDocxTable({
            headers: [
              "LRN",
              "Name",
              "Grade",
              "Section",
              "Sex",
              "Recorded By",
              "Date",
              "Height (cm)",
              "Weight (kg)",
              "BMI",
              "Status",
            ],
            rows: rows.map((r: any) => [
              String(r.lrn ?? ""),
              String(r.studentName ?? ""),
              String(r.grade ?? ""),
              String(r.section ?? ""),
              String(r.sex ?? ""),
              String(r.recordedBy ?? ""),
              r.date ? formatDate(r.date) : "",
              String(r.height ?? ""),
              String(r.weight ?? ""),
              String(r.bmi ?? ""),
              String(r.status ?? ""),
            ]),
          }),
        ],
      },
    ],
  });

  downloadDocx(doc, `${title.replace(/\s+/g, "_")}${reportFileSuffix(final)}.docx`);
}

export function exportAttendanceToWord(report: any, filters: any, final = false) {
  const title = getReportTitle("attendance");

  const dailyRows = report.days.map((d: any) => [
    formatDate(d.date),
    String(d.presentCount),
    String(d.absentCount),
    String(d.receivedMealCount),
    `${d.presentRatePct.toFixed(1)}%`,
    `${d.receivedRatePct.toFixed(1)}%`,
  ]);

  const studentRows = report.byStudent.map((s: any) => [
    String(s.lrn),
    String(s.studentName),
    String(s.grade),
    String(s.section),
    String(s.presentCount),
    String(s.absentCount),
    String(s.receivedMealCount),
    `${s.receivedRatePct.toFixed(1)}%`,
  ]);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...buildDocxTitleBlock({ title, filters, final }),
          new Paragraph({ text: "Daily Attendance Summary" }),
          makeDocxTable({
            headers: ["Date", "Present", "Absent", "Meals Received", "Present Rate", "Received Rate"],
            rows: dailyRows,
          }),
          new Paragraph({ text: "Student Attendance Summary" }),
          makeDocxTable({
            headers: ["LRN", "Name", "Grade", "Section", "Present", "Absent", "Meals Received", "Received Rate"],
            rows: studentRows,
          }),
        ],
      },
    ],
  });

  downloadDocx(doc, `${title.replace(/\s+/g, "_")}${reportFileSuffix(final)}.docx`);
}

export function exportImprovementToWord(report: any, filters: any, final = false) {
  const title = getReportTitle("improvement");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...buildDocxTitleBlock({ title, filters, final }),
          new Paragraph({
            text: `Total Students: ${report.totalStudents}  |  Improved: ${report.improvedCount} (${report.improvedRatePct.toFixed(1)}%)`,
          }),
          makeDocxTable({
            headers: ["Name", "Grade", "Section", "Baseline Status", "Endline Status", "BMI Δ"],
            rows: report.rows.map((r: any) => [
              String(r.name ?? ""),
              String(r.grade ?? ""),
              String(r.section ?? ""),
              String(r.baselineStatus ?? ""),
              String(r.endlineStatus ?? ""),
              String(r.bmiDelta ?? ""),
            ]),
          }),
        ],
      },
    ],
  });

  downloadDocx(doc, `${title.replace(/\s+/g, "_")}${reportFileSuffix(final)}.docx`);
}

export function exportConsolidatedToWord(report: any, filters: any, final = false) {
  const title = getReportTitle("consolidated");

  const statusRows = report.nutritionalImprovement.baseline.map((b: any) => {
    const e = report.nutritionalImprovement.endline.find((x: any) => x.status === b.status);
    return [String(b.status), String(b.count), String(e?.count ?? 0)];
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...buildDocxTitleBlock({ title, filters, final }),
          new Paragraph({ text: "Summary" }),
          new Paragraph({ text: `Beneficiaries: ${report.totalBeneficiaries}` }),
          new Paragraph({ text: `Attendance Present Rate: ${report.attendance.presentRatePct.toFixed(1)}%` }),
          new Paragraph({ text: `Meals Received Rate: ${report.attendance.mealsReceivedRatePct.toFixed(1)}%` }),
          new Paragraph({
            text: `Nutritional Improvement: ${report.nutritionalImprovement.improvedCount} (${report.nutritionalImprovement.improvedRatePct.toFixed(1)}%)`,
          }),
          new Paragraph({ text: "" }),
          makeDocxTable({
            headers: ["Status", "Baseline", "Endline"],
            rows: statusRows,
          }),
        ],
      },
    ],
  });

  downloadDocx(doc, `${title.replace(/\s+/g, "_")}${reportFileSuffix(final)}.docx`);
}

// Excel exports
export function exportMasterlistToExcel(rows: any[], filters: any) {
  const title = getReportTitle("masterlist");
  const data = rows.map((r) => ({
    LRN: r.lrn,
    Name: r.name,
    Grade: r.grade,
    Section: r.section,
    Sex: r.sex,
    Guardian: r.guardian,
    Beneficiary: r.beneficiary ? "Yes" : "No",
    Allergy: r.allergy ? "Yes" : "No",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Masterlist");
  XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
}

export function exportMeasurementToExcel(rows: any[], type: "baseline" | "endline", filters: any) {
  const title = getReportTitle(type);
  const data = rows.map((r) => ({
    LRN: r.lrn,
    Name: r.studentName,
    Grade: r.grade,
    Section: r.section,
    Sex: r.sex,
    "Recorded By": r.recordedBy,
    Date: formatDate(r.date),
    Height: r.height,
    Weight: r.weight,
    BMI: r.bmi,
    Status: r.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));
  XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
}

export function exportAttendanceToExcel(report: any, filters: any) {
  const title = getReportTitle("attendance");
  const wb = XLSX.utils.book_new();

  // Daily summary
  const dailyData = report.days.map((d: any) => ({
    Date: formatDate(d.date),
    Present: d.presentCount,
    Absent: d.absentCount,
    "Meals Received": d.receivedMealCount,
    "Present Rate": `${d.presentRatePct.toFixed(1)}%`,
    "Received Rate": `${d.receivedRatePct.toFixed(1)}%`,
  }));
  const ws1 = XLSX.utils.json_to_sheet(dailyData);
  XLSX.utils.book_append_sheet(wb, ws1, "Daily Attendance");

  // Student summary
  const studentData = report.byStudent.map((s: any) => ({
    LRN: s.lrn,
    Name: s.studentName,
    Grade: s.grade,
    Section: s.section,
    Present: s.presentCount,
    Absent: s.absentCount,
    "Meals Received": s.receivedMealCount,
    "Received Rate": `${s.receivedRatePct.toFixed(1)}%`,
  }));
  const ws2 = XLSX.utils.json_to_sheet(studentData);
  XLSX.utils.book_append_sheet(wb, ws2, "Student Attendance");

  XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
}

export function exportImprovementToExcel(report: any, filters: any) {
  const title = getReportTitle("improvement");
  const data = report.rows.map((r: any) => ({
    Name: r.name,
    Grade: r.grade,
    Section: r.section,
    "Baseline Status": r.baselineStatus,
    "Endline Status": r.endlineStatus,
    "BMI Δ": r.bmiDelta,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Improvement");
  XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
}

export function exportConsolidatedToExcel(report: any, filters: any) {
  const title = getReportTitle("consolidated");
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    { Metric: "Beneficiaries", Value: report.totalBeneficiaries },
    { Metric: "Attendance Present Rate", Value: `${report.attendance.presentRatePct.toFixed(1)}%` },
    {
      Metric: "Meals Received Rate",
      Value: `${report.attendance.mealsReceivedRatePct.toFixed(1)}%`,
    },
    {
      Metric: "Nutritional Improvement",
      Value: `${report.nutritionalImprovement.improvedCount} (${report.nutritionalImprovement.improvedRatePct.toFixed(1)}%)`,
    },
  ];
  const ws1 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  // Status distribution
  const statusData = report.nutritionalImprovement.baseline.map((b: any) => {
    const e = report.nutritionalImprovement.endline.find((x: any) => x.status === b.status);
    return {
      Status: b.status,
      Baseline: b.count,
      Endline: e?.count || 0,
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(statusData);
  XLSX.utils.book_append_sheet(wb, ws2, "Status Distribution");

  XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
}
