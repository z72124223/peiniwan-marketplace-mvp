export const INVITATION_WINDOW_SECONDS = 60;
export const DEMO_TWD_MINOR_PER_POINT = 100;

export type ProviderLiveStatus = "online" | "busy" | "offline";
export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type LiveInvitation = Readonly<{
  id: string;
  playerId: string;
  providerId: string;
  providerServiceId: string;
  pointsAmount: number;
  twdMinorPerPointSnapshot: number;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
}>;

export class LiveMarketplaceError extends Error {
  constructor(
    public readonly code:
      | "PROVIDER_NOT_ONLINE"
      | "INVITATION_ALREADY_RESOLVED"
      | "INVITATION_NOT_EXPIRED"
      | "INVITATION_EXPIRED"
      | "INVALID_POINTS",
    message: string
  ) {
    super(message);
    this.name = "LiveMarketplaceError";
  }
}

function dateFrom(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("時間格式無效。");
  }
  return date;
}

function requirePending(invitation: LiveInvitation) {
  if (invitation.status !== "pending") {
    throw new LiveMarketplaceError(
      "INVITATION_ALREADY_RESOLVED",
      "這筆邀請已經處理，不能重複變更。"
    );
  }
}

export function pointsFromPriceMinor(
  priceAmountMinor: number,
  twdMinorPerPoint = DEMO_TWD_MINOR_PER_POINT
) {
  if (
    !Number.isSafeInteger(priceAmountMinor) ||
    !Number.isSafeInteger(twdMinorPerPoint) ||
    priceAmountMinor <= 0 ||
    twdMinorPerPoint <= 0 ||
    priceAmountMinor % twdMinorPerPoint !== 0
  ) {
    throw new LiveMarketplaceError(
      "INVALID_POINTS",
      "服務價格必須能依目前示範匯率換算為整數點數。"
    );
  }
  return priceAmountMinor / twdMinorPerPoint;
}

export function createLiveInvitation(input: {
  id: string;
  playerId: string;
  providerId: string;
  providerServiceId: string;
  providerStatus: ProviderLiveStatus;
  pointsAmount: number;
  twdMinorPerPointSnapshot?: number;
  now: string | Date;
}): LiveInvitation {
  if (input.providerStatus !== "online") {
    throw new LiveMarketplaceError(
      "PROVIDER_NOT_ONLINE",
      "陪玩師目前不在線或正在處理其他邀請。"
    );
  }
  if (!Number.isSafeInteger(input.pointsAmount) || input.pointsAmount <= 0) {
    throw new LiveMarketplaceError(
      "INVALID_POINTS",
      "邀請點數必須是大於零的整數。"
    );
  }

  const rate = input.twdMinorPerPointSnapshot ?? DEMO_TWD_MINOR_PER_POINT;
  if (!Number.isSafeInteger(rate) || rate <= 0) {
    throw new LiveMarketplaceError("INVALID_POINTS", "點數匯率快照無效。");
  }

  const createdAt = dateFrom(input.now);
  const expiresAt = new Date(
    createdAt.getTime() + INVITATION_WINDOW_SECONDS * 1_000
  );

  return Object.freeze({
    id: input.id,
    playerId: input.playerId,
    providerId: input.providerId,
    providerServiceId: input.providerServiceId,
    pointsAmount: input.pointsAmount,
    twdMinorPerPointSnapshot: rate,
    status: "pending",
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    acceptedAt: null,
    resolvedAt: null,
  });
}

export function acceptLiveInvitation(
  invitation: LiveInvitation,
  now: string | Date
): LiveInvitation {
  requirePending(invitation);
  const acceptedAt = dateFrom(now);
  if (acceptedAt.getTime() >= dateFrom(invitation.expiresAt).getTime()) {
    throw new LiveMarketplaceError(
      "INVITATION_EXPIRED",
      "邀請已超過 60 秒，不能再接受。"
    );
  }

  return Object.freeze({
    ...invitation,
    status: "accepted",
    acceptedAt: acceptedAt.toISOString(),
    resolvedAt: acceptedAt.toISOString(),
  });
}

export function closeLiveInvitation(
  invitation: LiveInvitation,
  outcome: "declined" | "expired" | "cancelled",
  now: string | Date
): LiveInvitation {
  requirePending(invitation);
  const resolvedAt = dateFrom(now);
  if (
    outcome === "expired" &&
    resolvedAt.getTime() < dateFrom(invitation.expiresAt).getTime()
  ) {
    throw new LiveMarketplaceError(
      "INVITATION_NOT_EXPIRED",
      "邀請尚未滿 60 秒，不能提前標記逾時。"
    );
  }

  return Object.freeze({
    ...invitation,
    status: outcome,
    resolvedAt: resolvedAt.toISOString(),
  });
}

export function invitationSecondsRemaining(
  invitation: Pick<LiveInvitation, "expiresAt">,
  now: string | Date
) {
  const remainingMilliseconds =
    dateFrom(invitation.expiresAt).getTime() - dateFrom(now).getTime();
  return Math.max(
    0,
    Math.min(
      INVITATION_WINDOW_SECONDS,
      Math.ceil(remainingMilliseconds / 1_000)
    )
  );
}
