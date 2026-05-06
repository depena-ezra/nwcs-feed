import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Users,
  ClipboardCheck,
  TrendingDown,
  TrendingUp,
  Heart,
  CalendarCheck,
  UserPlus,
  Ruler,
  UtensilsCrossed,
  FileBarChart2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FEED System" },
      {
        name: "description",
        content:
          "Overview of the school feeding program: beneficiaries, nutritional status, and attendance.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Total Beneficiaries", value: "248", icon: Heart, tone: "bg-primary/10 text-primary" },
  { label: "Students Encoded", value: "312", icon: Users, tone: "bg-info/10 text-info" },
  {
    label: "Underweight",
    value: "42",
    icon: TrendingDown,
    tone: "bg-destructive/10 text-destructive",
  },
  { label: "Normal", value: "195", icon: ClipboardCheck, tone: "bg-success/10 text-success" },
  {
    label: "Overweight",
    value: "11",
    icon: TrendingUp,
    tone: "bg-warning/20 text-warning-foreground",
  },
  {
    label: "Attendance Rate",
    value: "94%",
    icon: CalendarCheck,
    tone: "bg-primary/10 text-primary",
  },
];

const pieData = [
  { name: "Normal", value: 195, color: "var(--success)" },
  { name: "Underweight", value: 42, color: "var(--destructive)" },
  { name: "At Risk", value: 64, color: "var(--warning)" },
  { name: "Overweight", value: 11, color: "var(--info)" },
];

const compareData = [
  { grade: "G1", baseline: 18, endline: 9 },
  { grade: "G2", baseline: 22, endline: 12 },
  { grade: "G3", baseline: 15, endline: 8 },
  { grade: "G4", baseline: 12, endline: 6 },
  { grade: "G5", baseline: 10, endline: 4 },
  { grade: "G6", baseline: 8, endline: 3 },
];

const recent = [
  {
    who: "Andrea Cruz",
    what: "Endline measurement encoded",
    when: "2 min ago",
    tone: "text-success",
  },
  {
    who: "Grade 2 — Rosal",
    what: "Daily feeding attendance saved",
    when: "18 min ago",
    tone: "text-primary",
  },
  {
    who: "Benjie Santos",
    what: "Marked At Risk after baseline",
    when: "1 hr ago",
    tone: "text-warning-foreground",
  },
  {
    who: "Hector Villanueva",
    what: "Profile updated by M. Reyes",
    when: "Yesterday",
    tone: "text-muted-foreground",
  },
];

function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Quick overview of the school feeding program">
      <Toaster richColors position="top-right" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-[var(--shadow-card)]">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${s.tone}`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-foreground leading-tight">{s.value}</div>
                <div className="truncate text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Nutritional Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Baseline vs Endline — Underweight Count</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="grade" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="baseline"
                  fill="var(--destructive)"
                  name="Baseline"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="endline" fill="var(--success)" name="Endline" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { to: "/students", label: "Add Student", icon: UserPlus },
              { to: "/measurements", label: "Encode Measurement", icon: Ruler },
              { to: "/feeding", label: "Record Attendance", icon: UtensilsCrossed },
              { to: "/reports", label: "Generate Report", icon: FileBarChart2 },
            ].map((a) => (
              <Button
                key={a.label}
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 border-primary/20 bg-primary-soft/50 py-4 hover:bg-primary/10"
              >
                <Link to={a.to}>
                  <a.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{a.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${r.tone.replace("text-", "bg-")}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{r.who}</div>
                  <div className="text-xs text-muted-foreground">{r.what}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground/70">{r.when}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
