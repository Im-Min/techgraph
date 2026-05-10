export type VerificationStatus =
  | "unreviewed"
  | "source-verified"
  | "meaningful-progress"
  | "limitations"
  | "likely-overstated"
  | "under-debate"
  | "rebutted"
  | "timeline-added"
  | "maturity-updated";

export type SourceType =
  | "paper"
  | "preprint"
  | "peer-reviewed-paper"
  | "company-announcement"
  | "product-launch"
  | "patent"
  | "regulatory-document"
  | "independent-test"
  | "benchmark"
  | "conference-talk"
  | "dataset-or-code"
  | "press-coverage";

export type ProgressType =
  | "performance"
  | "cost"
  | "efficiency"
  | "stability"
  | "lifetime"
  | "miniaturization"
  | "manufacturing-scale"
  | "reproduction"
  | "product-deployment"
  | "regulatory-approval"
  | "infrastructure"
  | "new-method";

export type MaturityStage = {
  level: number;
  label: string;
  description: string;
};

export type Source = {
  id: string;
  title: string;
  publisher: string;
  type: SourceType;
  url: string;
};

export type TimelineEvent = {
  id: string;
  year: string;
  title: string;
  status: VerificationStatus;
  summary: string;
};

export type Technology = {
  id: string;
  name: string;
  category: string;
  field: string;
  maturityLevel: number;
  confidence: "Low" | "Medium" | "High";
  summary: string;
  currentAssessment: string;
  recentChange: string;
  bottlenecks: string[];
  organizations: string[];
  timeline: TimelineEvent[];
};

export type Claim = {
  id: string;
  title: string;
  technologyId: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
  statuses: VerificationStatus[];
  sourceTypes: SourceType[];
  progressTypes: ProgressType[];
  summary: string;
  currentAssessment: string;
  previousState: string;
  limitations: string[];
  sources: Source[];
  rebuttals: string[];
  communitySignals: {
    sourceHelpful: number;
    needsVerification: number;
    possibleDuplicate: number;
    strongRebuttal: number;
    timelineCandidate: number;
    likelyOverstated: number;
  };
  reviewNote?: string;
};

export type FieldSummary = {
  id: string;
  name: string;
  description: string;
  recentChange: string;
  openDebate: string;
  maturityChange: string;
  technologyIds: string[];
};

export type EvidenceSubmission = {
  title: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceType: SourceType;
  technologyId: string;
  summary: string;
  progressType: ProgressType;
  previousState: string;
  limitation: string;
};
