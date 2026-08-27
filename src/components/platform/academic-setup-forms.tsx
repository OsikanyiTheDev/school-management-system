"use client";

import { FormEvent, useState } from "react";

type Notice = { kind: "success" | "error"; message: string } | null;

type ApiEnvelope<T extends string, V> = {
  [key in T]?: V;
} & {
  error?: string;
  details?: string[];
};

type AcademicYear = {
  academic_year_id?: string;
  label?: string;
  status?: string;
};

type Term = {
  term_id?: string;
  academic_year_id?: string;
  name?: string;
  status?: string;
};

type ClassRecord = {
  class_id?: string;
  academic_year_id?: string;
  name?: string;
  level?: string;
  status?: string;
};

type Subject = {
  subject_id?: string;
  name?: string;
  code?: string;
  department?: string;
  status?: string;
};

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

export function AcademicSetupForms({ schoolId }: { schoolId: string }) {
  const [notice, setNotice] = useState<Notice>(null);
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [submitting, setSubmitting] = useState("");

  async function handleAcademicYear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("academic-year");
    setNotice(null);
    try {
      const academicYear = await postJson<"academic_year", AcademicYear>(
        `/api/backend/schools/${schoolId}/academic-years`,
        { label: String(data.get("label") ?? "") },
        "academic_year",
      );
      setAcademicYearId(academicYear.academic_year_id ?? "");
      setNotice({ kind: "success", message: `Academic year ${academicYear.label ?? ""} created.` });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Academic year could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  async function handleTerm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("term");
    setNotice(null);
    try {
      const term = await postJson<"term", Term>(
        `/api/backend/schools/${schoolId}/terms`,
        {
          academic_year_id: String(data.get("academic_year_id") ?? ""),
          name: String(data.get("name") ?? ""),
          starts_on: String(data.get("starts_on") ?? ""),
          ends_on: String(data.get("ends_on") ?? ""),
        },
        "term",
      );
      setTermId(term.term_id ?? "");
      setNotice({ kind: "success", message: `${term.name ?? "Term"} created.` });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Term could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  async function handleClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("class");
    setNotice(null);
    try {
      const classRecord = await postJson<"class", ClassRecord>(
        `/api/backend/schools/${schoolId}/classes`,
        {
          academic_year_id: String(data.get("academic_year_id") ?? ""),
          name: String(data.get("name") ?? ""),
          level: String(data.get("level") ?? ""),
        },
        "class",
      );
      setClassId(classRecord.class_id ?? "");
      setNotice({ kind: "success", message: `${classRecord.name ?? "Class"} created.` });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Class could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  async function handleSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting("subject");
    setNotice(null);
    try {
      const subject = await postJson<"subject", Subject>(
        `/api/backend/schools/${schoolId}/subjects`,
        {
          name: String(data.get("name") ?? ""),
          code: String(data.get("code") ?? ""),
          department: String(data.get("department") ?? ""),
        },
        "subject",
      );
      setSubjectId(subject.subject_id ?? "");
      setNotice({ kind: "success", message: `${subject.name ?? "Subject"} created.` });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Subject could not be created" });
    } finally {
      setSubmitting("");
    }
  }

  return (
    <div className="setup-workspace">
      <section className="platform-panel setup-status-panel">
        <div>
          <span className="setup-kicker">Active tenant</span>
          <h2>{schoolId}</h2>
          <p>Create setup records in this order so later modules can reuse the generated IDs.</p>
        </div>
        <div className="setup-id-grid">
          <ResultBox label="Academic year ID" value={academicYearId} helper="Used by terms and classes." />
          <ResultBox label="Term ID" value={termId} helper="Used by attendance, grading and exams." />
          <ResultBox label="Class ID" value={classId} helper="Used by students and teacher assignments." />
          <ResultBox label="Subject ID" value={subjectId} helper="Used by assignments, exams and grades." />
        </div>
        {notice ? <p className={`form-notice ${notice.kind}`}>{notice.message}</p> : null}
      </section>

      <div className="setup-grid">
        <section className="platform-panel setup-form-card">
          <div className="platform-panel-heading">
            <div><span>Step 01</span><h2>Academic year</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleAcademicYear}>
            <label>
              <span>Academic year label</span>
              <input name="label" required pattern="20[0-9]{2}/20[0-9]{2}" placeholder="2026/2027" defaultValue="2026/2027" />
            </label>
            <button className="button" disabled={submitting === "academic-year"}>{submitting === "academic-year" ? "Creating…" : "Create academic year"}</button>
          </form>
        </section>

        <section className="platform-panel setup-form-card">
          <div className="platform-panel-heading">
            <div><span>Step 02</span><h2>Term</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleTerm}>
            <label>
              <span>Academic year ID</span>
              <input name="academic_year_id" required value={academicYearId} onChange={(event) => setAcademicYearId(event.target.value)} placeholder="ayr_..." />
            </label>
            <div className="form-grid-two">
              <label><span>Term name</span><input name="name" required defaultValue="Term 1" /></label>
              <label><span>Starts on</span><input name="starts_on" type="date" /></label>
            </div>
            <label><span>Ends on</span><input name="ends_on" type="date" /></label>
            <button className="button" disabled={submitting === "term" || !academicYearId}>{submitting === "term" ? "Creating…" : "Create term"}</button>
          </form>
        </section>

        <section className="platform-panel setup-form-card">
          <div className="platform-panel-heading">
            <div><span>Step 03</span><h2>Class</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleClass}>
            <label>
              <span>Academic year ID</span>
              <input name="academic_year_id" required value={academicYearId} onChange={(event) => setAcademicYearId(event.target.value)} placeholder="ayr_..." />
            </label>
            <div className="form-grid-two">
              <label><span>Class name</span><input name="name" required defaultValue="JHS 2A" /></label>
              <label><span>Level</span><input name="level" defaultValue="JHS 2" /></label>
            </div>
            <button className="button" disabled={submitting === "class" || !academicYearId}>{submitting === "class" ? "Creating…" : "Create class"}</button>
          </form>
        </section>

        <section className="platform-panel setup-form-card">
          <div className="platform-panel-heading">
            <div><span>Step 04</span><h2>Subject</h2></div>
          </div>
          <form className="platform-form" onSubmit={handleSubject}>
            <div className="form-grid-two">
              <label><span>Subject name</span><input name="name" required defaultValue="Mathematics" /></label>
              <label><span>Subject code</span><input name="code" defaultValue="MATH" /></label>
            </div>
            <label><span>Department</span><input name="department" defaultValue="Core" /></label>
            <button className="button" disabled={submitting === "subject"}>{submitting === "subject" ? "Creating…" : "Create subject"}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
