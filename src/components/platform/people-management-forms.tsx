"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Notice = { kind: "success" | "error"; message: string } | null;

type ApiEnvelope<T extends string, V> = {
  [key in T]?: V;
} & {
  error?: string;
  details?: string[];
};

type Teacher = {
  teacher_id?: string;
  first_name?: string;
  last_name?: string;
};

type Guardian = {
  guardian_id?: string;
  first_name?: string;
  last_name?: string;
};

type Student = {
  student_id?: string;
  first_name?: string;
  last_name?: string;
};

function splitIds(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function postJson<T extends string, V>(path: string, payload: Record<string, unknown>, key: T): Promise<V> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiEnvelope<T, V>;
  if (!response.ok || !body[key]) {
    throw new Error(body.details?.join(" ") || body.error || "Request failed");
  }
  return body[key] as V;
}

function ResultBox({ label, value, helper }: { label: string; value: string; helper: string }) {
  if (!value) return null;
  return (
    <div className="created-school-box setup-result-box">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  );
}

export function PeopleManagementForms({
  schoolId,
  defaultAcademicYearId = "",
  defaultClassId = "",
}: {
  schoolId: string;
  defaultAcademicYearId?: string;
  defaultClassId?: string;
}) {
  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [academicYearId, setAcademicYearId] = useState(defaultAcademicYearId);
  const [classId, setClassId] = useState(defaultClassId);

  async function handleTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("teacher");
    setNotice(null);
    try {
      const teacher = await postJson<"teacher", Teacher>(
        `/api/backend/schools/${schoolId}/teachers`,
        {
          first_name: String(data.get("first_name") ?? ""),
          last_name: String(data.get("last_name") ?? ""),
          teacher_number: String(data.get("teacher_number") ?? ""),
          department: String(data.get("department") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          hire_date: String(data.get("hire_date") ?? ""),
          address: String(data.get("address") ?? ""),
        },
        "teacher",
      );
      setTeacherId(teacher.teacher_id ?? "");
      setNotice({ kind: "success", message: `${teacher.first_name ?? "Teacher"} ${teacher.last_name ?? ""} created.` });
      form.reset();
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Teacher could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  async function handleGuardian(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("guardian");
    setNotice(null);
    try {
      const guardian = await postJson<"guardian", Guardian>(
        `/api/backend/schools/${schoolId}/guardians`,
        {
          first_name: String(data.get("first_name") ?? ""),
          last_name: String(data.get("last_name") ?? ""),
          relationship: String(data.get("relationship") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          address: String(data.get("address") ?? ""),
          student_ids: splitIds(data.get("student_ids")),
        },
        "guardian",
      );
      setGuardianId(guardian.guardian_id ?? "");
      setNotice({ kind: "success", message: `${guardian.first_name ?? "Guardian"} ${guardian.last_name ?? ""} created.` });
      form.reset();
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Guardian could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  async function handleStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("student");
    setNotice(null);
    try {
      const student = await postJson<"student", Student>(
        `/api/backend/schools/${schoolId}/students`,
        {
          first_name: String(data.get("first_name") ?? ""),
          last_name: String(data.get("last_name") ?? ""),
          gender: String(data.get("gender") ?? ""),
          class_id: String(data.get("class_id") ?? ""),
          academic_year_id: String(data.get("academic_year_id") ?? ""),
          date_of_birth: String(data.get("date_of_birth") ?? ""),
          enrollment_date: String(data.get("enrollment_date") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          address: String(data.get("address") ?? ""),
          guardian_ids: splitIds(data.get("guardian_ids")),
        },
        "student",
      );
      setStudentId(student.student_id ?? "");
      setNotice({ kind: "success", message: `${student.first_name ?? "Student"} ${student.last_name ?? ""} created.` });
      form.reset();
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Student could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  return (
    <div className="setup-workspace people-workspace">
      <section className="platform-panel setup-status-panel">
        <div>
          <span className="setup-kicker">Active tenant</span>
          <h2>{schoolId}</h2>
          <p>Add teachers, guardians and students as separate records. Their generated IDs will connect later modules such as assignments, attendance, grades and fees.</p>
        </div>
        <div className="setup-id-grid">
          <ResultBox label="Teacher ID" value={teacherId} helper="Used by teacher assignments and attendance." />
          <ResultBox label="Guardian ID" value={guardianId} helper="Used to link parents/guardians to students." />
          <ResultBox label="Student ID" value={studentId} helper="Used by attendance, grades, invoices and results." />
          <ResultBox label="Current class" value={classId} helper="Default class ID for new students." />
        </div>
        {notice ? <p className={`form-notice ${notice.kind}`}>{notice.message}</p> : null}
        {teacherId ? (
          <Link className="setup-next-link" href={`/platform/schools/${schoolId}/assignments?academicYearId=${encodeURIComponent(academicYearId)}&classId=${encodeURIComponent(classId)}&teacherId=${encodeURIComponent(teacherId)}`}>
            Continue to teacher assignment
          </Link>
        ) : null}
      </section>

      <div className="people-grid">
        <section className="platform-panel setup-form-card people-form-card">
          <div className="platform-panel-heading">
            <div><span>People 01</span><h2>Teacher</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleTeacher}>
            <div className="form-grid-two">
              <label><span>First name</span><input name="first_name" required placeholder="Kofi" /></label>
              <label><span>Last name</span><input name="last_name" required placeholder="Owusu" /></label>
            </div>
            <div className="form-grid-two">
              <label><span>Teacher number</span><input name="teacher_number" placeholder="T-001" /></label>
              <label><span>Department</span><input name="department" placeholder="Science" /></label>
            </div>
            <div className="form-grid-two">
              <label><span>Email</span><input name="email" type="email" placeholder="teacher@example.edu" /></label>
              <label><span>Phone</span><input name="phone" inputMode="tel" pattern="\+?[0-9]{9,15}" placeholder="+233241234567" /></label>
            </div>
            <label><span>Hire date</span><input name="hire_date" type="date" /></label>
            <label><span>Address</span><textarea name="address" rows={3} maxLength={160} placeholder="Teacher address" /></label>
            <button className="button" disabled={submitting === "teacher"}>{submitting === "teacher" ? "Creating…" : "Create teacher"}</button>
          </form>
        </section>

        <section className="platform-panel setup-form-card people-form-card">
          <div className="platform-panel-heading">
            <div><span>People 02</span><h2>Guardian</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleGuardian}>
            <div className="form-grid-two">
              <label><span>First name</span><input name="first_name" required placeholder="Esi" /></label>
              <label><span>Last name</span><input name="last_name" required placeholder="Mensah" /></label>
            </div>
            <div className="form-grid-two">
              <label><span>Relationship</span><input name="relationship" placeholder="Mother" /></label>
              <label><span>Phone</span><input name="phone" required inputMode="tel" pattern="\+?[0-9]{9,15}" placeholder="+233241234567" /></label>
            </div>
            <label><span>Email</span><input name="email" type="email" placeholder="guardian@example.com" /></label>
            <label><span>Address</span><textarea name="address" rows={3} maxLength={200} placeholder="Guardian address" /></label>
            <label><span>Student IDs, optional</span><textarea name="student_ids" rows={3} placeholder="Paste one student ID per line, or comma-separated" /></label>
            <button className="button" disabled={submitting === "guardian"}>{submitting === "guardian" ? "Creating…" : "Create guardian"}</button>
          </form>
        </section>

        <section className="platform-panel setup-form-card people-form-card people-form-card-wide">
          <div className="platform-panel-heading">
            <div><span>People 03</span><h2>Student</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleStudent}>
            <div className="form-grid-two">
              <label><span>First name</span><input name="first_name" required placeholder="Ama" /></label>
              <label><span>Last name</span><input name="last_name" required placeholder="Mensah" /></label>
            </div>
            <div className="form-grid-two">
              <label>
                <span>Gender</span>
                <select name="gender" required defaultValue="">
                  <option value="" disabled>Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </label>
              <label><span>Date of birth</span><input name="date_of_birth" type="date" /></label>
            </div>
            <div className="form-grid-two">
              <label>
                <span>Academic year ID</span>
                <input name="academic_year_id" value={academicYearId} onChange={(event) => setAcademicYearId(event.target.value)} placeholder="ayr_..." />
              </label>
              <label>
                <span>Class ID</span>
                <input name="class_id" required value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="cls_..." />
              </label>
            </div>
            <div className="form-grid-two">
              <label><span>Email</span><input name="email" type="email" placeholder="student@example.edu" /></label>
              <label><span>Phone</span><input name="phone" inputMode="tel" pattern="\+?[0-9]{9,15}" placeholder="+233241234567" /></label>
            </div>
            <label><span>Enrollment date</span><input name="enrollment_date" type="date" /></label>
            <label><span>Guardian IDs, optional</span><textarea name="guardian_ids" rows={3} placeholder={guardianId || "Paste one guardian ID per line, or comma-separated"} /></label>
            <label><span>Address</span><textarea name="address" rows={3} maxLength={160} placeholder="Student address" /></label>
            <button className="button" disabled={submitting === "student" || !classId}>{submitting === "student" ? "Creating…" : "Create student"}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
