import { Link, useParams } from "react-router-dom";

export function EditorPlaceholderPage() {
  const { modelId } = useParams();

  return (
    <main className="page-shell page-shell-narrow">
      <section className="panel editor-placeholder">
        <p className="eyebrow">Editor Reserved Surface</p>
        <h1>折纸编辑器占位页</h1>
        <p>
          当前模型：<strong>{modelId ?? "unknown"}</strong>
        </p>
        <p>
          本页当前只做架构占位，但路由、文档模型和目录结构已经按编辑器扩展准备好。后续可以直接在这里接入步骤时间轴、属性面板、选区系统和撤销重做。
        </p>
        <Link className="ghost-link" to={`/play/${modelId ?? "paper-boat-basic"}`}>
          返回播放器
        </Link>
      </section>
    </main>
  );
}