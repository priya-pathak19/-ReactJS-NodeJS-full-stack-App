export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export async function sendApprovalEmail(requestId: string) {
  console.log(`📧 Sending approval email for request ${requestId}`);
  // Call email service here (SendGrid, SES, etc.)
}
