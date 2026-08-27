import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AcademicSetupForms } from "@/components/platform/academic-setup-forms";
import { getAuthConfig, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ schoolId: string }> };

export default async function SchoolSetupPage({ params }: PageProps) {
  const { schoolId } = await params;
  const [session, config] = await Promise.all([getSession(), Promise.resolve(getAuthConfig())]);
  const canManage = session?.primaryRole === "platform_admin" || session?.primaryRole === "school_admin";

  return (
    <AppShell session={session}>
      <main className="platform-page">
        <section className="platform-hero">
          <p className="eyebrow"><span /> Academic setup</p>
          <h1>Build the school&apos;s academic foundation.</h1>
          <p>
            Create the academic year, term, class and subject records for <strong>{schoolId}</strong>. The generated IDs connect later student, teacher, attendance and grade modules.
          </p>
        </section>

        {!config ? (
          <section className="platform-panel"><p className="auth-error">Authentication is not configured in this deployment.</p></section>
        ) : !session ? (
          <section className="platform-panel">
            <h2>Sign in required</h2>
            <p>Academic setup requires a confirmed Cognito account.</p>
            <Link className="button" href="/auth">Sign in</Link>
          </section>
        ) : !canManage ? (
          <section className="platform-panel">
            <h2>Administrator access required</h2>
            <p>Your account cannot manage academic setup for this school.</p>
          </section>
        ) : (
          <AcademicSetupForms schoolId={schoolId} />
        )}
      </main>
    </AppShell>
  );
}
