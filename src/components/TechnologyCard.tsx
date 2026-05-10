import { ArrowRight, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import type { Technology } from "../types";
import { getMaturityLabel } from "../utils";
import { MaturityStepper } from "./MaturityStepper";

type TechnologyCardProps = {
  technology: Technology;
  claimCount: number;
};

export function TechnologyCard({ technology, claimCount }: TechnologyCardProps) {
  return (
    <article className="technology-card">
      <div className="card-topline">
        <span>{technology.category}</span>
        <span>{claimCount} claims</span>
      </div>
      <h3>
        <Link to={`/technology/${technology.id}`}>{technology.name}</Link>
      </h3>
      <p>{technology.summary}</p>
      <MaturityStepper level={technology.maturityLevel} />
      <div className="tech-card-footer">
        <div>
          <Gauge aria-hidden="true" />
          <span>{getMaturityLabel(technology.maturityLevel)}</span>
        </div>
        <Link className="text-link" to={`/technology/${technology.id}`}>
          Open map
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
