import sgMail from "@sendgrid/mail";
import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export async function sendApprovalEmail(
  requestId: string,
  approverEmail: string,
) {
  const approveUrl = `http://localhost:3000/api/workflow/approve/${requestId}`;
  const rejectUrl = `http://localhost:3000/api/workflow/reject/${requestId}`;

  const msg = {
    to: approverEmail,
    from: "priyapathak.work@gmail.com",
    subject: "Approval Required",
    html: `
      <h3>Approval Needed</h3>
      <p>Please approve or reject the request.</p>
      <p>
        <a href="${approveUrl}" style="color: green;">✅ Approve</a>
        &nbsp;|&nbsp;
        <a href="${rejectUrl}" style="color: red;">❌ Reject</a>
      </p>
    `,
  };

  console.log(msg);

  await sgMail.send(msg);

  console.log("📧 Approval email sent to", approverEmail);
}
