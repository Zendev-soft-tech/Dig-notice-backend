import nodemailer from "nodemailer";
import { Logger } from "../shared/logger";
import { config } from "../config";

const { smtp } = config;

const transporter = nodemailer.createTransport({
  service: smtp.host.includes("gmail") ? "gmail" : undefined,
  host: !smtp.host.includes("gmail") ? smtp.host : undefined,
  port: smtp.port,
  secure: smtp.port === 465,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

export const sendWelcomeInvite = async (email: string, name: string, password: string): Promise<void> => {
  const loginUrl = process.env.LOGIN_URL || "http://localhost:3000/login";
  const fromAddress = smtp.from;

  const subject = "Welcome to Digital Notice Board - Your Account is Ready";
  
  const html = `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
            body { 
                background: #0f172a; 
                color: #e2e8f0; 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 0; 
            }
            .wrapper {
                background-color: #0f172a;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #1e293b; 
                border-radius: 16px; 
                overflow: hidden; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
                border: 1px solid rgba(255,255,255,0.05);
            }
            .header { 
                background: linear-gradient(135deg, #1e40af, #3b82f6); 
                padding: 40px 32px; 
                text-align: center;
                color: #ffffff; 
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.025em;
            }
            .content { 
                padding: 40px 32px; 
            }
            .greeting { 
                font-size: 18px;
                font-weight: 600;
                color: #f8fafc;
                margin-bottom: 16px; 
            }
            .message {
                font-size: 16px;
                line-height: 1.6;
                color: #94a3b8;
                margin-bottom: 32px;
            }
            .credentials-card { 
                background: rgba(15, 23, 42, 0.5); 
                border: 1px solid rgba(255,255,255,0.1); 
                padding: 24px; 
                border-radius: 12px; 
                margin-bottom: 32px; 
                text-align: center;
            }
            .label {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #64748b;
                margin-bottom: 8px;
                display: block;
            }
            .password { 
                font-family: 'JetBrains Mono', 'Fira Code', monospace; 
                font-size: 28px; 
                color: #3b82f6; 
                font-weight: 700;
                letter-spacing: 1px;
            }
            .btn-container {
                text-align: center;
                margin-top: 8px;
            }
            .btn { 
                display: inline-block; 
                padding: 16px 32px; 
                background: #3b82f6; 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 700; 
                font-size: 16px;
                transition: all 0.2s;
                box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
            }
            .footer { 
                padding: 24px 32px; 
                background: #111827; 
                color: #475569; 
                font-size: 13px; 
                text-align: center;
            }
            .footer p { margin: 4px 0; }
            a { color: #3b82f6; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1>DIGITAL NOTICE BOARD</h1>
                </div>
                <div class="content">
                    <div class="greeting">Hello ${name},</div>
                    <div class="message">
                        Welcome to the official Digital Notice Board. Your account has been successfully created. 
                        You can now access your dashboard to view notices, updates, and more.
                    </div>
     
                    <div class="credentials-card">
                        <span class="label">Your Temporary Password</span>
                        <div class="password">${password}</div>
                    </div>
     
                    <div class="btn-container">
                        <a href="${loginUrl}" class="btn">Login to Your Portal</a>
                    </div>
     
                    <div style="margin-top: 32px; color: #64748b; font-size: 14px; text-align: center;">
                        For security, we recommend changing your password after your first login.
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated message from the Digital Notice Board System.</p>
                    <p>&copy; 2024 Digital Notice Board. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: subject,
      html: html,
      text: `Hello ${name},\n\nWelcome to Digital Notice Board. Your temporary password is: ${password}\n\nLogin here: ${loginUrl}`,
    });
    Logger.info(`Successfully sent welcome email to ${email}`);
  } catch (error) {
    Logger.error(`Error sending welcome email to ${email}:`, error);
    // We don't throw here to avoid failing user creation if email fails
  }
};

export default { sendWelcomeInvite };
