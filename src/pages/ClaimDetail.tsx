import { AlertCircle, ArrowRight, ExternalLink, FileText, GitPullRequestArrow, MessageSquarePlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { progressTypeLabels, sourceTypeLabels, technologies } from "../data";
import { StatusBadge } from "../components/StatusBadge";
import type { Claim } from "../types";
import { findTechnology, getPrimaryStatus } from "../utils";

type ClaimDetailProps = {
  claims: Claim[];
};

export function ClaimDetail({ claims }: ClaimDetailProps) {
  const { claimId } = useParams();
  const claim = claims.find((item) => item.id === claimId);
  const technology = findTechnology(technologies, claim?.technologyId);

  if (!claim) {
    return (
      <div className="empty-state">
        <h1>Claim not found</h1>
        <p>The claim may exist only in another session.</p>
        <Link className="button secondary" to="/">
          Return to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="claim-detail-head">
        <div className="status-strip">
          {claim.statuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
        <h1>{claim.title}</h1>
        <p>{claim.summary}</p>
        <div className="metadata-row">
          <span>Submitted by {claim.submittedBy}</span>
          <span>{claim.submittedAt}</span>
          <span>{claim.category}</span>
        </div>
      </section>

      <section className="section-grid two-one">
        <div className="panel assessment-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Assessment first</p>
              <h2>Current judgment</h2>
            </div>
            <AlertCircle aria-hidden="true" />
          </div>
          <StatusBadge status={getPrimaryStatus(claim.statuses)} />
          <p className="large-copy">{claim.currentAssessment}</p>
          <dl className="definition-list">
            <div>
              <dt>Previous state</dt>
              <dd>{claim.previousState}</dd>
            </div>
            <div>
              <dt>Related technology</dt>
              <dd>
                {technology ? <Link to={`/technology/${technology.id}`}>{technology.name}</Link> : "Not yet mapped"}
              </dd>
            </div>
            <div>
              <dt>Progress type</dt>
              <dd>{claim.progressTypes.map((type) => progressTypeLabels[type]).join(", ")}</dd>
            </div>
          </dl>
        </div>
        <aside className="panel side-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Reviewer actions</p>
              <h2>Quality signals</h2>
            </div>
          </div>
          <div className="signal-grid">
            <button type="button">Source helpful <strong>{claim.communitySignals.sourceHelpful}</strong></button>
            <button type="button">Needs verification <strong>{claim.communitySignals.needsVerification}</strong></button>
            <button type="button">Possible duplicate <strong>{claim.communitySignals.possibleDuplicate}</strong></button>
            <button type="button">Strong rebuttal <strong>{claim.communitySignals.strongRebuttal}</strong></button>
            <button type="button">Timeline candidate <strong>{claim.communitySignals.timelineCandidate}</strong></button>
            <button type="button">Likely overstated <strong>{claim.communitySignals.likelyOverstated}</strong></button>
          </div>
        </aside>
      </section>

      <section className="section-grid">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sources</p>
              <h2>Evidence links</h2>
            </div>
            <FileText aria-hidden="true" />
          </div>
          <div className="source-list">
            {claim.sources.map((source) => (
              <a className="source-row" href={source.url} key={source.id} target="_blank" rel="noreferrer">
                <div>
                  <strong>{source.title}</strong>
                  <span>{source.publisher} · {sourceTypeLabels[source.type]}</span>
                </div>
                <ExternalLink aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Limits</p>
              <h2>What is not proven</h2>
            </div>
          </div>
          <ul className="check-list">
            {claim.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
          <div className="rebuttal-box">
            <h3>Rebuttals</h3>
            {claim.rebuttals.map((rebuttal) => (
              <p key={rebuttal}>{rebuttal}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Community workflow</p>
            <h2>Next actions</h2>
          </div>
        </div>
        <div className="action-grid">
          <Link className="button secondary" to="/submit">
            Add source
            <MessageSquarePlus aria-hidden="true" />
          </Link>
          <Link className="button secondary" to="/review">
            Open in review queue
            <GitPullRequestArrow aria-hidden="true" />
          </Link>
          {technology ? (
            <Link className="button secondary" to={`/technology/${technology.id}`}>
              View technology map
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
