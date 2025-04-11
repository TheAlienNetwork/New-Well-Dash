
import { createTransport } from 'nodemailer';

const transport = createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
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
