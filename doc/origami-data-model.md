# 折纸数据结构设计

## 1. 目标

本项目第一阶段实现“折纸演示器”，但数据结构必须从一开始就支持后续扩展为“用户折纸编辑器 + 演示器”。

因此数据结构需要同时满足以下要求：

- 便于播放器按步骤稳定重放。
- 便于编辑器对模型、步骤、注释和视角进行修改。
- 与具体渲染技术解耦，不把 Three.js 场景对象直接写入数据层。
- 尽量保持确定性，同一份输入在不同环境下得到一致播放结果。
- 预留导入导出能力，后续可兼容 FOLD 或其他标准格式。

## 2. 设计原则

### 2.1 以文档模型为中心

每一个折纸作品使用一份 `OrigamiDocument` 表示。文档中同时包含：

- 纸张与几何初始定义
- 逻辑步骤序列
- 每一步的演示参数
- 注释、提示和教学辅助信息
- 编辑器元数据

播放器和编辑器都只消费这份文档模型。

### 2.2 几何状态与演示状态分离

需要区分两类数据：

- 几何状态：纸张面片、折线、层级、朝向等确定结果。
- 演示状态：镜头、动画时长、高亮区域、说明文案、语音提示等。

这样做的原因是，同一步折叠动作可能会有多个不同的教学表现形式，但几何结果应保持一致。

### 2.3 步骤是“命令”，状态是“可回放结果”

每一步先定义为一个可执行命令，再允许缓存其执行后状态。

- 命令模型便于编辑器修改和重算。
- 缓存状态便于播放器快速播放和跳步。

### 2.4 明确保留编辑器扩展位

第一阶段即使不实现编辑器，也要保留下列结构：

- 选区与命中目标 ID
- 可撤销命令 ID
- 校验错误列表
- 草稿状态与发布时间戳
- 自定义元信息扩展字段

## 3. 顶层模型

建议顶层数据结构如下：

```ts
type OrigamiDocument = {
  version: string;
  metadata: DocumentMetadata;
  sheet: SheetDefinition;
  geometry: GeometryDefinition;
  steps: OrigamiStep[];
  playback: PlaybackConfig;
  annotations: AnnotationDefinition[];
  editor: EditorDocumentState;
  assets?: AssetRef[];
  extensions?: Record<string, unknown>;
};
```

### 3.1 metadata

```ts
type DocumentMetadata = {
  id: string;
  title: string;
  description?: string;
  language?: string;
  difficulty?: "easy" | "medium" | "hard";
  ageRange?: { min?: number; max?: number };
  tags?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnailAssetId?: string;
  source?: {
    kind: "manual" | "imported" | "generated";
    name?: string;
    uri?: string;
  };
};
```

### 3.2 sheet

```ts
type SheetDefinition = {
  id: string;
  shape: "square" | "rectangle" | "triangle" | "polygon" | "custom";
  width: number;
  height: number;
  frontColor?: string;
  backColor?: string;
  thickness?: number;
  material?: "paper" | "foil" | "custom";
  boundary?: Point2[];
};
```

说明：

- 第一阶段主要支持 `square`。
- `boundary` 为后续编辑器支持自定义轮廓预留。
- `frontColor/backColor` 对儿童教学很重要，可帮助识别翻面和折叠方向。

### 3.3 geometry

```ts
type GeometryDefinition = {
  points: PointRegistry;
  creases: CreaseDefinition[];
  faces: FaceDefinition[];
  initialState: OrigamiState;
  stateCache?: StepStateCache[];
};
```

```ts
type Point2 = [number, number];
type Point3 = [number, number, number];

type PointRegistry = {
  [pointId: string]: {
    coord2d: Point2;
    coord3d?: Point3;
    label?: string;
  };
};

type CreaseDefinition = {
  id: string;
  fromPointId: string;
  toPointId: string;
  kind: "valley" | "mountain" | "boundary" | "reference" | "auxiliary" | "cut";
  isEditable?: boolean;
};

type FaceDefinition = {
  id: string;
  pointIds: string[];
  side: "front" | "back" | "both";
  label?: string;
};
```

### 3.4 state

```ts
type OrigamiState = {
  id: string;
  faceTransforms: Record<string, FaceTransform>;
  faceOrder: string[];
  visibleFaceIds?: string[];
  selectedFaceIds?: string[];
  notes?: string[];
};

type FaceTransform = {
  translation: Point3;
  rotationEuler: Point3;
  matrix?: number[];
};

type StepStateCache = {
  stepId: string;
  beforeStateId: string;
  afterState: OrigamiState;
};
```

说明：

- `faceTransforms` 是播放器的主要消费对象。
- `faceOrder` 用于解决遮挡和层级顺序。
- `stateCache` 不是必需字段，但强烈建议存在，便于快速跳转和回放。

## 4. 步骤模型

步骤既要能给播放器用，也要能给编辑器用，因此建议采用“命令 + 演示参数 + 校验结果”的结构。

```ts
type OrigamiStep = {
  id: string;
  index: number;
  title: string;
  description?: string;
  command: StepCommand;
  presentation: StepPresentation;
  validation?: StepValidation;
  editorMeta?: StepEditorMeta;
};
```

### 4.1 command

```ts
type StepCommand =
  | FoldCommand
  | UnfoldCommand
  | FlipModelCommand
  | RotateModelCommand
  | OpenFoldCommand
  | SquashFoldCommand
  | ReverseFoldCommand
  | SinkFoldCommand
  | CutCommand
  | AnnotationOnlyCommand;
```

```ts
type FoldCommand = {
  type: "fold";
  foldKind: "valley" | "mountain";
  targetFaceIds: string[];
  creaseId?: string;
  axis?: {
    fromPointId: string;
    toPointId: string;
  };
  angleDeg: number;
  pivotFaceIds?: string[];
  resultStateId?: string;
};

type UnfoldCommand = {
  type: "unfold";
  targetStepId?: string;
  targetFaceIds?: string[];
  resultStateId?: string;
};

type FlipModelCommand = {
  type: "flip_model";
  axis: "x" | "y" | "z";
  angleDeg: number;
  resultStateId?: string;
};

type RotateModelCommand = {
  type: "rotate_model";
  axis: "x" | "y" | "z";
  angleDeg: number;
  resultStateId?: string;
};

type OpenFoldCommand = {
  type: "open_fold";
  targetFaceIds: string[];
  referenceCreaseIds?: string[];
  resultStateId?: string;
};

type SquashFoldCommand = {
  type: "squash_fold";
  targetFaceIds: string[];
  anchorPointIds?: string[];
  resultStateId?: string;
};

type ReverseFoldCommand = {
  type: "reverse_fold";
  mode: "inside" | "outside";
  targetFaceIds: string[];
  referenceCreaseIds?: string[];
  resultStateId?: string;
};

type SinkFoldCommand = {
  type: "sink_fold";
  targetFaceIds: string[];
  resultStateId?: string;
};

type CutCommand = {
  type: "cut";
  pathPointIds: string[];
  createsFaces?: string[];
  resultStateId?: string;
};

type AnnotationOnlyCommand = {
  type: "annotation_only";
};
```

说明：

- `resultStateId` 为播放器跳步和编辑器增量重算预留。
- `targetFaceIds` 和 `referenceCreaseIds` 是编辑器命中、选区和可视化高亮的核心。
- 第一阶段可以只完整实现 `fold`、`unfold`、`flip_model`、`rotate_model`。

### 4.2 presentation

```ts
type StepPresentation = {
  durationMs?: number;
  easing?: "linear" | "easeInOut" | "easeOut";
  cameraPresetId?: string;
  highlightFaceIds?: string[];
  highlightCreaseIds?: string[];
  ghostPreviousState?: boolean;
  showArrow?: boolean;
  arrowHint?: ArrowHint;
  narrationText?: string;
  audioAssetId?: string;
};

type ArrowHint = {
  from: Point2;
  to: Point2;
  curve?: number;
  label?: string;
};
```

说明：

- 这些字段只影响教学表现，不改变几何结果。
- `cameraPresetId` 方便后续编辑器定义“最佳教学视角”。

### 4.3 validation

```ts
type StepValidation = {
  status: "valid" | "warning" | "error" | "unchecked";
  messages?: {
    level: "info" | "warning" | "error";
    code: string;
    text: string;
  }[];
};
```

### 4.4 editorMeta

```ts
type StepEditorMeta = {
  createdBy?: string;
  updatedBy?: string;
  locked?: boolean;
  draft?: boolean;
  commandId?: string;
  tags?: string[];
  ui?: {
    collapsed?: boolean;
    color?: string;
  };
};
```

这一段是专门为编辑器预留的，不建议省略。

## 5. 播放配置

```ts
type PlaybackConfig = {
  allowScrub: boolean;
  allowStepReplay: boolean;
  autoPlayDefault?: boolean;
  defaultSpeed?: number;
  speedOptions?: number[];
  loopSingleStep?: boolean;
  showStepPanel?: boolean;
  showMiniMap2d?: boolean;
  defaultCameraPresetId?: string;
};
```

## 6. 注释与教学辅助

```ts
type AnnotationDefinition = {
  id: string;
  stepId?: string;
  kind: "text" | "label" | "marker" | "warning" | "tip";
  content: string;
  anchor?: {
    faceId?: string;
    creaseId?: string;
    pointId?: string;
    position2d?: Point2;
    position3d?: Point3;
  };
};

type AssetRef = {
  id: string;
  kind: "image" | "audio" | "thumbnail" | "video";
  uri: string;
};
```

## 7. 面向编辑器的预留能力

为了保证未来能加入用户编辑器，数据层必须保留以下能力：

### 7.1 命令可重放

编辑器修改第 4 步后，系统需要能从第 4 步重新计算第 5 步及以后状态。因此不能只存每一步结果截图，必须保留 `StepCommand`。

### 7.2 稳定 ID 体系

以下对象必须使用稳定 ID，不应用数组位置代替：

- point
- crease
- face
- state
- step
- asset
- annotation

原因是编辑器会频繁插步、删步、重排步骤。

### 7.3 草稿与发布态分离

编辑器应支持未发布的草稿，因此建议文档级别预留：

```ts
type EditorDocumentState = {
  mode?: "published" | "draft";
  selectedStepId?: string;
  selectedFaceIds?: string[];
  selectedCreaseIds?: string[];
  dirty?: boolean;
  history?: {
    undoStackSize: number;
    redoStackSize: number;
  };
  schemaVersion?: string;
  custom?: Record<string, unknown>;
};
```

### 7.4 校验与错误定位

编辑器需要把错误定位到具体对象，因此校验信息不能只写纯文本，后续建议支持引用对象：

```ts
type ValidationReference = {
  entityType: "step" | "face" | "crease" | "point";
  entityId: string;
};
```

## 8. JSON 示例

下面给出一个适合 MVP 的最小示例：

```json
{
  "version": "0.1.0",
  "metadata": {
    "id": "paper-boat-basic",
    "title": "小船",
    "difficulty": "easy",
    "ageRange": { "min": 5, "max": 9 }
  },
  "sheet": {
    "id": "sheet-1",
    "shape": "square",
    "width": 1,
    "height": 1,
    "frontColor": "#f6d365",
    "backColor": "#fffaf0"
  },
  "geometry": {
    "points": {
      "p1": { "coord2d": [0, 0] },
      "p2": { "coord2d": [1, 0] },
      "p3": { "coord2d": [1, 1] },
      "p4": { "coord2d": [0, 1] }
    },
    "creases": [
      {
        "id": "c1",
        "fromPointId": "p1",
        "toPointId": "p3",
        "kind": "reference"
      }
    ],
    "faces": [
      {
        "id": "f1",
        "pointIds": ["p1", "p2", "p3", "p4"],
        "side": "both"
      }
    ],
    "initialState": {
      "id": "state-0",
      "faceTransforms": {
        "f1": {
          "translation": [0, 0, 0],
          "rotationEuler": [0, 0, 0]
        }
      },
      "faceOrder": ["f1"]
    }
  },
  "steps": [
    {
      "id": "step-1",
      "index": 1,
      "title": "沿对角线对折",
      "command": {
        "type": "fold",
        "foldKind": "valley",
        "targetFaceIds": ["f1"],
        "creaseId": "c1",
        "angleDeg": 180,
        "resultStateId": "state-1"
      },
      "presentation": {
        "durationMs": 1200,
        "showArrow": true,
        "highlightCreaseIds": ["c1"],
        "narrationText": "把正方形沿对角线对折。"
      },
      "validation": {
        "status": "unchecked"
      },
      "editorMeta": {
        "draft": false
      }
    }
  ],
  "playback": {
    "allowScrub": true,
    "allowStepReplay": true,
    "defaultSpeed": 1,
    "speedOptions": [0.5, 1, 1.5]
  },
  "annotations": [],
  "editor": {
    "mode": "published",
    "dirty": false,
    "history": {
      "undoStackSize": 0,
      "redoStackSize": 0
    },
    "schemaVersion": "0.1.0"
  }
}
```

## 9. MVP 实施建议

第一阶段建议只完整实现以下字段和能力：

- `OrigamiDocument`
- `SheetDefinition`
- `GeometryDefinition.initialState`
- `OrigamiStep.command`
- `OrigamiStep.presentation`
- `PlaybackConfig`
- `EditorDocumentState` 的基础字段

第一阶段可只支持如下命令：

- `fold`
- `unfold`
- `flip_model`
- `rotate_model`
- `annotation_only`

第二阶段再补充：

- `squash_fold`
- `reverse_fold`
- `sink_fold`
- `cut`
- 细粒度校验引用
- FOLD 导入导出

## 10. 结论

本数据结构的核心是：

- 用一份 `OrigamiDocument` 统一描述播放器和编辑器需要的数据。
- 用 `StepCommand` 作为真实可编辑语义。
- 用 `OrigamiState` 或 `stateCache` 作为高效播放缓存。
- 从第一天保留 `editor`、`validation`、稳定 ID 和扩展字段，避免未来重构数据层。

这套设计允许项目先做演示器，再逐步扩展成用户折纸编辑器，而不需要推翻现有模型。