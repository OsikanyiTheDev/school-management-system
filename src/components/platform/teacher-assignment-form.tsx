"use client";

import { FormEvent, useState } from "react";

type Notice = { kind: "success" | "error"; message: string } | null;

type TeacherAssignment = {
  assignment_id?: string;
  teacher_id?: string;
  class_id?: string;
  subject_id?: string;
  term_id?: string;
};

type ResponseBody = {
  teacher_assignment?: TeacherAssignment;
  error?: string;
  details?: string[];
};

export function TeacherAssignmentForm({
  schoolId,
  defaults,
}: {
  schoolId: string;
  defaults: {
    academicYearId?: string;
    termId?: string;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
  };
}) {
  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [assignmentId, setAssignmentId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setNotice(null);
    setAssignmentId("");

    const payload = {
      academic_year_id: String(data.get("academic_year_id") ?? ""),
      term_id: String(data.get("term_id") ?? ""),
      class_id: String(data.get("class_id") ?? ""),
      subject_id: String(data.get("subject_id") ?? ""),
      teacher_id: String(data.get("teacher_id") ?? ""),
      note: String(data.get("note") ?? ""),
    };

    try {
      const response = await fetch(`/api/backend/schools/${schoolId}/teacher-assignments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as ResponseBody;
      if (!response.ok || !body.teacher_assignment) {
        throw new Error(body.details?.join(" ") || body.error || "Teacher assignment could not be created");
      }
      setAssignmentId(body.teacher_assignment.assignment_id ?? "");
      setNotice({ kind: "success", message: "Teacher assignment created successfully." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Teacher assignment could not be created" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="platform-form assignment-form" onSubmit={submit}>
      <div className="form-grid-two">
        <label>
          <span>Academic year ID</span>
          <input name="academic_year_id" required defaultValue={defaults.academicYearId} placeholder="ayr_..." />
        </label>
        <label>
          <span>Term ID</span>
          <input name="term_id" required defaultValue={defaults.termId} placeholder="term_..." />
        </label>
      </div>
      <div className="form-grid-two">
        <label>
          <span>Class ID</span>
          <input name="class_id" required defaultValue={defaults.classId} placeholder="cls_..." />
        </label>
        <label>
          <span>Subject ID</span>
          <input name="subject_id" required defaultValue={defaults.subjectId} placeholder="subj_..." />
        </label>
      </div>
      <label>
        <span>Teacher ID</span>
        <input name="teacher_id" required defaultValue={defaults.teacherId} placeholder="tch_..." />
      </label>
      <label>
        <span>Assignment note</span>
        <textarea name="note" rows={4} maxLength={300} placeholder="Optional note, e.g. Primary mathematics teacher for JHS 2A Term 1" />
      </label>
      <button className="button" type="submit" disabled={submitting}>{submitting ? "Creating assignment…" : "Create teacher assignment"}</button>
      {notice ? <p className={`form-notice ${notice.kind}`}>{notice.message}</p> : null}
      {assignmentId ? (
        <div className="created-school-box assignment-result-box">
          <span>Teacher assignment ID</span>
          <strong>{assignmentId}</strong>
          <small>This connects the teacher to the class, subject, term and academic year.</small>
        </div>
      ) : null}
    </form>
  );
}
