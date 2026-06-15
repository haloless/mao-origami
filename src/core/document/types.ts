export type Point2 = [number, number];
export type Point3 = [number, number, number];

export type DocumentMetadata = {
  id: string;
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type SheetDefinition = {
  id: string;
  shape: "square" | "rectangle" | "triangle" | "polygon" | "custom";
  width: number;
  height: number;
  frontColor?: string;
  backColor?: string;
};

export type FaceTransform = {
  translation: Point3;
  rotationEuler: Point3;
};

export type OrigamiState = {
  id: string;
  faceTransforms: Record<string, FaceTransform>;
  faceOrder: string[];
};

export type PointRegistry = Record<
  string,
  {
    coord2d: Point2;
    coord3d?: Point3;
    label?: string;
  }
>;

export type CreaseDefinition = {
  id: string;
  fromPointId: string;
  toPointId: string;
  kind: "valley" | "mountain" | "boundary" | "reference" | "auxiliary" | "cut";
};

export type FaceDefinition = {
  id: string;
  pointIds: string[];
  side: "front" | "back" | "both";
};

export type GeometryDefinition = {
  points: PointRegistry;
  creases: CreaseDefinition[];
  faces: FaceDefinition[];
  initialState: OrigamiState;
  stateCache?: StepStateCache[];
};

export type StepStateCache = {
  stepId: string;
  beforeStateId: string;
  afterState: OrigamiState;
};

export type FoldCommand = {
  type: "fold";
  foldKind: "valley" | "mountain";
  targetFaceIds: string[];
  creaseId?: string;
  angleDeg: number;
  resultStateId?: string;
};

export type UnfoldCommand = {
  type: "unfold";
  targetStepId?: string;
  targetFaceIds?: string[];
  resultStateId?: string;
};

export type FlipModelCommand = {
  type: "flip_model";
  axis: "x" | "y" | "z";
  angleDeg: number;
  resultStateId?: string;
};

export type RotateModelCommand = {
  type: "rotate_model";
  axis: "x" | "y" | "z";
  angleDeg: number;
  resultStateId?: string;
};

export type AnnotationOnlyCommand = {
  type: "annotation_only";
};

export type StepCommand =
  | FoldCommand
  | UnfoldCommand
  | FlipModelCommand
  | RotateModelCommand
  | AnnotationOnlyCommand;

export type StepPresentation = {
  durationMs?: number;
  highlightFaceIds?: string[];
  highlightCreaseIds?: string[];
  narrationText?: string;
};

export type StepValidation = {
  status: "valid" | "warning" | "error" | "unchecked";
  messages?: {
    level: "info" | "warning" | "error";
    code: string;
    text: string;
  }[];
};

export type StepEditorMeta = {
  draft?: boolean;
  locked?: boolean;
  commandId?: string;
};

export type OrigamiStep = {
  id: string;
  index: number;
  title: string;
  description?: string;
  command: StepCommand;
  presentation: StepPresentation;
  validation?: StepValidation;
  editorMeta?: StepEditorMeta;
};

export type PlaybackConfig = {
  allowScrub: boolean;
  allowStepReplay: boolean;
  defaultSpeed?: number;
  speedOptions?: number[];
};

export type AnnotationDefinition = {
  id: string;
  stepId?: string;
  kind: "text" | "label" | "marker" | "warning" | "tip";
  content: string;
};

export type EditorDocumentState = {
  mode?: "published" | "draft";
  selectedStepId?: string;
  selectedFaceIds?: string[];
  selectedCreaseIds?: string[];
  dirty?: boolean;
};

export type OrigamiDocument = {
  version: string;
  metadata: DocumentMetadata;
  sheet: SheetDefinition;
  geometry: GeometryDefinition;
  steps: OrigamiStep[];
  playback: PlaybackConfig;
  annotations: AnnotationDefinition[];
  editor: EditorDocumentState;
};