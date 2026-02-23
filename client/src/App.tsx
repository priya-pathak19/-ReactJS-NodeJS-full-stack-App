import { useEffect, useState } from "react";

export type SlackUserRole =
  | "PRIMARY_OWNER"
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "SINGLE_CHANNEL_GUEST"
  | "MULTI_CHANNEL_GUEST";

interface SlackUserBase {
  id: string;
  name: string;
  role: SlackUserRole;
  isActive: boolean;
  email?: never;
}

function App() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>();
  const [slackUsers, setSlackUsers] = useState<SlackUserBase[]>();

  // async function startWorkflow() {
  //   setLoading(true);
  //   setResult(null);

  //   const res = await fetch("/api/workflow/start", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name: "Temporal" }),
  //   });

  //   const data = await res.json();
  //   setResult(data.result);
  //   setLoading(false);
  // }

  async function start() {
    const res = await fetch("/api/workflow/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: "req-123" }),
    });

    const data = await res.json();
    setWorkflowId(data.workflowId);
  }

  useEffect(() => {
    if (!workflowId) return;
    if (status === "APPROVED" || status === "REJECTED") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/workflow/status/${workflowId}`);
      const data = await res.json();
      console.log(data, "data");
      setStatus(data.status);
    }, 2000);

    return () => clearInterval(interval);
  }, [workflowId, status]);

  async function approve() {
    await fetch(`/api/workflow/approve/${workflowId}`, {
      method: "POST",
    });
    setStatus("APPROVED"); // optimistic
  }

  async function approveSlack() {
    await fetch("/api/workflow/slack/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "priyapathak.work@gmail.com",
      }),
    });
    setStatus("APPROVED");
  }

  const fetchSlackUsers = async () => {
    const res = await fetch("/api/workflow/slack/users", {
      method: "POST",
    });

    const data = await res.json();
    setSlackUsers(data);
  };

  console.log(workflowId, status);

  return (
    <div>
      <button onClick={start}>Start Workflow</button>

      <p>{status}</p>

      <button onClick={approve}>Approve</button>

      <button onClick={fetchSlackUsers}>Fetch All Slack users</button>
      {slackUsers?.map((user) => (
        <div>
          <p>
            {user?.name} has role {user.role}
          </p>
          <p>{user.email}</p>
        </div>
      ))}

      <button onClick={approveSlack}>Notify Slack user</button>
    </div>
  );
}

export default App;
