export type AdapterResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: "not_configured" | "rejected" | "unavailable"; message: string };

export interface PaymentGateway {
  createAuthorization(input: {
    orderId: string;
    amountMinor: number;
    currency: string;
  }): Promise<AdapterResult<{ paymentReference: string; checkoutUrl: string }>>;
  refund(input: {
    orderId: string;
    paymentReference: string;
    amountMinor: number;
  }): Promise<AdapterResult<{ refundReference: string }>>;
}

export interface IdentityVerificationProvider {
  createAdultVerification(input: {
    userId: string;
    region: string;
  }): Promise<AdapterResult<{ verificationReference: string; redirectUrl: string }>>;
  getResult(
    verificationReference: string
  ): Promise<AdapterResult<{ status: "pending" | "verified" | "rejected" }>>;
}

export interface StorageProvider {
  createUpload(input: {
    ownerId: string;
    purpose: "profile_photo" | "voice_sample" | "skill_proof" | "dispute_evidence";
    contentType: string;
  }): Promise<AdapterResult<{ storageKey: string; uploadUrl: string }>>;
  createReadUrl(storageKey: string): Promise<AdapterResult<{ readUrl: string }>>;
}

export interface CaptchaProvider {
  verify(token: string, remoteAddress?: string): Promise<AdapterResult<{ valid: true }>>;
}

export interface NotificationProvider {
  send(input: {
    recipient: string;
    template: string;
    variables: Record<string, string>;
  }): Promise<AdapterResult<{ notificationReference: string }>>;
}

export interface MessagingProvider {
  createSupportHandoff(input: {
    supportCaseId: string;
    region: string;
    channel: "line" | "discord" | "wechat" | "qq" | "in_app";
  }): Promise<AdapterResult<{ handoffUrl: string }>>;
}
