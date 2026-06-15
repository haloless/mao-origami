import type {
	CreaseDefinition,
	FaceTransform,
	OrigamiDocument,
	OrigamiState,
	Point2,
	Point3,
	SheetDefinition,
} from "../document/types";

export const SHEET_WORLD_SIZE = 2.2;

export function clonePoint3([x, y, z]: Point3): Point3 {
	return [x, y, z];
}

export function addPoint3([ax, ay, az]: Point3, [bx, by, bz]: Point3): Point3 {
	return [ax + bx, ay + by, az + bz];
}

export function scalePoint3([x, y, z]: Point3, scalar: number): Point3 {
	return [x * scalar, y * scalar, z * scalar];
}

export function normalizePoint3([x, y, z]: Point3): Point3 {
	const length = Math.hypot(x, y, z);

	if (length === 0) {
		return [0, 0, 0];
	}

	return [x / length, y / length, z / length];
}

export function createIdentityFaceTransform(): FaceTransform {
	return {
		translation: [0, 0, 0],
		rotationEuler: [0, 0, 0],
	};
}

export function cloneFaceTransform(transform?: FaceTransform): FaceTransform {
	if (!transform) {
		return createIdentityFaceTransform();
	}

	return {
		translation: clonePoint3(transform.translation),
		rotationEuler: clonePoint3(transform.rotationEuler),
	};
}

export function cloneState(state: OrigamiState): OrigamiState {
	return {
		id: state.id,
		faceTransforms: Object.fromEntries(
			Object.entries(state.faceTransforms).map(([faceId, transform]) => [faceId, cloneFaceTransform(transform)]),
		),
		faceOrder: [...state.faceOrder],
	};
}

export function getFaceTransform(state: OrigamiState, faceId: string): FaceTransform {
	return cloneFaceTransform(state.faceTransforms[faceId]);
}

export function getSheetWorldDimensions(sheet: SheetDefinition) {
	return {
		width: sheet.width * SHEET_WORLD_SIZE,
		height: sheet.height * SHEET_WORLD_SIZE,
	};
}

export function mapPoint2ToWorld(point: Point2, sheet: SheetDefinition): Point3 {
	const { width, height } = getSheetWorldDimensions(sheet);

	return [(point[0] - 0.5) * width, 0, (0.5 - point[1]) * height];
}

export function getCreaseById(document: OrigamiDocument, creaseId?: string): CreaseDefinition | undefined {
	if (!creaseId) {
		return undefined;
	}

	return document.geometry.creases.find((crease) => crease.id === creaseId);
}

export function getCreaseAxis(document: OrigamiDocument, creaseId?: string) {
	const crease = getCreaseById(document, creaseId);

	if (!crease) {
		return {
			axis: [1, 0, 0] as Point3,
			midpoint: [0, 0, 0] as Point3,
		};
	}

	const fromPoint = document.geometry.points[crease.fromPointId];
	const toPoint = document.geometry.points[crease.toPointId];

	if (!fromPoint || !toPoint) {
		return {
			axis: [1, 0, 0] as Point3,
			midpoint: [0, 0, 0] as Point3,
		};
	}

	const fromWorld = mapPoint2ToWorld(fromPoint.coord2d, document.sheet);
	const toWorld = mapPoint2ToWorld(toPoint.coord2d, document.sheet);
	const axis = normalizePoint3([toWorld[0] - fromWorld[0], 0, toWorld[2] - fromWorld[2]]);
	const midpoint = scalePoint3(addPoint3(fromWorld, toWorld), 0.5);

	return { axis, midpoint };
}

export function eulerDeltaFromAxis(axis: Point3, angleDeg: number): Point3 {
	const angleRad = (angleDeg * Math.PI) / 180;
	return [axis[0] * angleRad, axis[1] * angleRad, axis[2] * angleRad];
}