import { create } from "zustand";

type AppState = {
  currentStepIndex: number;
  autoPlay: boolean;
  speed: number;
  replayToken: number;
  setCurrentStepIndex: (stepIndex: number) => void;
  nextStep: (stepCount: number) => void;
  previousStep: () => void;
  toggleAutoPlay: () => void;
  setAutoPlay: (value: boolean) => void;
  setSpeed: (value: number) => void;
  replayStep: () => void;
  resetPlayback: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  currentStepIndex: 0,
  autoPlay: false,
  speed: 1,
  replayToken: 0,
  setCurrentStepIndex: (stepIndex) => set({ currentStepIndex: Math.max(0, stepIndex) }),
  nextStep: (stepCount) =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, Math.max(0, stepCount - 1)),
    })),
  previousStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
    })),
  toggleAutoPlay: () => set((state) => ({ autoPlay: !state.autoPlay })),
  setAutoPlay: (value) => set({ autoPlay: value }),
  setSpeed: (value) => set({ speed: value }),
  replayStep: () => set((state) => ({ replayToken: state.replayToken + 1 })),
  resetPlayback: () => set({ currentStepIndex: 0, autoPlay: false, replayToken: 0 }),
}));