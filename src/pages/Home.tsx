import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { technologies } from "../data";
import type { Claim } from "../types";
import { reviewQueueClaims } from "../utils";
import { ProgressGraph } from "../components/ProgressGraph";

type HomeProps = {
  claims: Claim[];
};

export function Home({ claims }: HomeProps) {
  const queue = reviewQueueClaims(claims);

  return (
    <div className="page-stack home-page">
      <section className="progress-hero">
        <div className="progress-hero-header">
          <div>
            <p className="eyebrow">Technology progress graph</p>
            <h1>Technology map</h1>
          </div>
          <div className="graph-summary-panel" aria-label="Prototype graph summary">
            <div>
              <strong>{technologies.length}</strong>
              <span>Technologies</span>
            </div>
            <div>
              <strong>{claims.length}</strong>
              <span>Claims</span>
            </div>
            <div>
              <strong>{queue.length}</strong>
              <span>Need review</span>
            </div>
          </div>
        </div>

        <ProgressGraph technologies={technologies} claims={claims} />

        <div className="home-action-strip">
          <Link className="button primary" to="/submit">
            Submit evidence
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="button secondary" to="/review">
            Open review queue
            <Clock3 aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
