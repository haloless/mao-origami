import type { OrigamiDocument } from "../../core/document/types";

type StepPanelProps = {
  document: OrigamiDocument;
  currentStepIndex: number;
};

export function StepPanel({ document, currentStepIndex }: StepPanelProps) {
  return (
    <section className="step-panel">
      <div className="panel-heading">
        <h2>步骤</h2>
        <p>当前骨架使用统一文档模型驱动步骤列表，后续可直接扩展为编辑器时间轴。</p>
      </div>

      <ol className="step-list">
        {document.steps.map((step, index) => {
          const isActive = index === currentStepIndex;

          return (
            <li key={step.id} className={isActive ? "step-card active" : "step-card"}>
              <div className="step-card-top">
                <span className="step-index">{step.index}</span>
                <strong>{step.title}</strong>
              </div>
              <p>{step.description ?? step.presentation.narrationText ?? "暂无说明。"}</p>
              <small>command: {step.command.type}</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}