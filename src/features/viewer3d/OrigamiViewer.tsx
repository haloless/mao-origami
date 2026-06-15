import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DoubleSide, Shape, Vector2 } from "three";
import type { OrigamiDocument, OrigamiState, OrigamiStep } from "../../core/document/types";
import { getFaceCentroid, getFaceWorldVertices, toLocalFaceVertices } from "../../core/geometry";

type OrigamiViewerProps = {
  document: OrigamiDocument;
  currentStep: OrigamiStep;
  currentState: OrigamiState;
};

function PaperModel({ document, currentState }: Omit<OrigamiViewerProps, "currentStep">) {
  const frontColor = document.sheet.frontColor ?? "#ffd36e";
  const backColor = document.sheet.backColor ?? "#fff8e7";

  return (
    <group rotation={[0, 0.45, 0]}>
      {document.geometry.faces.map((face) => {
        const faceTransform = currentState.faceTransforms[face.id] ?? document.geometry.initialState.faceTransforms[face.id];
        const worldVertices = getFaceWorldVertices(document, face);
        const centroid = getFaceCentroid(worldVertices);
        const localVertices = toLocalFaceVertices(worldVertices, centroid);
        const faceShape = new Shape(localVertices.map(([x, z]) => new Vector2(x, z)));
        const layerIndex = currentState.faceOrder.indexOf(face.id);
        const layerOffset = layerIndex >= 0 ? layerIndex * 0.01 : 0;

        return (
          <group
            key={face.id}
            position={[
              centroid[0] + faceTransform.translation[0],
              centroid[1] + faceTransform.translation[1] + layerOffset,
              centroid[2] + faceTransform.translation[2],
            ]}
            rotation={faceTransform.rotationEuler}
            renderOrder={layerIndex}
          >
            <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} renderOrder={layerIndex}>
              <shapeGeometry args={[faceShape]} />
              <meshStandardMaterial color={frontColor} side={DoubleSide} />
            </mesh>
            <lineLoop rotation={[-Math.PI / 2, 0, 0]} renderOrder={layerIndex + 1}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array(localVertices.flatMap(([x, z]) => [x, z, 0.012])),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color={backColor} />
            </lineLoop>
          </group>
        );
      })}
      <mesh position={[0, 0.03, 0]}>
        <torusGeometry args={[0.55, 0.01, 8, 64, Math.PI]} />
        <meshStandardMaterial color="#1f2a44" />
      </mesh>
    </group>
  );
}

export function OrigamiViewer({ document, currentStep, currentState }: OrigamiViewerProps) {
  return (
    <div className="viewer-frame">
      <Canvas camera={{ position: [3.8, 2.6, 4.5], fov: 42 }} shadows>
        <color attach="background" args={["#fbf7ef"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow />
        <PaperModel document={document} currentState={currentState} />
        <OrbitControls enablePan={false} />
      </Canvas>
      <div className="viewer-caption">
        <strong>{currentStep.title}</strong>
        <span>{currentStep.presentation.narrationText ?? currentStep.description ?? "当前步骤暂无说明。"}</span>
      </div>
    </div>
  );
}