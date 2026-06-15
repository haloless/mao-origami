import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrigamiDocument, OrigamiStep } from "../../core/document/types";

type OrigamiViewerProps = {
  document: OrigamiDocument;
  currentStep: OrigamiStep;
};

function PaperModel({ document, currentStep }: OrigamiViewerProps) {
  const frontColor = document.sheet.frontColor ?? "#ffd36e";
  const foldAngle = currentStep.command.type === "fold" ? currentStep.command.angleDeg / 360 : 0;
  const modelRotationZ = currentStep.command.type === "rotate_model" ? (currentStep.command.angleDeg * Math.PI) / 180 : 0;
  const modelRotationX = currentStep.command.type === "flip_model" ? (currentStep.command.angleDeg * Math.PI) / 180 : 0;

  return (
    <group rotation={[modelRotationX + foldAngle, 0.45, modelRotationZ + foldAngle / 2]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.03, 2.2]} />
        <meshStandardMaterial color={frontColor} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <torusGeometry args={[0.55, 0.01, 8, 64, Math.PI]} />
        <meshStandardMaterial color="#1f2a44" />
      </mesh>
    </group>
  );
}

export function OrigamiViewer({ document, currentStep }: OrigamiViewerProps) {
  return (
    <div className="viewer-frame">
      <Canvas camera={{ position: [3.8, 2.6, 4.5], fov: 42 }} shadows>
        <color attach="background" args={["#fbf7ef"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow />
        <PaperModel document={document} currentStep={currentStep} />
        <OrbitControls enablePan={false} />
      </Canvas>
      <div className="viewer-caption">
        <strong>{currentStep.title}</strong>
        <span>{currentStep.presentation.narrationText ?? currentStep.description ?? "当前步骤暂无说明。"}</span>
      </div>
    </div>
  );
}