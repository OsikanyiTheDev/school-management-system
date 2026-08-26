import Link from "next/link";
import { getAuthConfig, getSession } from "@/lib/auth";

const errors: Record<string, string> = {
  not_configured: "Authentication is not configured yet. Add the Cognito environment variables in Vercel.",
  invalid_callback: "The sign-in callback could not be verified. Please try again.",
  token_exchange_failed: "Cognito sign-in succeeded, but token exchange failed. Check callback URLs and environment variables.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AuthPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const config = getAuthConfig();
  const session = await getSession();

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow"><span /> Secure access</p>
        <h1>Sign in to SMIS</h1>
        <p>
          Users can sign in with email and password.
        </p>
        <p className="auth-supporting-copy">
          Your school dashboard is protected with verified Cognito access before any academic, student or finance data is opened.
        </p>
        {error ? <p className="auth-error">{errors[error] ?? `Authentication error: ${error}`}</p> : null}
        {session ? (
          <div className="auth-actions">
            <Link className="button" href="/account">Open account</Link>
            <a className="button button-secondary" href="/api/auth/logout">Sign out</a>
          </div>
        ) : (
          <div className="auth-actions">
            <a className="button" href="/api/auth/login" aria-disabled={!config}>Sign in with Cognito</a>
            <Link className="button button-secondary" href="/">Back home</Link>
          </div>
        )}
        {!config ? <p className="auth-note">Missing Cognito environment variables. See docs/AUTHENTICATION.md.</p> : null}
      </section>
    </main>
  );
}
