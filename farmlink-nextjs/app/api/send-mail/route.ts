import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAIL_RELAY_SECRET = process.env.MAIL_RELAY_SECRET || 'agrenza_secret_mail_relay_2026';
const GMAIL_USER = process.env.GMAIL_USER || 'ravananm913@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'navuecckbdmzvuca';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, attachments, secret } = body;

    if (secret !== MAIL_RELAY_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized relay access' }, { status: 401 });
    }

    if (!to || !subject || !html) {
      return NextResponse.json({ ok: false, error: 'Missing required mail fields (to, subject, html)' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    const mailOptions: {
      from: string;
      to: string;
      subject: string;
      html: string;
      attachments?: Array<{ filename: string; content: string; contentType?: string }>;
    } = {
      from: `"Agrenza" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    if (Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att: any) => ({
        filename: att.name || 'attachment.txt',
        content: att.content || '',
        contentType: att.type || 'text/plain',
      }));
    }

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      envelope: info.envelope,
    });
  } catch (error: any) {
    console.error('Relay sendMail error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Failed to send email via relay',
      },
      { status: 500 }
    );
  }
}
