# Copilot Instructions

## Project Focus

- This repository starts as a front-end-first origami demonstrator.
- The long-term target is a user origami editor plus demonstrator.
- Do not introduce solutions that make the player and editor diverge into separate data models.

## Architecture Rules

- Treat `OrigamiDocument` as the single source of truth for player and future editor features.
- Keep business logic in `src/core/`, not inside React components.
- Keep rendering concerns in `src/features/` and UI layers.
- Preserve stable IDs for steps, faces, creases, points, states, annotations, and assets.
- Prefer deterministic playback behavior over approximate visual tricks when both conflict.

## Editing Guidance

- When adding new playback features, make sure the design still supports future editing workflows.
- When adding new step fields, consider whether they belong in `command`, `presentation`, `validation`, or `editorMeta`.
- Reserve room for undo/redo, selection, draft state, validation messages, and import/export.
- Avoid coupling document state directly to Three.js scene objects.

## Documentation Alignment

- Keep implementations aligned with `doc/origami-data-model.md`.
- Keep module boundaries aligned with `doc/project-plan.md`.
- If code changes require architectural drift, update the corresponding design docs in the same task.
