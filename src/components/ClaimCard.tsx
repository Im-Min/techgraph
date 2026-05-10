import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { progressTypeLabels, sourceTypeLabels } from "../data";
import type { Claim } from "../types";
import { getPrimaryStatus } from "../utils";
import { StatusBadge } from "./StatusBadge";

type ClaimCardProps = {
  claim: Claim;
  compact?: boolean;
};

export function ClaimCard({ claim, compact = false }: ClaimCardProps) {
  const primaryStatus = getPrimaryStatus(claim.statuses);

  return (
    <article className={`claim-card ${compact ? "is-compact" : ""}`}>
      <div className="card-topline">
        <StatusBadge status={primaryStatus} />
        <span>{claim.category}</span>
        <span>{claim.submittedAt}</span>
      </div>
      <h3>
        <Link to={`/claim/${claim.id}`}>{claim.title}</Link>
      </h3>
      <p>{claim.currentAssessment}</p>
      <div className="metadata-row">
        {claim.sourceTypes.slice(0, 2).map((sourceType) => (
          <span key={sourceType}>{sourceTypeLabels[sourceType]}</span>
        ))}
        {claim.progressTypes.slice(0, 2).map((progressType) => (
          <span key={progressType}>{progressTypeLabels[progressType]}</span>
        ))}
      </div>
      <div className="claim-actions">
        <Link className="text-link" to={`/claim/${claim.id}`}>
          Review claim
          <ArrowRight aria-hidden="true" />
        </Link>
        {claim.sources[0] ? (
          <a className="text-link muted-link" href={claim.sources[0].url} target="_blank" rel="noreferrer">
            Source
            <ExternalLink aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
