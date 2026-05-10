import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { maturityStages } from "../data";
import type { Claim, Technology, VerificationStatus } from "../types";
import { getMaturityLabel, getPrimaryStatus } from "../utils";
import { StatusBadge } from "./StatusBadge";

type ProgressGraphProps = {
  technologies: Technology[];
  claims: Claim[];
};

const axisLabels = ["Theory", "Lab", "Paper", "Reproduced", "Prototype", "Real use", "Commercial", "Mass", "Infra"];
const laneColors = ["#2e6f4e", "#1f4ed8", "#a24f12", "#6f3bd8", "#a51d3c"];
const plotWidth = 720;
const plotPadding = 36;

function statusForTechnology(relatedClaims: Claim[]): VerificationStatus {
  if (relatedClaims.length === 0) return "unreviewed";
  return getPrimaryStatus(relatedClaims.flatMap((claim) => claim.statuses));
}

function confidenceClass(confidence: Technology["confidence"]) {
  return `confidence-${confidence.toLowerCase()}`;
}

function stageX(level: number) {
  return plotPadding + ((level - 1) / (maturityStages.length - 1)) * (plotWidth - plotPadding * 2);
}

function trajectoryPoints(level: number, row: number) {
  const y = 42 + row * 52;
  const targetX = stageX(level);
  const midX = stageX(Math.max(2, Math.min(level - 1, Math.ceil(level / 2))));
  const startX = stageX(1);

  return [
    `${startX},${y + 16}`,
    `${midX},${y + 10}`,
    `${targetX},${y}`,
  ].join(" ");
}

export function ProgressGraph({ technologies, claims }: ProgressGraphProps) {
  const groupedTechnologies = technologies.reduce<Array<{ category: string; technologies: Technology[] }>>(
    (groups, technology) => {
      const existingGroup = groups.find((group) => group.category === technology.category);

      if (existingGroup) {
        existingGroup.technologies.push(technology);
        return groups;
      }

      return [...groups, { category: technology.category, technologies: [technology] }];
    },
    [],
  );

  return (
    <div className="progress-graph" aria-label="Technology maturity graph">
      <div className="progress-groups">
        {groupedTechnologies.map((group, groupIndex) => (
          <section
            className="forecast-panel"
            key={group.category}
            style={{ "--lane": laneColors[groupIndex % laneColors.length] } as CSSProperties}
          >
            <div className="forecast-heading">
              <div>
                <strong>{group.category}</strong>
                <span>{group.technologies.length} tracked technologies</span>
              </div>
            </div>
            <div className="forecast-body">
              <div className="forecast-chart">
                <div className="forecast-axis" aria-hidden="true">
                  {maturityStages.map((stage, index) => (
                    <div className="forecast-tick" key={stage.level}>
                      <strong>{stage.level}</strong>
                      <span>{axisLabels[index]}</span>
                    </div>
                  ))}
                </div>
                <svg
                  className="forecast-svg"
                  role="img"
                  aria-label={`${group.category} technology trajectories by maturity stage`}
                  viewBox={`0 0 ${plotWidth} ${64 + group.technologies.length * 52}`}
                >
                  {maturityStages.map((stage) => {
                    const x = stageX(stage.level);
                    return (
                      <line
                        className="forecast-grid-line"
                        key={stage.level}
                        x1={x}
                        x2={x}
                        y1={14}
                        y2={58 + group.technologies.length * 52}
                      />
                    );
                  })}
                  {group.technologies.map((technology, index) => {
                    const relatedClaims = claims.filter((claim) => claim.technologyId === technology.id);
                    const primaryStatus = statusForTechnology(relatedClaims);
                    const x = stageX(technology.maturityLevel);
                    const y = 42 + index * 52;

                    return (
                      <g className="forecast-path-group" key={technology.id}>
                        <polyline className="forecast-line" points={trajectoryPoints(technology.maturityLevel, index)} />
                        <circle className={`forecast-marker ${confidenceClass(technology.confidence)}`} cx={x} cy={y} r="12" />
                        <text className="forecast-marker-label" x={x} y={y + 4}>
                          {technology.maturityLevel}
                        </text>
                        <text className="forecast-tech-label" x={plotPadding} y={y + 30}>
                          {technology.name}
                        </text>
                        <text className="forecast-status-label" x={x + 18} y={y - 10}>
                          {primaryStatus.split("-").join(" ")}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="forecast-list">
                {group.technologies.map((technology) => {
                  const relatedClaims = claims.filter((claim) => claim.technologyId === technology.id);
                  const primaryStatus = statusForTechnology(relatedClaims);

                  return (
                    <Link className="forecast-row" key={technology.id} to={`/technology/${technology.id}`}>
                      <div>
                        <strong>{technology.name}</strong>
                        <span>{technology.field}</span>
                      </div>
                      <div className="forecast-row-meta">
                        <StatusBadge status={primaryStatus} />
                        <span>{getMaturityLabel(technology.maturityLevel)}</span>
                        <span>{relatedClaims.length} claims</span>
                        <ArrowRight aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="graph-legend">
        <span><i className="legend-dot confidence-high" /> High confidence</span>
        <span><i className="legend-dot confidence-medium" /> Medium confidence</span>
        <span><i className="legend-dot confidence-low" /> Low confidence</span>
      </div>
    </div>
  );
}
