import { Resend } from 'resend';

let resend;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing in environment variables.');
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

export async function sendOne({ to, subject, body }) {
  const client = getResendClient();

  const html = body
    .split(/\r?\n/)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('');

  const { data, error } = await client.emails.send({
    from: process.env.MAIL_FROM || 'MAILFLOW <onboarding@resend.dev>',
    to,
    subject,
    text: body,
    html
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(error.message || 'Email sending failed');
  }

  console.log(`Email sent successfully to ${to}. ID: ${data.id}`);

  return data;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}