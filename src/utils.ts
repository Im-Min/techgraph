import { maturityStages, statusLabels } from "./data";
import type { Claim, Technology, VerificationStatus } from "./types";

export function getMaturityLabel(level: number) {
  return maturityStages.find((stage) => stage.level === level)?.label ?? "Unknown";
}

export function getPrimaryStatus(statuses: VerificationStatus[]) {
  if (statuses.includes("rebutted")) return "rebutted";
  if (statuses.includes("under-debate")) return "under-debate";
  if (statuses.includes("likely-overstated")) return "likely-overstated";
  if (statuses.includes("timeline-added")) return "timeline-added";
  if (statuses.includes("meaningful-progress")) return "meaningful-progress";
  if (statuses.includes("source-verified")) return "source-verified";
  return statuses[0] ?? "unreviewed";
}

export function statusText(status: VerificationStatus) {
  return statusLabels[status];
}

export function claimsForTechnology(claims: Claim[], technologyId: string) {
  return claims.filter((claim) => claim.technologyId === technologyId);
}

export function latestClaims(claims: Claim[], limit: number) {
  return [...claims]
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
    .slice(0, limit);
}

export function reviewQueueClaims(claims: Claim[]) {
  return claims.filter((claim) =>
    claim.statuses.some((status) =>
      ["unreviewed", "under-debate", "likely-overstated", "limitations"].includes(status),
    ),
  );
}

export function verifiedClaims(claims: Claim[]) {
  return claims.filter((claim) =>
    claim.statuses.some((status) => ["source-verified", "meaningful-progress", "timeline-added"].includes(status)),
  );
}

export function debatedClaims(claims: Claim[]) {
  return claims.filter((claim) =>
    claim.statuses.some((status) => ["under-debate", "likely-overstated", "rebutted"].includes(status)),
  );
}

export function findTechnology(technologies: Technology[], id?: string) {
  return technologies.find((technology) => technology.id === id);
}
