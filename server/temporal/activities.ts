import sgMail from "@sendgrid/mail";
import "dotenv/config";
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export async function sendApprovalEmail(
  requestId: string,
  approverEmail: string,
) {
  const slackTriggerUrl = `http://localhost:3000/api/workflow/email-click/${requestId}`;

  const msg = {
    to: approverEmail,
    from: "priyapathak.work@gmail.com",
    subject: "Approval Required",
    html: `
      <h3>Approval Needed</h3>
      <p>Please approve or reject the request.</p>
      <p>
      <a href="${slackTriggerUrl}">
        🔔 Open Slack Approval
      </a>
      </p>
    `,
  };

  console.log(msg);

  await sgMail.send(msg);

  console.log("Approval email sent to", approverEmail);
}

// SLACK-TEST-------------

// Fetch slack users
export async function fetchSlackUsers() {
  const users: any[] = [];
  let cursor: string | undefined;

  do {
    const res = await slack.users.list({
      limit: 20,
      cursor,
    });

    for (const u of res.members ?? []) {
      if (u.deleted) continue;

      users.push({
        id: u.id,
        name: u.real_name,
        email: u.profile?.email,
        role: getRole(u),
        isActive: !u.deleted,
      });
    }

    cursor = res.response_metadata?.next_cursor;
  } while (cursor);

  return users;
}

function getRole(user: any) {
  if (user.is_primary_owner) return "PRIMARY_OWNER";
  if (user.is_owner) return "OWNER";
  if (user.is_admin) return "ADMIN";
  if (user.is_ultra_restricted) return "SINGLE_CHANNEL_GUEST";
  if (user.is_restricted) return "MULTI_CHANNEL_GUEST";
  return "MEMBER";
}

export async function sendSlackDMByEmail(email: string, message: string) {
  // 1. Find user by email
  const userRes = await slack.users.lookupByEmail({ email });
  const userId = userRes.user.id;

  // 2. Open DM
  const dm = await slack.conversations.open({
    users: userId,
  });

  // 3. Send message
  await slack.chat.postMessage({
    channel: dm.channel.id,
    text: message,
  });
}

export async function sendSlackApprovalMessage(
  email: string,
  requestId: string,
) {
  const userRes = await slack.users.lookupByEmail({ email });
  const userId = userRes.user.id;

  const dm = await slack.conversations.open({ users: userId });

  await slack.chat.postMessage({
    channel: dm.channel.id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Approval required*\nRequest ID: ${requestId}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "✅ Approve" },
            style: "primary",
            action_id: "approve",
            value: requestId,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "❌ Reject" },
            style: "danger",
            action_id: "reject",
            value: requestId,
          },
        ],
      },
    ],
  });
}

export async function sendFinalResultEmail(
  approverEmail: string,
  requestId: string,
  decision: "APPROVED" | "REJECTED",
) {
  await sgMail.send({
    to: approverEmail,
    from: "priyapathak.work@gmail.com",
    subject: `Request ${decision}`,
    html: `
      <h3>Request ${decision}</h3>
      <p>Request ID: ${requestId}</p>
    `,
  });
}
