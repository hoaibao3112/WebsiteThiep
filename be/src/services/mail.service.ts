import nodemailer from "nodemailer";
import { logger } from "../lib/logger";
import { mailCircuit } from "../lib/circuit-breaker";
import { escapeHtml } from "../lib/html";


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
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const isGmail = host.toLowerCase().includes("gmail") || (user && user.toLowerCase().includes("gmail"));
    return nodemailer.createTransport({
      service: isGmail ? "gmail" : undefined,
      host: isGmail ? undefined : host,
      port: isGmail ? 465 : port,
      secure: isGmail ? true : port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 6000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
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
      await mailCircuit.execute(() =>
        transporter.sendMail({ from: fromAddress, to: email, subject, html })
      );
      logger.info({ email }, "[MailService] Đã gửi OTP thành công");
    } else {
      if (!isProduction) {
        logger.info({ email, otp }, "[DEV OTP FALLBACK] Mã OTP");
      }
    }
  }

  /**
   * Gửi thông báo đăng ký thuê thiết kế riêng (Concierge) về Gmail của Admin/Chủ website
   */
  static async sendConciergeBookingEmail(data: {
    fullName: string;
    phone: string;
    email?: string;
    servicePackage?: string;
    favoriteTemplate?: string;
    notes?: string;
  }): Promise<void> {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "baohoaitran3112@gmail.com";
    const subject = `[CardVite Concierge] Khách hàng mới đăng ký thuê thiết kế: ${data.fullName} (${data.phone})`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 25px 15px; color: #181716; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 35px 30px; border: 1px solid #EFE9E1; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
          .header { text-align: center; border-bottom: 2px solid #F2E8D7; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #8C6424; letter-spacing: 1px; }
          .badge { display: inline-block; background: #FFF4DC; color: #8C6424; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-top: 8px; border: 1px solid #E6D0A6; }
          .title { font-size: 18px; font-weight: 700; color: #181716; margin: 15px 0 5px 0; text-align: center; }
          .table-info { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table-info td { padding: 12px 14px; border-bottom: 1px solid #F5EFE6; font-size: 13px; }
          .table-info td.label { font-weight: 600; color: #666666; width: 35%; background: #FAF7F2; border-radius: 8px 0 0 8px; }
          .table-info td.value { font-weight: 700; color: #181716; }
          .btn-group { text-align: center; margin-top: 30px; }
          .btn-zalo { display: inline-block; background: #0068FF; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 30px; margin-right: 10px; }
          .btn-phone { display: inline-block; background: #2D5A3B; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 30px; }
          .footer { font-size: 11px; color: #999999; text-align: center; margin-top: 30px; border-top: 1px solid #EFE9E1; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CardVite Concierge</div>
            <div class="badge">🔔 YÊU CẦU THIẾT KẾ RIÊNG MỚI</div>
            <div class="title">Thông Tin Khách Hàng Đăng Ký</div>
          </div>

          <table class="table-info">
            <tr>
              <td class="label">👤 Họ và Tên:</td>
              <td class="value">${escapeHtml(data.fullName)}</td>
            </tr>
            <tr>
              <td class="label">📞 Số điện thoại / Zalo:</td>
              <td class="value" style="color: #0068FF; font-size: 15px;">${escapeHtml(data.phone)}</td>
            </tr>
            <tr>
              <td class="label">✉️ Email:</td>
              <td class="value">${data.email ? escapeHtml(data.email) : "(Khách không cung cấp)"}</td>
            </tr>
            <tr>
              <td class="label">📦 Gói Dịch Vụ:</td>
              <td class="value" style="color: #8C6424;">${data.servicePackage ? escapeHtml(data.servicePackage) : "Bespoke (Thiết Kế Độc Bản)"}</td>
            </tr>
            <tr>
              <td class="label">🎨 Mẫu Yêu Thích:</td>
              <td class="value">${data.favoriteTemplate ? escapeHtml(data.favoriteTemplate) : "Không chọn"}</td>
            </tr>
            <tr>
              <td class="label">📝 Ghi Chú & Yêu Cầu:</td>
              <td class="value" style="font-weight: 500; line-height: 1.5;">${data.notes ? escapeHtml(data.notes) : "(Không có ghi chú thêm)"}</td>
            </tr>
            <tr>
              <td class="label">⏰ Thời Gian Gửi:</td>
              <td class="value" style="font-size: 12px; color: #777777;">${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
            </tr>
          </table>

          <div class="btn-group">
            <a href="https://zalo.me/${data.phone.replace(/[^0-9]/g, "")}" target="_blank" class="btn-zalo">💬 Nhắn Zalo Khách</a>
            <a href="tel:${data.phone.replace(/[^0-9]/g, "")}" class="btn-phone">📞 Gọi Điện Ngay</a>
          </div>

          <div class="footer">
            Hệ thống thông báo tự động từ CardVite Platform.<br/>
            © ${new Date().getFullYear()} CardVite. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"CardVite Concierge" <no-reply@cardvite.vn>`;

    if (transporter) {
      await mailCircuit.execute(() =>
        transporter.sendMail({ from: fromAddress, to: adminEmail, subject, html })
      );
      logger.info({ adminEmail }, "[MailService] Đã gửi Concierge email thành công");
    } else {
      logger.info(
        { adminEmail, customer: data.fullName, phone: data.phone },
        "[DEV CONCIERGE NOTIFICATION]"
      );
    }
  }

  /**
   * Gửi thông báo khi khách hàng xác nhận đã chuyển khoản ngân hàng về Gmail của Admin để duyệt
   */
  static async sendPaymentTransferNotificationEmail(data: {
    orderCode: string;
    amount: number;
    orderType: "PLAN" | "ADDON";
    itemName: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    submittedAt: Date;
    reviewUrl?: string;
  }): Promise<void> {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "baohoaitran3112@gmail.com";
    const subject = `🔔 [CardVite] Khách xác nhận chuyển khoản: ${data.orderCode} - ${data.amount.toLocaleString("vi-VN")} đ`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 25px 15px; color: #181716; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 35px 30px; border: 1px solid #EFE9E1; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
          .header { text-align: center; border-bottom: 2px solid #F2E8D7; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #8C6239; letter-spacing: 1px; }
          .badge { display: inline-block; background: #FFF4DC; color: #8C6239; font-size: 11px; font-weight: bold; padding: 5px 14px; border-radius: 20px; margin-top: 8px; border: 1px solid #E6D0A6; }
          .title { font-size: 20px; font-weight: 700; color: #181716; margin: 15px 0 5px 0; text-align: center; }
          .code-box { background-color: #FAF7F2; border: 1.5px dashed #C5A582; border-radius: 14px; padding: 14px 20px; text-align: center; margin: 20px 0; }
          .code-title { font-size: 11px; text-transform: uppercase; color: #8E7E70; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
          .code-val { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 800; color: #8C6239; letter-spacing: 2px; }
          .table-info { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .table-info td { padding: 12px 14px; border-bottom: 1px solid #F5EFE6; font-size: 13px; }
          .table-info td.label { font-weight: 600; color: #666666; width: 35%; background: #FAF7F2; border-radius: 8px 0 0 8px; }
          .table-info td.value { font-weight: 700; color: #181716; }
          .amount-highlight { font-size: 18px; color: #E82561; font-weight: 800; }
          .btn-group { text-align: center; margin-top: 30px; }
          .btn-approve { display: inline-block; background: #8C6239; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 30px; box-shadow: 0 4px 15px rgba(140,98,57,0.3); }
          .btn-zalo { display: inline-block; background: #0068FF; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 20px; border-radius: 30px; margin-left: 10px; }
          .footer { font-size: 11px; color: #999999; text-align: center; margin-top: 30px; border-top: 1px solid #EFE9E1; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CardVite Admin</div>
            <div class="badge">🔔 KHÁCH ĐÃ XÁC NHẬN CHUYỂN KHOẢN</div>
            <div class="title">Đơn Hàng Cần Duyệt Thanh Toán</div>
          </div>

          <div class="code-box">
            <div class="code-title">Mã Chuyển Khoản Đối Soát (Nội dung CK)</div>
            <div class="code-val">${escapeHtml(data.orderCode)}</div>
          </div>

          <table class="table-info">
            <tr>
              <td class="label">💰 Số Tiền Cần Nhận:</td>
              <td class="value"><span class="amount-highlight">${data.amount.toLocaleString("vi-VN")} đ</span></td>
            </tr>
            <tr>
              <td class="label">📦 Sản Phẩm / Gói:</td>
              <td class="value" style="color: #8C6239;">${escapeHtml(data.itemName)} (${data.orderType === "PLAN" ? "Gói Dịch Vụ" : "Tiện Ích Add-on"})</td>
            </tr>
            <tr>
              <td class="label">👤 Tên Khách Hàng:</td>
              <td class="value">${data.customerName ? escapeHtml(data.customerName) : "Khách hàng"}</td>
            </tr>
            <tr>
              <td class="label">✉️ Email Tài Khoản:</td>
              <td class="value">${data.customerEmail ? escapeHtml(data.customerEmail) : "Không có"}</td>
            </tr>
            <tr>
              <td class="label">📞 Điện Thoại / Zalo:</td>
              <td class="value" style="color: #0068FF;">${data.customerPhone ? escapeHtml(data.customerPhone) : "Chưa cập nhật"}</td>
            </tr>
            <tr>
              <td class="label">⏰ Thời Gian Khách Báo:</td>
              <td class="value" style="font-size: 12px; color: #777777;">${data.submittedAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
            </tr>
          </table>

          <div style="margin-top: 25px; padding: 14px; background: #FFF8EE; border-left: 4px solid #8C6239; border-radius: 8px; font-size: 12px; color: #6D5030; line-height: 1.5;">
            📌 <strong>Hướng dẫn duyệt:</strong> Vui lòng mở ứng dụng ngân hàng kiểm tra biến động số dư khớp với số tiền <strong>${data.amount.toLocaleString("vi-VN")} đ</strong> và mã nội dung <strong>${data.orderCode}</strong>, sau đó nhấn nút <strong>Duyệt Đơn Ngay</strong> bên dưới để hệ thống tự động kích hoạt tài khoản cho khách.
          </div>

          <div class="btn-group">
            <a href="${data.reviewUrl || "http://localhost:3000/dashboard/admin/payments"}" target="_blank" class="btn-approve">👉 Mở Trang Duyệt Đơn Ngay</a>
            ${data.customerPhone ? `<a href="https://zalo.me/${data.customerPhone.replace(/[^0-9]/g, "")}" target="_blank" class="btn-zalo">💬 Nhắn Zalo Khách</a>` : ""}
          </div>

          <div class="footer">
            Thông báo tự động từ Hệ thống Quản trị CardVite Platform.<br/>
            Gửi tới quản trị viên: baohoaitran3112@gmail.com
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"CardVite Payment" <no-reply@cardvite.vn>`;

    if (transporter) {
      await mailCircuit.execute(() =>
        transporter.sendMail({ from: fromAddress, to: adminEmail, subject, html })
      );
      logger.info({ adminEmail, orderCode: data.orderCode }, "[MailService] Đã gửi thông báo xác nhận chuyển khoản tới admin thành công");
    } else {
      logger.info(
        { adminEmail, orderCode: data.orderCode, amount: data.amount },
        "[DEV PAYMENT TRANSFER NOTIFICATION]"
      );
    }
  }
}

