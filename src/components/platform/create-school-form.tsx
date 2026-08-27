"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Notice = { kind: "success" | "error"; message: string } | null;

type CreateSchoolResponse = {
  school?: {
    school_id?: string;
    name?: string;
    code?: string;
    status?: string;
  };
  error?: string;
  details?: string[];
};

export function CreateSchoolForm() {
  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdSchoolId, setCreatedSchoolId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setNotice(null);
    setCreatedSchoolId("");

    const payload = {
      name: String(data.get("name") ?? ""),
      code: String(data.get("code") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      address: String(data.get("address") ?? ""),
    };

    try {
      const response = await fetch("/api/backend/schools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as CreateSchoolResponse;
      if (!response.ok) {
        throw new Error(body.details?.join(" ") || body.error || "School could not be created");
      }
      const school = body.school;
      setCreatedSchoolId(school?.school_id ?? "");
      setNotice({ kind: "success", message: `${school?.name ?? "School"} was created successfully.` });
      form.reset();
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "School could not be created" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="platform-form" onSubmit={submit}>
      <div className="form-grid-two">
        <label>
          <span>School name</span>
          <input name="name" required minLength={2} maxLength={160} placeholder="Accra Model School" />
        </label>
        <label>
          <span>School code</span>
          <input name="code" required minLength={2} maxLength={24} placeholder="AMS" />
        </label>
      </div>
      <div className="form-grid-two">
        <label>
          <span>School email</span>
          <input name="email" type="email" placeholder="admin@example.edu" />
        </label>
        <label>
          <span>Phone</span>
          <input name="phone" inputMode="tel" pattern="\+?[0-9]{9,15}" placeholder="+233241234567" />
        </label>
      </div>
      <label>
        <span>Address</span>
        <textarea name="address" rows={4} maxLength={300} placeholder="School location or postal address" />
      </label>
      <button className="button" type="submit" disabled={submitting}>{submitting ? "Creating school…" : "Create school tenant"}</button>
      {notice ? <p className={`form-notice ${notice.kind}`}>{notice.message}</p> : null}
      {createdSchoolId ? (
        <div className="created-school-box">
          <span>New school ID</span>
          <strong>{createdSchoolId}</strong>
          <small>Use this tenant ID for academic years, terms, classes and people records.</small>
          <Link className="setup-next-link" href={`/platform/schools/${createdSchoolId}/setup`}>Continue to academic setup</Link>
        </div>
      ) : null}
    </form>
  );
}
