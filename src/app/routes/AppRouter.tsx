import { Navigate, Route, Routes } from "react-router-dom";
import { EditorPlaceholderPage } from "../../features/editor-shell/EditorPlaceholderPage";
import { PlayerPage } from "../../features/player/PlayerPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/play/paper-boat-basic" replace />} />
      <Route path="/play/:modelId" element={<PlayerPage />} />
      <Route path="/edit/:modelId" element={<EditorPlaceholderPage />} />
    </Routes>
  );
}