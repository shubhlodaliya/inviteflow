// Generate OTP Email HTML Template
const generateOTPEmail = (otp) => {
  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .otp-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .otp-code {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: 8px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
        }
        .validity {
          font-size: 14px;
          margin-top: 15px;
          opacity: 0.95;
        }
        .message {
          font-size: 16px;
          color: #555;
          margin-bottom: 20px;
          line-height: 1.8;
        }
        .timestamp {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 13px;
          color: #666;
          border-left: 4px solid #667eea;
        }
        .warning {
          background-color: #fff3cd;
          color: #856404;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 13px;
          border-left: 4px solid #ffc107;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #eee;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🔐 InviteFlow</h1>
          <p style="margin: 0; font-size: 14px;">Email Verification</p>
        </div>
        
        <div class="content">
          <p class="message">
            Hello,<br>
            We've received a request to verify your email address. Use the One-Time Password (OTP) below to complete your verification.
          </p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <div class="validity">
              ⏱️ Valid for <strong>5 minutes</strong>
            </div>
          </div>
          
          <div class="timestamp">
            📅 <strong>Generated:</strong> ${currentTime}
          </div>
          
          <div class="warning">
            ⚠️ <strong>Important:</strong> Never share this OTP with anyone. Our team will never ask for it.
          </div>
          
          <p class="message" style="margin-top: 30px; font-size: 13px; color: #999;">
            If you didn't request this code, please ignore this email or contact support immediately.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>InviteFlow Security Team</strong></p>
          <p>© 2026 InviteFlow. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateOTPEmail };
