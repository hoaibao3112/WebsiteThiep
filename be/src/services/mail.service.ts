import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || `"CardVite" <no-reply@cardvite.vn>`;

// 8. [HIGH] Production guard: Bắt buộc cấu hình SMTP trên môi trường production
if (isProduction && (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)) {
  throw new Error(
    "[FATAL ERROR] Thiếu biến môi trường SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) trên môi trường Production!"
  );
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      service: host.includes("gmail") ? "gmail" : undefined,
      host: host.includes("gmail") ? undefined : host,
      port: host.includes("gmail") ? undefined : port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
}

export class MailService {
  /**
   * Gửi mã OTP xác thực tài khoản qua Email
   */
  static async sendOtpEmail(email: string, otp: string): Promise<void> {
    const subject = `[CardVite] Mã xác thực đăng ký tài khoản: ${otp}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 30px 15px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px 30px; border: 1px solid #EFE9E1; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; }
          .logo { font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #181716; letter-spacing: -0.5px; margin-bottom: 24px; }
          .title { font-size: 18px; font-weight: 600; color: #181716; margin-bottom: 12px; }
          .desc { font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 28px; }
          .otp-box { display: inline-block; background-color: #FAF2E4; border: 1.5px dashed #BE944E; border-radius: 16px; padding: 16px 36px; margin-bottom: 28px; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #8C6424; margin: 0; }
          .warning { font-size: 11px; color: #999999; line-height: 1.5; border-top: 1px solid #EFE9E1; pt: 20px; margin-top: 20px; }
          .footer { font-size: 10px; color: #AAAAAA; margin-top: 25px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">CardVite</div>
          <div class="title">Xác thực đăng ký tài khoản</div>
          <div class="desc">
            Chào mừng bạn đến với <strong>CardVite</strong> — Nền tảng thiệp điện tử cao cấp.<br/>
            Vui lòng sử dụng mã OTP dưới đây để hoàn tất đăng ký tài khoản:
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="desc" style="font-size: 12px; color: #8C6424;">
            Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>.
          </div>
          <div class="warning">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ của chúng tôi để bảo mật tài khoản.
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} CardVite. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"CardVite" <no-reply@cardvite.vn>`;

    if (transporter) {
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        html,
      });
      console.log(`[MailService] Đã gửi OTP thành công tới ${email}`);
    } else {
      // Fallback log chỉ được phép chạy khi không phải production
      if (!isProduction) {
        console.log(`\n======================================================`);
        console.log(`[DEV OTP FALLBACK] Gửi tới: ${email}`);
        console.log(`[DEV OTP CODE]     ===> ${otp} <===`);
        console.log(`[DEV OTP EXPIRES]  5 phút`);
        console.log(`======================================================\n`);
      }
    }
  }
}
