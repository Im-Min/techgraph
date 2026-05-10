import { statusText } from "../utils";
import type { VerificationStatus } from "../types";

type StatusBadgeProps = {
  status: VerificationStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`}>{statusText(status)}</span>;
}
