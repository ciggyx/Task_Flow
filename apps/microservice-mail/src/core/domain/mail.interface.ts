export interface MailAdapter {
  sendMail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void>;
}
