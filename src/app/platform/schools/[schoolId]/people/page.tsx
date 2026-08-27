import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PeopleManagementForms } from "@/components/platform/people-management-forms";
import { getAuthConfig, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function PeoplePage({ params, searchParams }: PageProps) {
  const { schoolId } = await params;
  const query = await searchParams;
  const [session, config] = await Promise.all([getSession(), Promise.resolve(getAuthConfig())]);
  const canManage = session?.primaryRole === "platform_admin" || session?.primaryRole === "school_admin";
  const academicYearId = first(query.academicYearId);
  const classId = first(query.classId);

  return (
    <AppShell session={session}>
      <main className="platform-page">
        <section className="platform-hero">
          <p className="eyebrow"><span /> People management</p>
          <h1>Add teachers, guardians and students.</h1>
          <p>
            Create people records for <strong>{schoolId}</strong>. These profiles stay tenant-scoped and connect later to attendance, grading, assignments, invoices and parent access.
          </p>
        </section>

        {!config ? (
          <section className="platform-panel"><p className="auth-error">Authentication is not configured in this deployment.</p></section>
        ) : !session ? (
          <section className="platform-panel">
            <h2>Sign in required</h2>
            <p>People management requires a confirmed Cognito account.</p>
            <Link className="button" href="/auth">Sign in</Link>
          </section>
        ) : !canManage ? (
          <section className="platform-panel">
            <h2>Administrator access required</h2>
            <p>Your account cannot manage people records for this school.</p>
          </section>
        ) : (
          <PeopleManagementForms schoolId={schoolId} defaultAcademicYearId={academicYearId} defaultClassId={classId} />
        )}
      </main>
    </AppShell>
  );
}
