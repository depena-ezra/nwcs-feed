export type NutritionStatus = "Normal" | "Underweight" | "Overweight" | "At Risk";

export interface Student {
  id: string;
  lrn: string;
  name: string;
  grade: string;
  section: string;
  sex: "Male" | "Female";
  dob: string;
  guardian: string;
  beneficiary: boolean;
  allergy: boolean;
  allergyNotes?: string;
  baselineBMI: number;
  endlineBMI: number;
  baselineStatus: NutritionStatus;
  endlineStatus: NutritionStatus;
}

export const students: Student[] = [
  { id: "S-1001", lrn: "136521090001", name: "Andrea Cruz", grade: "Grade 1", section: "Sampaguita", sex: "Female", dob: "2017-03-12", guardian: "Liza Cruz", beneficiary: true, allergy: false, baselineBMI: 13.2, endlineBMI: 14.6, baselineStatus: "Underweight", endlineStatus: "Normal" },
  { id: "S-1002", lrn: "136521090002", name: "Benjie Santos", grade: "Grade 2", section: "Rosal", sex: "Male", dob: "2016-07-22", guardian: "Mario Santos", beneficiary: true, allergy: true, allergyNotes: "Peanuts", baselineBMI: 12.8, endlineBMI: 13.4, baselineStatus: "Underweight", endlineStatus: "Underweight" },
  { id: "S-1003", lrn: "136521090003", name: "Camille Dela Rosa", grade: "Grade 3", section: "Ilang-Ilang", sex: "Female", dob: "2015-11-04", guardian: "Rosa Dela Rosa", beneficiary: true, allergy: false, baselineBMI: 16.8, endlineBMI: 17.1, baselineStatus: "Normal", endlineStatus: "Normal" },
  { id: "S-1004", lrn: "136521090004", name: "Daniel Reyes", grade: "Grade 1", section: "Sampaguita", sex: "Male", dob: "2017-01-18", guardian: "Anna Reyes", beneficiary: false, allergy: false, baselineBMI: 19.5, endlineBMI: 19.2, baselineStatus: "Overweight", endlineStatus: "Normal" },
  { id: "S-1005", lrn: "136521090005", name: "Elaine Mendoza", grade: "Grade 4", section: "Orchid", sex: "Female", dob: "2014-05-30", guardian: "Joel Mendoza", beneficiary: true, allergy: false, baselineBMI: 14.1, endlineBMI: 15.2, baselineStatus: "At Risk", endlineStatus: "Normal" },
  { id: "S-1006", lrn: "136521090006", name: "Francisco Lim", grade: "Grade 2", section: "Rosal", sex: "Male", dob: "2016-09-09", guardian: "Marisol Lim", beneficiary: true, allergy: false, baselineBMI: 13.9, endlineBMI: 14.8, baselineStatus: "At Risk", endlineStatus: "Normal" },
  { id: "S-1007", lrn: "136521090007", name: "Gianna Tan", grade: "Grade 5", section: "Camia", sex: "Female", dob: "2013-12-12", guardian: "Erik Tan", beneficiary: true, allergy: true, allergyNotes: "Seafood", baselineBMI: 15.2, endlineBMI: 16.0, baselineStatus: "Normal", endlineStatus: "Normal" },
  { id: "S-1008", lrn: "136521090008", name: "Hector Villanueva", grade: "Grade 3", section: "Ilang-Ilang", sex: "Male", dob: "2015-04-25", guardian: "Patricia V.", beneficiary: true, allergy: false, baselineBMI: 12.4, endlineBMI: 13.6, baselineStatus: "Underweight", endlineStatus: "At Risk" },
];

export const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
export const sections = ["Sampaguita", "Rosal", "Ilang-Ilang", "Orchid", "Camia", "Daisy"];

export const statusColor: Record<NutritionStatus, string> = {
  Normal: "bg-success/15 text-success border-success/30",
  Underweight: "bg-destructive/15 text-destructive border-destructive/30",
  Overweight: "bg-warning/20 text-warning-foreground border-warning/40",
  "At Risk": "bg-warning/15 text-warning-foreground border-warning/40",
};

export function computeBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const m = heightCm / 100;
  return +(weightKg / (m * m)).toFixed(2);
}

export function classifyBMI(bmi: number): NutritionStatus {
  if (bmi < 13) return "Underweight";
  if (bmi < 14.5) return "At Risk";
  if (bmi <= 18) return "Normal";
  return "Overweight";
}
