import { ArrowRight, Building2, FilePlus2, GitPullRequestArrow, LinkIcon, SlidersHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { maturityStages, technologies } from "../data";
import { ClaimCard } from "../components/ClaimCard";
import { MaturityStepper } from "../components/MaturityStepper";
import { StatusBadge } from "../components/StatusBadge";
import type { Claim } from "../types";
import { claimsForTechnology, findTechnology, getMaturityLabel } from "../utils";

type TechnologyDetailProps = {
  claims: Claim[];
};

export function TechnologyDetail({ claims }: TechnologyDetailProps) {
  const { technologyId } = useParams();
  const technology = findTechnology(technologies, technologyId);

  if (!technology) {
    return (
      <div className="empty-state">
        <h1>Technology not found</h1>
        <p>This prototype has deep-dive pages for the initial three technologies.</p>
        <Link className="button secondary" to="/">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const relatedClaims = claimsForTechnology(claims, technology.id);
  const stage = maturityStages.find((item) => item.level === technology.maturityLevel);

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">{technology.field}</p>
          <h1>{technology.name}</h1>
          <p>{technology.currentAssessment}</p>
          <div className="hero-actions">
            <Link className="button primary" to={`/submit?technology=${technology.id}`}>
              Add evidence
              <FilePlus2 aria-hidden="true" />
            </Link>
            <button className="button secondary" type="button">
              Propose maturity change
              <GitPullRequestArrow aria-hidden="true" />
            </button>
          </div>
        </div>
        <aside className="summary-panel">
          <span className="label">Current maturity</span>
          <strong>{getMaturityLabel(technology.maturityLevel)}</strong>
          <span>Confidence: {technology.confidence}</span>
          <MaturityStepper level={technology.maturityLevel} />
        </aside>
      </section>

      <section className="section-grid two-one">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current state</p>
              <h2>What changed recently</h2>
            </div>
            <SlidersHorizontal aria-hidden="true" />
          </div>
          <p className="large-copy">{technology.recentChange}</p>
          {stage ? (
            <div className="stage-description">
              <strong>Stage {stage.level}: {stage.label}</strong>
              <p>{stage.description}</p>
            </div>
          ) : null}
          <div className="tag-list">
            {technology.bottlenecks.map((bottleneck) => (
              <span key={bottleneck}>{bottleneck}</span>
            ))}
          </div>
        </div>
        <aside className="panel side-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Organizations</p>
              <h2>Tracked players</h2>
            </div>
            <Building2 aria-hidden="true" />
          </div>
          <div className="org-list">
            {technology.organizations.map((org) => (
              <span key={org}>{org}</span>
            ))}
          </div>
        </aside>
      </section>

      <section className="section-grid">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2>Evidence history</h2>
            </div>
          </div>
          <div className="timeline">
            {technology.timeline.map((event) => (
              <article className="timeline-item" key={event.id}>
                <time>{event.year}</time>
                <div>
                  <div className="timeline-heading">
                    <h3>{event.title}</h3>
                    <StatusBadge status={event.status} />
                  </div>
                  <p>{event.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Claims</p>
              <h2>Related evidence</h2>
            </div>
            <LinkIcon aria-hidden="true" />
          </div>
          <div className="claim-list">
            {relatedClaims.map((claim) => (
              <ClaimCard claim={claim} compact key={claim.id} />
            ))}
          </div>
          <Link className="button secondary full-width" to="/submit">
            Submit another claim
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
