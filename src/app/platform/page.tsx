import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CreateSchoolForm } from "@/components/platform/create-school-form";
import { getAuthConfig, getBackendApiUrl, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlatformPage() {
  const [session, config] = await Promise.all([getSession(), Promise.resolve(getAuthConfig())]);
  const apiConfigured = Boolean(getBackendApiUrl());
  const isPlatformAdmin = session?.primaryRole === "platform_admin";

  return (
    <AppShell session={session}>
      <main className="platform-page">
        <section className="platform-hero">
          <p className="eyebrow"><span /> Platform Admin</p>
          <h1>Create and manage school tenants.</h1>
          <p>
            Start the SaaS foundation by creating the first school tenant. Each school receives its own tenant-scoped records for setup, people, academics and finance.
          </p>
        </section>

        {!config ? (
          <section className="platform-panel"><p className="auth-error">Authentication is not configured in this deployment.</p></section>
        ) : !session ? (
          <section className="platform-panel">
            <h2>Sign in required</h2>
            <p>Platform administration requires a confirmed Cognito account.</p>
            <Link className="button" href="/auth">Sign in</Link>
          </section>
        ) : !isPlatformAdmin ? (
          <section className="platform-panel">
            <h2>PlatformAdmin required</h2>
            <p>Your account is signed in, but it does not have the PlatformAdmin group claim.</p>
            <div className="created-school-box">
              <span>Current role</span>
              <strong>{session.primaryRole}</strong>
              <small>Ask a platform operator to assign the PlatformAdmin group, then sign out and sign back in.</small>
            </div>
          </section>
        ) : (
          <div className="platform-layout">
            <section className="platform-panel">
              <div className="platform-panel-heading">
                <div>
                  <span>Step 01</span>
                  <h2>Create school tenant</h2>
                </div>
                <small>{apiConfigured ? "API connected" : "API missing"}</small>
              </div>
              <CreateSchoolForm />
            </section>
            <aside className="platform-side-panel">
              <h2>What happens next?</h2>
              <ol>
                <li>Create the school tenant.</li>
                <li>Add an academic year and term.</li>
                <li>Create classes and subjects.</li>
                <li>Add teachers, students and guardians.</li>
                <li>Link users to school roles.</li>
              </ol>
              <p>Only the school profile is created in this step. Academic setup and people management come next.</p>
            </aside>
          </div>
        )}
      </main>
    </AppShell>
  );
}
