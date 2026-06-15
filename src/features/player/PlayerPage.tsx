import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../app/store/useAppStore";
import { origamiDocumentSchema } from "../../core/document/schema";
import { sampleDocument, sampleDocuments } from "../../core/document/sampleDocument";
import { getStepDurationMs, getStepProgressLabel } from "../../core/playback/controller";
import { PlaybackControls } from "../playback-controls/PlaybackControls";
import { StepPanel } from "../step-panel/StepPanel";
import { OrigamiViewer } from "../viewer3d/OrigamiViewer";

export function PlayerPage() {
  const { modelId } = useParams();
  const activeDocument = sampleDocuments[modelId ?? ""] ?? sampleDocument;
  const parseResult = useMemo(() => origamiDocumentSchema.safeParse(activeDocument), [activeDocument]);

  const currentStepIndex = useAppStore((state) => state.currentStepIndex);
  const autoPlay = useAppStore((state) => state.autoPlay);
  const speed = useAppStore((state) => state.speed);
  const nextStep = useAppStore((state) => state.nextStep);
  const setAutoPlay = useAppStore((state) => state.setAutoPlay);
  const resetPlayback = useAppStore((state) => state.resetPlayback);

  useEffect(() => {
    resetPlayback();
  }, [activeDocument.metadata.id, resetPlayback]);

  useEffect(() => {
    if (!autoPlay || activeDocument.steps.length <= 1) {
      return undefined;
    }

    if (currentStepIndex >= activeDocument.steps.length - 1) {
      setAutoPlay(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      nextStep(activeDocument.steps.length);
    }, getStepDurationMs(activeDocument, currentStepIndex, speed));

    return () => window.clearTimeout(timer);
  }, [activeDocument, autoPlay, currentStepIndex, nextStep, setAutoPlay, speed]);

  if (!parseResult.success) {
    return (
      <main className="page-shell">
        <section className="panel panel-error">
          <h1>文档校验失败</h1>
          <p>当前示例文档未通过基础 schema 校验，播放器已停止渲染。</p>
          <pre>{parseResult.error.message}</pre>
        </section>
      </main>
    );
  }

  const currentStep = activeDocument.steps[currentStepIndex];

  return (
    <main className="page-shell">
      <header className="hero-bar">
        <div>
          <p className="eyebrow">Origami Demonstrator Skeleton</p>
          <h1>{activeDocument.metadata.title}</h1>
          <p>{activeDocument.metadata.description}</p>
        </div>
        <div className="hero-actions">
          <span className="step-progress">{getStepProgressLabel(activeDocument, currentStepIndex)}</span>
          <Link className="ghost-link" to={`/edit/${activeDocument.metadata.id}`}>
            打开编辑器占位页
          </Link>
        </div>
      </header>

      <section className="content-grid">
        <div className="panel viewer-panel">
          <OrigamiViewer document={activeDocument} currentStep={currentStep} />
        </div>

        <aside className="panel side-panel">
          <StepPanel document={activeDocument} currentStepIndex={currentStepIndex} />
          <PlaybackControls document={activeDocument} />
        </aside>
      </section>
    </main>
  );
}