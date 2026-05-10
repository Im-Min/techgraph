import { CheckCircle2, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { progressTypeLabels, sourceTypeLabels, technologies } from "../data";
import type { EvidenceSubmission, ProgressType, SourceType } from "../types";

type SubmitEvidenceProps = {
  onSubmitEvidence: (submission: EvidenceSubmission) => string;
};

const defaultSubmission: EvidenceSubmission = {
  title: "",
  sourceUrl: "",
  sourceTitle: "",
  sourceType: "company-announcement",
  technologyId: "solid-state-batteries",
  summary: "",
  progressType: "performance",
  previousState: "",
  limitation: "",
};

export function SubmitEvidence({ onSubmitEvidence }: SubmitEvidenceProps) {
  const [searchParams] = useSearchParams();
  const initialTechnology = searchParams.get("technology");
  const [submission, setSubmission] = useState<EvidenceSubmission>({
    ...defaultSubmission,
    technologyId: technologies.some((technology) => technology.id === initialTechnology)
      ? String(initialTechnology)
      : defaultSubmission.technologyId,
  });
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);

  const selectedTechnology = useMemo(
    () => technologies.find((technology) => technology.id === submission.technologyId),
    [submission.technologyId],
  );

  function updateField<Key extends keyof EvidenceSubmission>(key: Key, value: EvidenceSubmission[Key]) {
    setSubmission((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const claimId = onSubmitEvidence(submission);
    setSubmittedClaimId(claimId);
    setSubmission({
      ...defaultSubmission,
      technologyId: submission.technologyId,
    });
  }

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Structured submission</p>
          <h1>Submit evidence, not just a post.</h1>
          <p>
            The form pushes contributors toward the core shape TechGraph needs: claim, source, progress type, previous
            state, and limitations.
          </p>
        </div>
        <aside className="summary-panel">
          <span className="label">Selected technology</span>
          <strong>{selectedTechnology?.name}</strong>
          <span>{selectedTechnology?.currentAssessment}</span>
        </aside>
      </section>

      {submittedClaimId ? (
        <section className="success-banner">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>Mock submission added to the review queue.</strong>
            <p>The prototype keeps this claim in local UI state for the current session.</p>
          </div>
          <Link className="button secondary" to={`/claim/${submittedClaimId}`}>
            View claim
          </Link>
          <Link className="button secondary" to="/review">
            Review queue
          </Link>
        </section>
      ) : null}

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Claim title
            <input
              required
              minLength={8}
              value={submission.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Example: A company reports a 500 Wh/kg solid-state pouch cell"
            />
          </label>
          <label>
            Technology
            <select
              value={submission.technologyId}
              onChange={(event) => updateField("technologyId", event.target.value)}
            >
              {technologies.map((technology) => (
                <option key={technology.id} value={technology.id}>
                  {technology.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Source title
            <input
              required
              value={submission.sourceTitle}
              onChange={(event) => updateField("sourceTitle", event.target.value)}
              placeholder="Technical deck, paper, benchmark, dataset..."
            />
          </label>
          <label>
            Source URL
            <input
              required
              type="url"
              value={submission.sourceUrl}
              onChange={(event) => updateField("sourceUrl", event.target.value)}
              placeholder="https://example.com/source"
            />
          </label>
          <label>
            Source type
            <select
              value={submission.sourceType}
              onChange={(event) => updateField("sourceType", event.target.value as SourceType)}
            >
              {Object.entries(sourceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Progress type
            <select
              value={submission.progressType}
              onChange={(event) => updateField("progressType", event.target.value as ProgressType)}
            >
              {Object.entries(progressTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Claim summary
          <textarea
            required
            minLength={30}
            value={submission.summary}
            onChange={(event) => updateField("summary", event.target.value)}
            placeholder="State what the source claims and why it may represent progress."
          />
        </label>

        <div className="form-grid">
          <label>
            Previous state
            <textarea
              required
              value={submission.previousState}
              onChange={(event) => updateField("previousState", event.target.value)}
              placeholder="What was the previous public baseline or known limitation?"
            />
          </label>
          <label>
            Limitation or uncertainty
            <textarea
              required
              value={submission.limitation}
              onChange={(event) => updateField("limitation", event.target.value)}
              placeholder="What is missing, unverified, narrow, or likely overstated?"
            />
          </label>
        </div>

        <div className="form-footer">
          <p>New evidence is public as unreviewed, then reviewers decide whether it affects the technology map.</p>
          <button className="button primary" type="submit">
            Submit evidence
            <Send aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
