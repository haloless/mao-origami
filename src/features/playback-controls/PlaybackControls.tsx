import { useAppStore } from "../../app/store/useAppStore";
import type { OrigamiDocument } from "../../core/document/types";

type PlaybackControlsProps = {
  document: OrigamiDocument;
};

export function PlaybackControls({ document }: PlaybackControlsProps) {
  const currentStepIndex = useAppStore((state) => state.currentStepIndex);
  const autoPlay = useAppStore((state) => state.autoPlay);
  const speed = useAppStore((state) => state.speed);
  const previousStep = useAppStore((state) => state.previousStep);
  const nextStep = useAppStore((state) => state.nextStep);
  const replayStep = useAppStore((state) => state.replayStep);
  const toggleAutoPlay = useAppStore((state) => state.toggleAutoPlay);
  const setSpeed = useAppStore((state) => state.setSpeed);

  const speedOptions = document.playback.speedOptions ?? [0.5, 1, 1.5];

  return (
    <section className="control-panel">
      <div className="panel-heading">
        <h2>播放控制</h2>
        <p>这里先提供播放器功能，后续可直接复用到编辑器预览面板。</p>
      </div>

      <div className="control-row">
        <button onClick={() => previousStep()} disabled={currentStepIndex === 0} type="button">
          上一步
        </button>
        <button onClick={() => replayStep()} type="button">
          重播当前步
        </button>
        <button
          onClick={() => nextStep(document.steps.length)}
          disabled={currentStepIndex >= document.steps.length - 1}
          type="button"
        >
          下一步
        </button>
      </div>

      <div className="control-row">
        <button onClick={() => toggleAutoPlay()} type="button">
          {autoPlay ? "暂停自动播放" : "自动播放"}
        </button>
        <label className="speed-select">
          <span>速度</span>
          <select value={String(speed)} onChange={(event) => setSpeed(Number(event.target.value))}>
            {speedOptions.map((value) => (
              <option key={value} value={String(value)}>
                {value}x
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}