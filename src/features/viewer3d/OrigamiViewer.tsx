import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrigamiDocument, OrigamiState, OrigamiStep } from "../../core/document/types";
import { SHEET_WORLD_SIZE } from "../../core/geometry";

type OrigamiViewerProps = {
  document: OrigamiDocument;
  currentStep: OrigamiStep;
  currentState: OrigamiState;
};

function PaperModel({ document, currentState }: Omit<OrigamiViewerProps, "currentStep">) {
  const frontColor = document.sheet.frontColor ?? "#ffd36e";
  const faceTransform = currentState.faceTransforms.f1 ?? document.geometry.initialState.faceTransforms.f1;
  const width = document.sheet.width * SHEET_WORLD_SIZE;
  const height = document.sheet.height * SHEET_WORLD_SIZE;

  return (
    <group rotation={[0, 0.45, 0]}>
      <group position={faceTransform.translation} rotation={faceTransform.rotationEuler}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, 0.03, height]} />
          <meshStandardMaterial color={frontColor} />
        </mesh>
      </group>
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