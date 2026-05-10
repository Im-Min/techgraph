import { CheckCircle2, Clock3, FileWarning, GitPullRequestArrow, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Claim, VerificationStatus } from "../types";
import { reviewQueueClaims } from "../utils";
import { StatusBadge } from "../components/StatusBadge";

type ReviewQueueProps = {
  claims: Claim[];
  onReviewClaim: (claimId: string, statuses: VerificationStatus[], note: string) => void;
};

const reviewActions: Array<{
  label: string;
  icon: typeof CheckCircle2;
  statuses: VerificationStatus[];
  note: string;
}> = [
  {
    label: "Source verified",
    icon: CheckCircle2,
    statuses: ["source-verified", "limitations"],
    note: "Source exists and supports the claim, but limitations still need to be tracked.",
  },
  {
    label: "Needs more evidence",
    icon: Clock3,
    statuses: ["unreviewed", "limitations"],
    note: "The source is not enough to update the technology map yet.",
  },
  {
    label: "Mark debated",
    icon: GitPullRequestArrow,
    statuses: ["under-debate", "limitations"],
    note: "Reviewers disagree on interpretation or missing context.",
  },
  {
    label: "Likely overstated",
    icon: ShieldAlert,
    statuses: ["likely-overstated", "limitations"],
    note: "The source appears to overstate maturity, scale, or generality.",
  },
  {
    label: "Add to timeline",
    icon: CheckCircle2,
    statuses: ["source-verified", "meaningful-progress", "timeline-added"],
    note: "The claim is strong enough to appear on the technology timeline.",
  },
  {
    label: "Reject",
    icon: XCircle,
    statuses: ["rebutted"],
    note: "The evidence does not support the submitted claim.",
  },
];

export function ReviewQueue({ claims, onReviewClaim }: ReviewQueueProps) {
  const queue = reviewQueueClaims(claims);
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Moderator workspace</p>
          <h1>Review claims before they change the map.</h1>
          <p>
            This queue is intentionally closer to a pull request review than a social feed. Every decision should leave
            a visible reason.
          </p>
        </div>
        <aside className="summary-panel">
          <span className="label">Open queue</span>
          <strong>{queue.length} claims</strong>
          <span>Unreviewed, disputed, overstated, or limitation-heavy items appear here.</span>
        </aside>
      </section>

      <section className="review-layout">
        {queue.map((claim) => (
          <article className="review-card" key={claim.id}>
            <div className="review-main">
              <div className="status-strip">
                {claim.statuses.map((status) => (
                  <StatusBadge key={status} status={status} />
                ))}
              </div>
              <h2>
                <Link to={`/claim/${claim.id}`}>{claim.title}</Link>
              </h2>
              <p>{claim.currentAssessment}</p>
              <div className="review-note">
                <FileWarning aria-hidden="true" />
                <span>{claim.reviewNote ?? "No reviewer decision recorded yet."}</span>
              </div>
              <label>
                Review reason
                <textarea
                  value={notes[claim.id] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [claim.id]: event.target.value }))}
                  placeholder="Explain the decision. This should be visible in the review history."
                />
              </label>
            </div>
            <div className="review-actions">
              {reviewActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    className="button secondary"
                    key={action.label}
                    type="button"
                    onClick={() => {
                      const note = notes[claim.id]?.trim() || action.note;
                      onReviewClaim(claim.id, action.statuses, note);
                    }}
                  >
                    {action.label}
                    <Icon aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </article>
        ))}
        {queue.length === 0 ? (
          <div className="empty-state">
            <h2>No claims need review.</h2>
            <p>Submit a new evidence item to test the queue flow.</p>
            <Link className="button primary" to="/submit">
              Submit evidence
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
