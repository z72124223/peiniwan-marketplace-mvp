import type {
  AdapterResult,
  CaptchaProvider,
  IdentityVerificationProvider,
  MessagingProvider,
  NotificationProvider,
  PaymentGateway,
  StorageProvider,
} from "./contracts";

function unavailable<T>(name: string): AdapterResult<T> {
  return {
    ok: false,
    code: "not_configured",
    message: `${name} 尚未設定；本版不會建立真實交易或外部聯繫。`,
  };
}

export const notConfiguredPaymentGateway: PaymentGateway = {
  async createAuthorization() {
    return unavailable("正式金流");
  },
  async refund() {
    return unavailable("正式退款");
  },
};

export const notConfiguredIdentityProvider: IdentityVerificationProvider = {
  async createAdultVerification() {
    return unavailable("KYC／成人身分驗證");
  },
  async getResult() {
    return unavailable("KYC／成人身分驗證");
  },
};

export const notConfiguredStorageProvider: StorageProvider = {
  async createUpload() {
    return unavailable("正式檔案上傳");
  },
  async createReadUrl() {
    return unavailable("正式檔案讀取");
  },
};

export const notConfiguredCaptchaProvider: CaptchaProvider = {
  async verify() {
    return unavailable("人機驗證");
  },
};

export const notConfiguredNotificationProvider: NotificationProvider = {
  async send() {
    return unavailable("外部通知");
  },
};

export const notConfiguredMessagingProvider: MessagingProvider = {
  async createSupportHandoff() {
    return unavailable("外部通訊");
  },
};
