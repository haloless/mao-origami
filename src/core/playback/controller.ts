import type { OrigamiDocument, OrigamiStep } from "../document/types";

export function getBoundedStepIndex(stepIndex: number, stepCount: number) {
  return Math.min(Math.max(stepIndex, 0), Math.max(stepCount - 1, 0));
}

export function getStepByIndex(document: OrigamiDocument, stepIndex: number): OrigamiStep {
  return document.steps[getBoundedStepIndex(stepIndex, document.steps.length)];
}

export function getStepProgressLabel(document: OrigamiDocument, stepIndex: number) {
  const current = getBoundedStepIndex(stepIndex, document.steps.length) + 1;
  return `步骤 ${current} / ${document.steps.length}`;
}

export function getStepDurationMs(document: OrigamiDocument, stepIndex: number, speed: number) {
  const step = getStepByIndex(document, stepIndex);
  const baseDuration = step.presentation.durationMs ?? 1000;
  return Math.max(250, Math.round(baseDuration / Math.max(speed, 0.1)));
}