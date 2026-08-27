import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TeacherAssignmentForm } from "@/components/platform/teacher-assignment-form";
import { getAuthConfig, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AssignmentsPage({ params, searchParams }: PageProps) {
  const { schoolId } = await params;
  const query = await searchParams;
  const [session, config] = await Promise.all([getSession(), Promise.resolve(getAuthConfig())]);
  const canManage = session?.primaryRole === "platform_admin" || session?.primaryRole === "school_admin";

  const defaults = {
    academicYearId: first(query.academicYearId),
    termId: first(query.termId),
    classId: first(query.classId),
    subjectId: first(query.subjectId),
    teacherId: first(query.teacherId),
  };

  return (
    <AppShell session={session}>
      <main className="platform-page">
        <section className="platform-hero">
          <p className="eyebrow"><span /> Teacher assignments</p>
          <h1>Connect teachers to classes and subjects.</h1>
          <p>
            Create the teaching assignment for <strong>{schoolId}</strong>. This relationship powers teacher dashboards, attendance marking, grade entry and class reports.
          </p>
        </section>

        {!config ? (
          <section className="platform-panel"><p className="auth-error">Authentication is not configured in this deployment.</p></section>
        ) : !session ? (
          <section className="platform-panel">
            <h2>Sign in required</h2>
            <p>Teacher assignments require a confirmed Cognito account.</p>
            <Link className="button" href="/auth">Sign in</Link>
          </section>
        ) : !canManage ? (
          <section className="platform-panel">
            <h2>Administrator access required</h2>
            <p>Your account cannot manage teacher assignments for this school.</p>
          </section>
        ) : (
          <div className="platform-layout assignment-layout">
            <section className="platform-panel">
              <div className="platform-panel-heading">
                <div>
                  <span>Academic bridge</span>
                  <h2>Create teacher assignment</h2>
                </div>
                <small>Tenant scoped</small>
              </div>
              <TeacherAssignmentForm schoolId={schoolId} defaults={defaults} />
            </section>
            <aside className="platform-side-panel">
              <h2>Use your existing IDs</h2>
              <ol>
                <li>Academic year ID</li>
                <li>Term ID</li>
                <li>Class ID</li>
                <li>Subject ID</li>
                <li>Teacher ID</li>
              </ol>
              <p>Once this exists, the next module can use it to restrict teacher workflows to assigned classes and subjects.</p>
            </aside>
          </div>
        )}
      </main>
    </AppShell>
  );
}
