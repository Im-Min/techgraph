import { maturityStages } from "../data";
import { getMaturityLabel } from "../utils";

type MaturityStepperProps = {
  level: number;
};

export function MaturityStepper({ level }: MaturityStepperProps) {
  return (
    <div className="maturity-block" aria-label={`Maturity stage ${level}: ${getMaturityLabel(level)}`}>
      <div className="maturity-track">
        {maturityStages.map((stage) => (
          <div
            className={`maturity-step ${stage.level <= level ? "is-active" : ""} ${
              stage.level === level ? "is-current" : ""
            }`}
            key={stage.level}
            title={`${stage.level}. ${stage.label}: ${stage.description}`}
          >
            <span>{stage.level}</span>
          </div>
        ))}
      </div>
      <div className="maturity-caption">
        <strong>Stage {level}</strong>
        <span>{getMaturityLabel(level)}</span>
      </div>
    </div>
  );
}
