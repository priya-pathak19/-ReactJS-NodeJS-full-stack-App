type SidebarProps = {
  activeTab: string;
  onSelect: (tab: string) => void;
};

export function Sidebar({ activeTab, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Workflow</h2>

      <button
        className={`sidebar-item ${activeTab === "approval" ? "active" : ""}`}
        onClick={() => onSelect("approval")}
      >
        ✅ Approval
      </button>
      <button
        className={`sidebar-item ${activeTab === "askllm" ? "active" : ""}`}
        onClick={() => onSelect("askllm")}
      >
        💬 Ask LLM
      </button>
    </aside>
  );
}
