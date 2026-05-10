import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { initialClaims, technologies } from "./data";
import { ClaimDetail } from "./pages/ClaimDetail";
import { Home } from "./pages/Home";
import { ReviewQueue } from "./pages/ReviewQueue";
import { SubmitEvidence } from "./pages/SubmitEvidence";
import { TechnologyDetail } from "./pages/TechnologyDetail";
import type { Claim, EvidenceSubmission, VerificationStatus } from "./types";
import { useState } from "react";

function createClaimFromSubmission(submission: EvidenceSubmission): Claim {
  const technology = technologies.find((item) => item.id === submission.technologyId);
  const now = new Date();
  const id = `claim-${now.getTime()}`;

  return {
    id,
    title: submission.title,
    technologyId: submission.technologyId,
    category: technology?.category ?? "Unmapped",
    submittedBy: "prototype-user",
    submittedAt: now.toISOString().slice(0, 10),
    statuses: ["unreviewed"],
    sourceTypes: [submission.sourceType],
    progressTypes: [submission.progressType],
    summary: submission.summary,
    currentAssessment:
      "This claim has been submitted to the prototype queue and has not been reviewed by a moderator yet.",
    previousState: submission.previousState,
    limitations: [submission.limitation],
    sources: [
      {
        id: `${id}-source`,
        title: submission.sourceTitle,
        publisher: "Submitted source",
        type: submission.sourceType,
        url: submission.sourceUrl,
      },
    ],
    rebuttals: ["No rebuttals have been added yet."],
    communitySignals: {
      sourceHelpful: 0,
      needsVerification: 1,
      possibleDuplicate: 0,
      strongRebuttal: 0,
      timelineCandidate: 0,
      likelyOverstated: 0,
    },
  };
}

export default function App() {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);

  function handleSubmitEvidence(submission: EvidenceSubmission) {
    const claim = createClaimFromSubmission(submission);
    setClaims((current) => [claim, ...current]);
    return claim.id;
  }

  function handleReviewClaim(claimId: string, statuses: VerificationStatus[], note: string) {
    setClaims((current) =>
      current.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              statuses,
              reviewNote: note,
              currentAssessment: note,
            }
          : claim,
      ),
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home claims={claims} />} />
        <Route path="technology/:technologyId" element={<TechnologyDetail claims={claims} />} />
        <Route path="claim/:claimId" element={<ClaimDetail claims={claims} />} />
        <Route path="submit" element={<SubmitEvidence onSubmitEvidence={handleSubmitEvidence} />} />
        <Route path="review" element={<ReviewQueue claims={claims} onReviewClaim={handleReviewClaim} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
