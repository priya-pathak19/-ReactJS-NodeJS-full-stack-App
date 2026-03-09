import { useState } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentStatus {
  agent: string;
  status: string;
  timestamp: string;
}

interface AgentResult {
  orchestratorPlan: string;
  frontendCode: string;
  backendCode: string;
  reviewFeedback: string;
  agentsUsed: string[];
}

interface GenerateResponse {
  success: boolean;
  statuses: AgentStatus[];
  result: AgentResult;
}

type TabKey = "plan" | "frontend" | "backend" | "review";

// ─── Agent colour map ─────────────────────────────────────────────────────────
const AGENT_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  orchestrator: { label: "Orchestrator", color: "#6366f1", icon: "🧠" },
  frontend: { label: "Frontend Agent", color: "#10b981", icon: "⚛️" },
  backend: { label: "Backend Agent", color: "#f59e0b", icon: "⚙️" },
  review: { label: "Review Agent", color: "#ef4444", icon: "🔍" },
  "frontend-skipped": { label: "Frontend Agent", color: "#c0c0cc", icon: "⏭️" },
  "backend-skipped": { label: "Backend Agent", color: "#c0c0cc", icon: "⏭️" },
  done: { label: "Done", color: "#10b981", icon: "✅" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AppGenerator() {
  const [appIdea, setAppIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("plan");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<TabKey | null>(null);

  const handleGenerate = async () => {
    if (!appIdea.trim()) return;
    setLoading(true);
    setStatuses([]);
    setResult(null);
    setError("");

    try {
      const { data } = await axios.post<GenerateResponse>(
        "http://localhost:5173/api/generate",
        { appIdea },
      );
      setStatuses(data.statuses);
      setResult(data.result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Something went wrong. Check your server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (tab: TabKey, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(tab);
    setTimeout(() => setCopied(null), 2000);
  };

  const allTabs: { key: TabKey; label: string; icon: string; agent: string }[] =
    [
      { key: "plan", label: "Plan", icon: "🧠", agent: "orchestrator" },
      { key: "frontend", label: "Frontend", icon: "⚛️", agent: "frontend" },
      { key: "backend", label: "Backend", icon: "⚙️", agent: "backend" },
      { key: "review", label: "Review", icon: "🔍", agent: "review" },
    ];

  // Only show tabs for agents that were actually used
  const tabs = result
    ? allTabs.filter(
        (t) =>
          t.agent === "orchestrator" ||
          t.agent === "review" ||
          result.agentsUsed.includes(t.agent),
      )
    : allTabs;

  const tabContent: Record<TabKey, string> = {
    plan: result?.orchestratorPlan || "",
    frontend: result?.frontendCode || "",
    backend: result?.backendCode || "",
    review: result?.reviewFeedback || "",
  };

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <span style={styles.logo}>⚡ AppForge</span>
        <span style={styles.subtitle}>Multi-Agent Full-Stack Generator</span>
      </header>

      {/* ── Two Column Body ── */}
      <div style={styles.body}>
        {/* ── LEFT PANEL ── */}
        <aside style={styles.leftPanel}>
          {/* Input */}
          <section style={styles.inputSection}>
            <label style={styles.label}>Describe your app idea</label>
            <textarea
              style={styles.textarea}
              placeholder="e.g. A todo app where users can create, complete, and delete tasks..."
              value={appIdea}
              onChange={(e) => setAppIdea(e.target.value)}
              rows={5}
              disabled={loading}
            />
            <button
              style={{
                ...styles.generateBtn,
                opacity: loading || !appIdea.trim() ? 0.5 : 1,
              }}
              onClick={handleGenerate}
              disabled={loading || !appIdea.trim()}
            >
              {loading ? <span style={styles.spinner}>⟳</span> : "Generate →"}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </section>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Agent Activity */}
          <section style={styles.statusSection}>
            <p style={styles.statusTitle}>Agent Activity</p>
            {statuses.length === 0 && !loading ? (
              <p style={styles.emptyState}>
                Agents will appear here once you generate...
              </p>
            ) : (
              <div style={styles.statusFeed}>
                {statuses.map((s, i) => {
                  const meta = AGENT_META[s.agent] || {
                    label: s.agent,
                    color: "#888",
                    icon: "●",
                  };
                  return (
                    <div key={i} style={styles.statusRow}>
                      <span
                        style={{ ...styles.statusDot, background: meta.color }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <span
                          style={{
                            color: meta.color,
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          {meta.icon} {meta.label}
                        </span>
                        <span style={styles.statusText}>{s.status}</span>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div style={styles.statusRow}>
                    <span
                      style={{
                        ...styles.statusDot,
                        background: "#6366f1",
                        animation: "pulse 1s infinite",
                      }}
                    />
                    <span
                      style={{
                        color: "#6366f1",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      Working...
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main style={styles.rightPanel}>
          {!result ? (
            <div style={styles.emptyRight}>
              <span style={styles.emptyIcon}>⚡</span>
              <p style={styles.emptyTitle}>
                Your generated code will appear here
              </p>
              <p style={styles.emptyHint}>
                Describe an app idea on the left and hit Generate
              </p>
            </div>
          ) : (
            <section style={styles.resultsSection}>
              {/* Tabs */}
              <div style={styles.tabBar}>
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    style={{
                      ...styles.tabBtn,
                      ...(activeTab === t.key ? styles.tabBtnActive : {}),
                    }}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Code Panel */}
              <div style={styles.codePanel}>
                <div style={styles.codePanelHeader}>
                  <span style={styles.codePanelTitle}>
                    {tabs.find((t) => t.key === activeTab)?.icon}{" "}
                    {tabs.find((t) => t.key === activeTab)?.label}
                  </span>
                  <button
                    style={styles.copyBtn}
                    onClick={() => handleCopy(activeTab, tabContent[activeTab])}
                  >
                    {copied === activeTab ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <pre style={styles.codeBlock}>
                  <code>{tabContent[activeTab]}</code>
                </pre>
              </div>
            </section>
          )}
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; background: #f5f5f7; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #ebebef; }
        ::-webkit-scrollbar-thumb { background: #c0c0cc; border-radius: 3px; }
        textarea:focus { border-color: #6366f1 !important; }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#f5f5f7",
    color: "#1a1a2e",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  header: {
    flexShrink: 0,
    borderBottom: "1px solid #e0e0ea",
    background: "#ffffff",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#6366f1",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 12,
    color: "#9090a8",
    borderLeft: "1px solid #e0e0ea",
    paddingLeft: 16,
  },

  // ── Two column body ──
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },

  // ── Left Panel ──
  leftPanel: {
    width: 320,
    flexShrink: 0,
    borderRight: "1px solid #e0e0ea",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    padding: 20,
    gap: 0,
  },
  inputSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 2,
    color: "#9090a8",
  },
  textarea: {
    background: "#f8f8fc",
    border: "1px solid #e0e0ea",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#1a1a2e",
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  },
  generateBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 0",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
    fontSize: 16,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    background: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: 6,
    padding: "8px 10px",
  },
  divider: {
    height: 1,
    background: "#e0e0ea",
    margin: "20px 0",
  },
  statusSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  statusTitle: {
    fontSize: 11,
    color: "#9090a8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  emptyState: {
    fontSize: 12,
    color: "#c0c0cc",
    lineHeight: 1.6,
  },
  statusFeed: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  statusRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: 3,
  },
  statusText: {
    fontSize: 11,
    color: "#9090a8",
  },

  // ── Right Panel ──
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#f5f5f7",
  },
  emptyRight: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    opacity: 0.35,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: 600,
  },
  emptyHint: {
    fontSize: 12,
    color: "#6060808",
  },
  resultsSection: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  tabBar: {
    display: "flex",
    gap: 2,
    background: "#ffffff",
    borderBottom: "1px solid #e0e0ea",
    padding: "6px 16px 0",
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "8px 14px",
    color: "#9090a8",
    fontFamily: "inherit",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabBtnActive: {
    color: "#6366f1",
    borderBottom: "2px solid #6366f1",
  },
  codePanel: {
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  codePanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid #e0e0ea",
    background: "#ffffff",
    flexShrink: 0,
  },
  codePanelTitle: {
    fontSize: 13,
    color: "#9090a8",
  },
  copyBtn: {
    background: "#f0f0f8",
    border: "1px solid #e0e0ea",
    borderRadius: 6,
    padding: "4px 12px",
    color: "#6060a0",
    fontFamily: "inherit",
    fontSize: 12,
    cursor: "pointer",
  },
  codeBlock: {
    padding: 20,
    overflowX: "auto",
    overflowY: "auto",
    flex: 1,
    minHeight: 0,
    fontSize: 13,
    lineHeight: 1.7,
    color: "#2a2a4a",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    background: "#fafafa",
  },
};
