import type {
	FaceTransform,
	OrigamiDocument,
	OrigamiState,
	OrigamiStep,
	Point3,
	StepStateCache,
} from "../document/types";
import {
	cloneState,
	eulerDeltaFromAxis,
	getCreaseAxis,
	getFaceTransform,
} from "../geometry";

function addEuler([ax, ay, az]: Point3, [bx, by, bz]: Point3): Point3 {
	return [ax + bx, ay + by, az + bz];
}

function addTranslation([ax, ay, az]: Point3, [bx, by, bz]: Point3): Point3 {
	return [ax + bx, ay + by, az + bz];
}

function withFaceTransform(state: OrigamiState, faceId: string, transform: FaceTransform) {
	state.faceTransforms[faceId] = transform;
}

function moveFaceIdsToTop(faceOrder: string[], targetFaceIds: string[]) {
	const targetIds = new Set(targetFaceIds);
	const remaining = faceOrder.filter((faceId) => !targetIds.has(faceId));
	const moved = faceOrder.filter((faceId) => targetIds.has(faceId));
	return [...remaining, ...moved];
}

function getResultStateId(step: OrigamiStep, fallbackIndex: number) {
	if ("resultStateId" in step.command && typeof step.command.resultStateId === "string") {
		return step.command.resultStateId;
	}

	return `state-${fallbackIndex}`;
}

function executeFold(document: OrigamiDocument, previousState: OrigamiState, step: OrigamiStep, stepIndex: number) {
	const nextState = cloneState(previousState);

	if (step.command.type !== "fold") {
		return nextState;
	}

	const sign = step.command.foldKind === "valley" ? 1 : -1;
	const { axis, midpoint } = getCreaseAxis(document, step.command.creaseId);
	const rotationDelta = eulerDeltaFromAxis(axis, step.command.angleDeg * sign);
	const lift = Math.sin((Math.abs(step.command.angleDeg) * Math.PI) / 360) * 0.18 * sign;

	step.command.targetFaceIds.forEach((faceId) => {
		const transform = getFaceTransform(previousState, faceId);
		transform.rotationEuler = addEuler(transform.rotationEuler, rotationDelta);
		transform.translation = addTranslation(transform.translation, [midpoint[0] * 0.02, lift, midpoint[2] * 0.02]);
		withFaceTransform(nextState, faceId, transform);
	});

	nextState.faceOrder = moveFaceIdsToTop(nextState.faceOrder, step.command.targetFaceIds);

	nextState.id = getResultStateId(step, stepIndex + 1);
	return nextState;
}

function executeRotateLike(
	previousState: OrigamiState,
	step: OrigamiStep,
	stepIndex: number,
	axisName: "x" | "y" | "z",
	angleDeg: number,
) {
	const nextState = cloneState(previousState);
	const axisMap: Record<"x" | "y" | "z", Point3> = {
		x: [1, 0, 0],
		y: [0, 1, 0],
		z: [0, 0, 1],
	};
	const rotationDelta = eulerDeltaFromAxis(axisMap[axisName], angleDeg);

	Object.keys(nextState.faceTransforms).forEach((faceId) => {
		const transform = getFaceTransform(previousState, faceId);
		transform.rotationEuler = addEuler(transform.rotationEuler, rotationDelta);
		withFaceTransform(nextState, faceId, transform);
	});

	nextState.id = getResultStateId(step, stepIndex + 1);
	return nextState;
}

function executeUnfold(document: OrigamiDocument, previousState: OrigamiState, step: OrigamiStep, stepIndex: number) {
	const nextState = cloneState(previousState);

	if (step.command.type !== "unfold") {
		return nextState;
	}

	const targetFaceIds = step.command.targetFaceIds ?? document.geometry.faces.map((face) => face.id);

	targetFaceIds.forEach((faceId) => {
		const initialTransform = document.geometry.initialState.faceTransforms[faceId];
		if (initialTransform) {
			withFaceTransform(nextState, faceId, {
				translation: [...initialTransform.translation],
				rotationEuler: [...initialTransform.rotationEuler],
			});
		}
	});

	nextState.faceOrder = [...document.geometry.initialState.faceOrder];

	nextState.id = getResultStateId(step, stepIndex + 1);
	return nextState;
}

export function executeStepCommand(document: OrigamiDocument, previousState: OrigamiState, step: OrigamiStep, stepIndex: number) {
	switch (step.command.type) {
		case "fold":
			return executeFold(document, previousState, step, stepIndex);
		case "rotate_model":
			return executeRotateLike(previousState, step, stepIndex, step.command.axis, step.command.angleDeg);
		case "flip_model":
			return executeRotateLike(previousState, step, stepIndex, step.command.axis, step.command.angleDeg);
		case "unfold":
			return executeUnfold(document, previousState, step, stepIndex);
		case "annotation_only": {
			const nextState = cloneState(previousState);
			nextState.id = getResultStateId(step, stepIndex + 1);
			return nextState;
		}
		default:
			return cloneState(previousState);
	}
}

export function buildStepStateCache(document: OrigamiDocument): StepStateCache[] {
	let previousState = cloneState(document.geometry.initialState);

	return document.steps.map((step, stepIndex) => {
		const afterState = executeStepCommand(document, previousState, step, stepIndex);
		const cacheEntry: StepStateCache = {
			stepId: step.id,
			beforeStateId: previousState.id,
			afterState,
		};

		previousState = cloneState(afterState);
		return cacheEntry;
	});
}