import type { OrigamiDocument } from "./types";

export const sampleDocument: OrigamiDocument = {
  version: "0.1.0",
  metadata: {
    id: "paper-boat-basic",
    title: "小船",
    description: "用于播放器骨架的示例模型，包含折叠、旋转、翻面和展开步骤。",
    difficulty: "easy",
  },
  sheet: {
    id: "sheet-1",
    shape: "square",
    width: 1,
    height: 1,
    frontColor: "#ffd36e",
    backColor: "#fff8e7",
  },
  geometry: {
    points: {
      p1: { coord2d: [0, 0] },
      p2: { coord2d: [1, 0] },
      p3: { coord2d: [1, 1] },
      p4: { coord2d: [0, 1] },
    },
    creases: [
      { id: "c1", fromPointId: "p1", toPointId: "p3", kind: "reference" },
      { id: "c2", fromPointId: "p4", toPointId: "p2", kind: "reference" },
    ],
    faces: [{ id: "f1", pointIds: ["p1", "p2", "p3", "p4"], side: "both" }],
    initialState: {
      id: "state-0",
      faceTransforms: {
        f1: {
          translation: [0, 0, 0],
          rotationEuler: [0, 0, 0],
        },
      },
      faceOrder: ["f1"],
    },
  },
  steps: [
    {
      id: "step-1",
      index: 1,
      title: "沿对角线对折",
      description: "把正方形沿对角线对折。",
      command: {
        type: "fold",
        foldKind: "valley",
        targetFaceIds: ["f1"],
        creaseId: "c1",
        angleDeg: 180,
        resultStateId: "state-1",
      },
      presentation: {
        durationMs: 1200,
        highlightCreaseIds: ["c1"],
        narrationText: "先把纸沿着对角线对折。",
      },
      validation: { status: "unchecked" },
      editorMeta: { draft: false },
    },
    {
      id: "step-2",
      index: 2,
      title: "旋转模型",
      description: "为了方便后续观察，先转动模型。",
      command: {
        type: "rotate_model",
        axis: "z",
        angleDeg: 90,
        resultStateId: "state-2",
      },
      presentation: {
        durationMs: 900,
        narrationText: "把模型转一下，准备下一步。",
      },
      validation: { status: "unchecked" },
      editorMeta: { draft: false },
    },
    {
      id: "step-3",
      index: 3,
      title: "翻到背面",
      description: "为了继续操作，先把模型翻到背面。",
      command: {
        type: "flip_model",
        axis: "x",
        angleDeg: 180,
        resultStateId: "state-3",
      },
      presentation: {
        durationMs: 1000,
        narrationText: "把模型翻到另一面。",
      },
      validation: { status: "unchecked" },
      editorMeta: { draft: false },
    },
    {
      id: "step-4",
      index: 4,
      title: "沿另一条对角线折叠",
      description: "沿另一条对角线再进行一次折叠。",
      command: {
        type: "fold",
        foldKind: "mountain",
        targetFaceIds: ["f1"],
        creaseId: "c2",
        angleDeg: 135,
        resultStateId: "state-4",
      },
      presentation: {
        durationMs: 1100,
        highlightCreaseIds: ["c2"],
        narrationText: "沿另一条对角线压出新的折痕。",
      },
      validation: { status: "unchecked" },
      editorMeta: { draft: false },
    },
    {
      id: "step-5",
      index: 5,
      title: "展开并观察结果",
      description: "将纸张重新展开，观察已经形成的折痕和朝向。",
      command: {
        type: "unfold",
        targetFaceIds: ["f1"],
        resultStateId: "state-5",
      },
      presentation: {
        durationMs: 900,
        narrationText: "把纸重新展开，看看当前结果。",
      },
      validation: { status: "unchecked" },
      editorMeta: { draft: false },
    },
    {
      id: "step-6",
      index: 6,
      title: "完成展示",
      description: "停留在当前状态，观察最后结果。",
      command: {
        type: "annotation_only",
      },
      presentation: {
        durationMs: 600,
        narrationText: "这就是当前完成后的样子。",
      },
      validation: { status: "unchecked" },
      editorMeta: { draft: false },
    },
  ],
  playback: {
    allowScrub: true,
    allowStepReplay: true,
    defaultSpeed: 1,
    speedOptions: [0.5, 1, 1.5],
  },
  annotations: [],
  editor: {
    mode: "published",
    dirty: false,
  },
};

export const sampleDocuments: Record<string, OrigamiDocument> = {
  [sampleDocument.metadata.id]: sampleDocument,
};