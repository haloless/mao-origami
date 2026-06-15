import { z } from "zod";

const documentMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const sheetDefinitionSchema = z.object({
  id: z.string(),
  shape: z.enum(["square", "rectangle", "triangle", "polygon", "custom"]),
  width: z.number(),
  height: z.number(),
  frontColor: z.string().optional(),
  backColor: z.string().optional(),
});

const stepSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  description: z.string().optional(),
  command: z.object({
    type: z.enum(["fold", "unfold", "flip_model", "rotate_model", "annotation_only"]),
  }).passthrough(),
  presentation: z.object({
    durationMs: z.number().optional(),
    narrationText: z.string().optional(),
    highlightFaceIds: z.array(z.string()).optional(),
    highlightCreaseIds: z.array(z.string()).optional(),
  }),
});

export const origamiDocumentSchema = z.object({
  version: z.string(),
  metadata: documentMetadataSchema,
  sheet: sheetDefinitionSchema,
  geometry: z.object({
    points: z.record(z.string(), z.object({
      coord2d: z.tuple([z.number(), z.number()]),
      coord3d: z.tuple([z.number(), z.number(), z.number()]).optional(),
      label: z.string().optional(),
    })),
    creases: z.array(z.object({
      id: z.string(),
      fromPointId: z.string(),
      toPointId: z.string(),
      kind: z.enum(["valley", "mountain", "boundary", "reference", "auxiliary", "cut"]),
    })),
    faces: z.array(z.object({
      id: z.string(),
      pointIds: z.array(z.string()),
      side: z.enum(["front", "back", "both"]),
    })),
    initialState: z.object({
      id: z.string(),
      faceTransforms: z.record(z.string(), z.object({
        translation: z.tuple([z.number(), z.number(), z.number()]),
        rotationEuler: z.tuple([z.number(), z.number(), z.number()]),
      })),
      faceOrder: z.array(z.string()),
    }),
    stateCache: z.array(z.object({
      stepId: z.string(),
      beforeStateId: z.string(),
      afterState: z.object({
        id: z.string(),
        faceTransforms: z.record(z.string(), z.object({
          translation: z.tuple([z.number(), z.number(), z.number()]),
          rotationEuler: z.tuple([z.number(), z.number(), z.number()]),
        })),
        faceOrder: z.array(z.string()),
      }),
    })).optional(),
  }),
  steps: z.array(stepSchema),
  playback: z.object({
    allowScrub: z.boolean(),
    allowStepReplay: z.boolean(),
    defaultSpeed: z.number().optional(),
    speedOptions: z.array(z.number()).optional(),
  }),
  annotations: z.array(z.object({
    id: z.string(),
    stepId: z.string().optional(),
    kind: z.enum(["text", "label", "marker", "warning", "tip"]),
    content: z.string(),
  })),
  editor: z.object({
    mode: z.enum(["published", "draft"]).optional(),
    selectedStepId: z.string().optional(),
    selectedFaceIds: z.array(z.string()).optional(),
    selectedCreaseIds: z.array(z.string()).optional(),
    dirty: z.boolean().optional(),
  }),
});