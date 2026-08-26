export type RoleKey = "admin" | "teacher" | "student" | "parent" | "finance";

export const roles = [
  {
    key: "admin" as const,
    label: "School Administrator",
    summary: "Owns school setup, users, academics, finance visibility and operational settings.",
    metrics: ["Students", "Teachers", "Attendance", "Fees", "Reports"],
  },
  {
    key: "teacher" as const,
    label: "Teacher",
    summary: "Works only with assigned classes and subjects: attendance, grades, exams and reports.",
    metrics: ["My classes", "Attendance", "Grades", "Exams"],
  },
  {
    key: "student" as const,
    label: "Student",
    summary: "Views profile, attendance, grades, results, timetable, announcements and fee status.",
    metrics: ["Profile", "Grades", "Attendance", "Fees"],
  },
  {
    key: "parent" as const,
    label: "Parent / Guardian",
    summary: "Tracks multiple children, attendance, grades, results, invoices, payments and receipts.",
    metrics: ["Children", "Results", "Balances", "Receipts"],
  },
  {
    key: "finance" as const,
    label: "Finance Officer",
    summary: "Manages fee structures, invoices, payments, outstanding balances and receipts.",
    metrics: ["Invoices", "Payments", "Balances", "Reports"],
  },
];

export const foundationModules = [
  {
    label: "School setup",
    description: "Schools, academic years, terms, classes, subjects and teacher assignments.",
    status: "Phase 1",
  },
  {
    label: "People management",
    description: "Students, parents/guardians, teachers, finance officers and school administrators.",
    status: "Phase 1",
  },
  {
    label: "Academics",
    description: "Attendance, continuous assessment, examinations, grading rules and result publication.",
    status: "Phase 2",
  },
  {
    label: "Finance",
    description: "Fee structures, invoices, payments, balances, receipts and payment history.",
    status: "Phase 3",
  },
  {
    label: "Dashboards",
    description: "Role-specific analytics for administrators, teachers, parents, students and finance teams.",
    status: "Phase 4",
  },
  {
    label: "Production SaaS",
    description: "Notifications, audit logs, documents, reports and multi-school onboarding.",
    status: "Phase 5+",
  },
];

export const architectureFlow = ["Vercel", "API Gateway", "Lambda", "DynamoDB", "Cognito", "S3"];

export const dashboardStats = [
  { label: "Tenant model", value: "Multi-school", detail: "Every entity carries school ownership." },
  { label: "Primary roles", value: "5", detail: "Admin, Teacher, Student, Parent, Finance." },
  { label: "Core modules", value: "6", detail: "Setup, people, academics, finance, dashboards, SaaS." },
  { label: "Deployment split", value: "2 paths", detail: "Vercel from GitHub; AWS from local Terraform." },
];
