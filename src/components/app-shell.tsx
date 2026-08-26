import Link from "next/link";
import type { Session } from "@/lib/auth";

const nav = [
  "Overview",
  "Schools",
  "Students",
  "Teachers",
  "Classes",
  "Attendance",
  "Grades",
  "Fees",
  "Reports",
];

export function AppShell({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Application navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>
            <strong>SMIS</strong>
            <small>School SaaS foundation</small>
          </span>
        </Link>
        <nav>
          {nav.map((item, index) => (
            <a href={index === 0 ? "#overview" : "#roadmap"} key={item} className={index === 0 ? "active" : ""}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </a>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div>
            <strong>Production-ready school operations</strong>
            <span>Multi-tenant architecture · AWS serverless · Terraform</span>
          </div>
          <div className="topbar-actions">
            <a className="topbar-action" href="#roadmap">View roadmap</a>
            {session ? (
              <Link className="topbar-action topbar-action-primary" href="/account">{session.email ?? "Account"}</Link>
            ) : (
              <Link className="topbar-action topbar-action-primary" href="/auth">Sign in</Link>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
