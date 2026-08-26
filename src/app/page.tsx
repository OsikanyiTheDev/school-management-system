import { AppShell } from "@/components/app-shell";
import { architectureFlow, dashboardStats, foundationModules, roles } from "@/data/foundation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <main>
        <section className="hero" id="overview">
          <p className="eyebrow"><span /> Phase 1 foundation</p>
          <h1>School Management Information System built for real SaaS growth.</h1>
          <p className="hero-lead">
            A cloud-based SMIS foundation for schools, students, parents, teachers, attendance, academics,
            fees and reports — designed from day one for multi-school data isolation.
          </p>
          <div className="hero-actions">
            <a href="#roles" className="button">Explore roles</a>
            <a href="#architecture" className="button button-secondary">View architecture</a>
          </div>
        </section>

        <section className="stats-grid" aria-label="Foundation metrics">
          {dashboardStats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <p>{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="section" id="architecture">
          <div className="section-heading">
            <p className="eyebrow"><span /> Architecture</p>
            <h2>Separated deployment paths, one coherent platform.</h2>
            <p>Vercel handles the frontend from GitHub. AWS infrastructure is defined in Terraform and applied locally by the operator.</p>
          </div>
          <div className="architecture-flow">
            {architectureFlow.map((step, index) => (
              <div key={step} className="flow-item">
                <span>{step}</span>
                {index < architectureFlow.length - 1 ? <b aria-hidden="true">→</b> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="roles">
          <div className="section-heading">
            <p className="eyebrow"><span /> Role-based product</p>
            <h2>Different users, different permissions, one tenant boundary.</h2>
            <p>Each user operates inside a school tenant and receives only the navigation/actions appropriate for their role.</p>
          </div>
          <div className="role-grid">
            {roles.map((role) => (
              <article className={`role-card role-${role.key}`} key={role.key}>
                <small>{role.label}</small>
                <p>{role.summary}</p>
                <div>
                  {role.metrics.map((item) => <span key={item}>{item}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="roadmap">
          <div className="section-heading">
            <p className="eyebrow"><span /> Implementation roadmap</p>
            <h2>Build the foundation first, then layer academics and finance.</h2>
            <p>The current codebase establishes structure, quality gates, backend rules, data model and infrastructure modules.</p>
          </div>
          <div className="module-grid">
            {foundationModules.map((module) => (
              <article key={module.label}>
                <span>{module.status}</span>
                <h3>{module.label}</h3>
                <p>{module.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
