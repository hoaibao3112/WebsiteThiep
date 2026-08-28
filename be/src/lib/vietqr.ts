/**
 * Utility sinh mã VietQR chuẩn Napas 247
 * Cú pháp Quicklink chuẩn: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
 */

export interface VietQrOptions {
  bankCode: string; // VD: "MB", "VCB", "ICB", "TCB", "ACB"
  accountNumber: string;
  accountName?: string;
  amount?: number;
  description?: string;
  template?: "compact2" | "compact" | "qr_only" | "print";
}

export function generateVietQrUrl(options: VietQrOptions): string {
  const {
    bankCode,
    accountNumber,
    accountName,
    amount,
    description,
    template = "compact2",
  } = options;

  const baseUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png`;
  const params = new URLSearchParams();

  if (amount && amount > 0) {
    params.append("amount", amount.toString());
  }

  if (description) {
    // Rút gọn và chuẩn hóa chuỗi mô tả (bỏ dấu tiếng Việt nếu cần cho QR)
    params.append("addInfo", description);
  }

  if (accountName) {
    params.append("accountName", accountName.toUpperCase());
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
