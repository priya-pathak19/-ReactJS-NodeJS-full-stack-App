import { useState } from "react";
import "./styles.css";
import { Sidebar } from "./components/SideBar";
import { ApprovalPanel } from "./components/ApprovalPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("approval");

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />

      <main className="main-content">
        {activeTab === "approval" && <ApprovalPanel />}
      </main>
    </div>
  );
}
