
import { createTransport } from 'nodemailer';

const transport = createTransport({
  host: "0.0.0.0",
  port: 5000,
  secure: false,
  tls: {
    rejectUnauthorized: false
  },
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

export async function createEmailDraft({ to, subject, body, attachments }: {
  to: string;
  subject: string;
  body: string;
  attachments?: Express.Multer.File[];
}) {
  const mailOptions = {
    to,
    subject,
    html: body,
    attachments: attachments?.map(file => ({
      filename: file.originalname,
      content: file.buffer
    }))
  };

  await transport.sendMail(mailOptions);
}
