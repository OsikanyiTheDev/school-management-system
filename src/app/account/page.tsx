import Link from "next/link";
import { getAuthConfig, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function roleLabel(role: string) {
  return role.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AccountPage() {
  const config = getAuthConfig();
  const session = await getSession();

  return (
    <main className="account-page">
      <section className="account-card">
        <p className="eyebrow"><span /> Account</p>
        <h1>{session ? "Signed in" : "Not signed in"}</h1>
        {!config ? <p className="auth-error">Authentication is not configured. Add Cognito environment variables in Vercel.</p> : null}
        {session ? (
          <>
            <div className="account-grid">
              <div><span>Email</span><strong>{session.email ?? "Not supplied"}</strong></div>
              <div><span>Role</span><strong>{roleLabel(session.primaryRole)}</strong></div>
              <div><span>Groups</span><strong>{session.groups.length ? session.groups.join(", ") : "No groups yet"}</strong></div>
              <div><span>School ID</span><strong>{session.schoolId ?? "Not linked yet"}</strong></div>
              <div><span>Person ID</span><strong>{session.personId ?? "Not linked yet"}</strong></div>
              <div><span>User sub</span><strong>{session.sub}</strong></div>
            </div>
            <div className="auth-actions">
              <Link className="button" href={session.primaryRole === "platform_admin" ? "/platform" : "/"}>Dashboard</Link>
              <a className="button button-secondary" href="/api/auth/logout">Sign out</a>
            </div>
          </>
        ) : (
          <div className="auth-actions">
            <a className="button" href="/api/auth/login">Sign in</a>
            <Link className="button button-secondary" href="/">Back home</Link>
          </div>
        )}
      </section>
    </main>
  );
}
