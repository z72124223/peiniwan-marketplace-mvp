import { getD1 } from "@/db";
import {
  acceptLiveInvitation,
  closeLiveInvitation,
  createLiveInvitation,
  pointsFromPriceMinor,
  type InvitationStatus,
  type LiveInvitation,
  LiveMarketplaceError,
} from "@/lib/live-marketplace";
import {
  holdWalletPoints,
  releaseWalletHold,
  type WalletCreditBalance,
} from "@/lib/wallet";

export const DEMO_PLAYER_ID = "user_player_demo";
const DEMO_PLAYER_WALLET_ID = "wallet_player_demo";

type ProviderRow = {
  id: string;
  display_name: string;
  primary_photo_url: string;
  online_status: "online" | "busy" | "offline";
  profile_status: "active" | "paused" | "banned";
  shift_id: string | null;
  service_id: string;
  service_title: string;
  billing_unit: "per_game" | "per_30_minutes" | "per_60_minutes" | "package";
  price_amount_minor: number;
};

type WalletRow = {
  id: string;
  available_points: number;
  held_points: number;
  pending_points: number;
  redeemable_points: number;
  frozen_points: number;
};

type InvitationRow = {
  id: string;
  shift_id: string;
  player_id: string;
  provider_id: string;
  provider_service_id: string;
  player_wallet_account_id: string;
  status: InvitationStatus;
  points_amount: number;
  twd_minor_per_point_snapshot: number;
  expires_at: string;
  accepted_at: string | null;
  resolved_at: string | null;
  created_at: string;
  provider_name: string;
  service_title: string;
  order_id: string | null;
};

export type LiveProviderView = Readonly<{
  id: string;
  displayName: string;
  photoUrl: string;
  status: "online" | "busy" | "offline";
  activeShiftId: string | null;
  serviceId: string;
  serviceTitle: string;
  billingUnit: ProviderRow["billing_unit"];
  points: number;
}>;

export type LiveInvitationView = Readonly<{
  id: string;
  providerId: string;
  providerName: string;
  serviceTitle: string;
  points: number;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
  orderId: string | null;
}>;

export type LiveMarketplaceSnapshot = Readonly<{
  serverNow: string;
  player: {
    id: string;
    availablePoints: number;
    heldPoints: number;
  };
  providers: LiveProviderView[];
  invitations: LiveInvitationView[];
}>;

export class LiveMarketplaceStoreError extends Error {
  constructor(
    public readonly code:
      | "NOT_FOUND"
      | "INVALID_STATE"
      | "INSUFFICIENT_POINTS"
      | "CONFLICT",
    message: string
  ) {
    super(message);
    this.name = "LiveMarketplaceStoreError";
  }
}

function walletBalance(row: WalletRow): WalletCreditBalance {
  return Object.freeze({
    available: row.available_points,
    held: row.held_points,
    pending: row.pending_points,
    redeemable: row.redeemable_points,
    frozen: row.frozen_points,
  });
}

function invitationFromRow(row: InvitationRow): LiveInvitation {
  return Object.freeze({
    id: row.id,
    playerId: row.player_id,
    providerId: row.provider_id,
    providerServiceId: row.provider_service_id,
    pointsAmount: row.points_amount,
    twdMinorPerPointSnapshot: row.twd_minor_per_point_snapshot,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    resolvedAt: row.resolved_at,
  });
}

async function readWallet() {
  const wallet = await getD1()
    .prepare(
      `SELECT id, available_points, held_points, pending_points,
              redeemable_points, frozen_points
       FROM wallet_credit_accounts
       WHERE id = ? AND owner_user_id = ? AND status = 'active'`
    )
    .bind(DEMO_PLAYER_WALLET_ID, DEMO_PLAYER_ID)
    .first<WalletRow>();
  if (!wallet) {
    throw new LiveMarketplaceStoreError(
      "NOT_FOUND",
      "Demo 玩家錢包尚未建立，請先套用最新 migration。"
    );
  }
  return wallet;
}

async function readInvitation(id: string) {
  const row = await getD1()
    .prepare(
      `SELECT i.*, p.display_name AS provider_name,
              s.title AS service_title
       FROM provider_invitations i
       JOIN provider_profiles p ON p.id = i.provider_id
       JOIN provider_services s ON s.id = i.provider_service_id
       WHERE i.id = ?`
    )
    .bind(id)
    .first<InvitationRow>();
  if (!row) {
    throw new LiveMarketplaceStoreError("NOT_FOUND", "找不到這筆邀請。");
  }
  return row;
}

function mapProvider(row: ProviderRow): LiveProviderView {
  return Object.freeze({
    id: row.id,
    displayName: row.display_name,
    photoUrl: row.primary_photo_url,
    status: row.shift_id ? row.online_status : "offline",
    activeShiftId: row.shift_id,
    serviceId: row.service_id,
    serviceTitle: row.service_title,
    billingUnit: row.billing_unit,
    points: pointsFromPriceMinor(row.price_amount_minor),
  });
}

function mapInvitation(row: InvitationRow): LiveInvitationView {
  return Object.freeze({
    id: row.id,
    providerId: row.provider_id,
    providerName: row.provider_name,
    serviceTitle: row.service_title,
    points: row.points_amount,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    resolvedAt: row.resolved_at,
    orderId: row.order_id,
  });
}

export async function clockInProvider(providerId: string, now = new Date()) {
  const d1 = getD1();
  const provider = await d1
    .prepare(
      `SELECT id, online_status, status
       FROM provider_profiles
       WHERE id = ?`
    )
    .bind(providerId)
    .first<{
      id: string;
      online_status: "online" | "busy" | "offline";
      status: "active" | "paused" | "banned";
    }>();
  if (!provider) {
    throw new LiveMarketplaceStoreError("NOT_FOUND", "找不到陪玩師。");
  }
  if (provider.status !== "active" || provider.online_status === "busy") {
    throw new LiveMarketplaceStoreError(
      "INVALID_STATE",
      "陪玩師目前不能打卡上線。"
    );
  }

  const active = await d1
    .prepare(
      `SELECT id FROM provider_shifts
       WHERE provider_id = ? AND status = 'online'`
    )
    .bind(providerId)
    .first<{ id: string }>();
  if (active) {
    return active.id;
  }

  const shiftId = `shift_${crypto.randomUUID()}`;
  const timestamp = now.toISOString();
  await d1.batch([
    d1
      .prepare(
        `INSERT INTO provider_shifts
          (id, provider_id, status, clocked_in_at, created_at, updated_at)
         VALUES (?, ?, 'online', ?, ?, ?)`
      )
      .bind(shiftId, providerId, timestamp, timestamp, timestamp),
    d1
      .prepare(
        `UPDATE provider_profiles
         SET online_status = CASE
               WHEN status = 'active' AND online_status <> 'busy' THEN 'online'
               ELSE NULL
             END,
             last_active_at = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(timestamp, timestamp, providerId),
  ]);
  return shiftId;
}

export async function clockOutProvider(providerId: string, now = new Date()) {
  const pending = await getD1()
    .prepare(
      `SELECT id FROM provider_invitations
       WHERE provider_id = ? AND status = 'pending'`
    )
    .bind(providerId)
    .first<{ id: string }>();
  if (pending) {
    await closeProviderInvitation(pending.id, "declined", now);
    return;
  }

  const d1 = getD1();
  const timestamp = now.toISOString();
  const provider = await d1
    .prepare("SELECT online_status FROM provider_profiles WHERE id = ?")
    .bind(providerId)
    .first<{ online_status: "online" | "busy" | "offline" }>();
  if (!provider) {
    throw new LiveMarketplaceStoreError("NOT_FOUND", "找不到陪玩師。");
  }
  if (provider.online_status === "busy") {
    throw new LiveMarketplaceStoreError(
      "INVALID_STATE",
      "已接受邀請的陪玩師需保留目前訂單，本輪不能直接下線。"
    );
  }

  await d1.batch([
    d1
      .prepare(
        `UPDATE provider_shifts
         SET status = 'ended', clocked_out_at = ?, ended_reason = 'manual', updated_at = ?
         WHERE provider_id = ? AND status = 'online'`
      )
      .bind(timestamp, timestamp, providerId),
    d1
      .prepare(
        `UPDATE provider_profiles
         SET online_status = CASE
               WHEN online_status <> 'busy' THEN 'offline'
               ELSE NULL
             END,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(timestamp, providerId),
  ]);
}

export async function inviteProvider(input: {
  providerId: string;
  providerServiceId: string;
  now?: Date;
}) {
  const d1 = getD1();
  const now = input.now ?? new Date();
  const provider = await d1
    .prepare(
      `SELECT p.id, p.display_name, p.primary_photo_url,
              p.online_status, p.status AS profile_status,
              sh.id AS shift_id, s.id AS service_id,
              s.title AS service_title, s.billing_unit, s.price_amount_minor
       FROM provider_profiles p
       JOIN provider_shifts sh
         ON sh.provider_id = p.id AND sh.status = 'online'
       JOIN provider_services s
         ON s.provider_id = p.id AND s.enabled = 1
       WHERE p.id = ? AND s.id = ?`
    )
    .bind(input.providerId, input.providerServiceId)
    .first<ProviderRow>();
  if (!provider || !provider.shift_id) {
    throw new LiveMarketplaceStoreError(
      "INVALID_STATE",
      "陪玩師目前沒有在線班次。"
    );
  }

  const points = pointsFromPriceMinor(provider.price_amount_minor);
  const wallet = await readWallet();
  if (wallet.available_points < points) {
    throw new LiveMarketplaceStoreError(
      "INSUFFICIENT_POINTS",
      "Demo 玩家可用點數不足。"
    );
  }

  const invitationId = `invite_${crypto.randomUUID()}`;
  const holdEntryId = `wallet_entry_${crypto.randomUUID()}`;
  const invitation = createLiveInvitation({
    id: invitationId,
    playerId: DEMO_PLAYER_ID,
    providerId: input.providerId,
    providerServiceId: input.providerServiceId,
    providerStatus: provider.online_status,
    pointsAmount: points,
    now,
  });
  const held = holdWalletPoints({
    accountId: wallet.id,
    currentBalance: walletBalance(wallet),
    points,
    twdMinorPerPointSnapshot: invitation.twdMinorPerPointSnapshot,
    referenceType: "provider_invitation",
    referenceId: invitationId,
    idempotencyKey: `hold:${invitationId}`,
    reason: "玩家送出 60 秒陪玩邀請",
  });
  const timestamp = invitation.createdAt;

  try {
    await d1.batch([
      d1
        .prepare(
          `UPDATE provider_profiles
           SET online_status = CASE WHEN online_status = 'online' THEN 'busy' ELSE NULL END,
               updated_at = ?
           WHERE id = ?`
        )
        .bind(timestamp, input.providerId),
      d1
        .prepare(
          `UPDATE wallet_credit_accounts
           SET available_points = CASE WHEN available_points >= ? THEN available_points - ? ELSE -1 END,
               held_points = held_points + ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(points, points, points, timestamp, wallet.id),
      d1
        .prepare(
          `INSERT INTO wallet_credit_entries
            (id, account_id, event_type, points_amount,
             available_delta_points, held_delta_points,
             available_after_points, held_after_points, pending_after_points,
             redeemable_after_points, frozen_after_points,
             twd_value_minor, twd_minor_per_point_snapshot,
             reference_type, reference_id, idempotency_key, reason, created_at)
           VALUES (?, ?, 'order_hold', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          holdEntryId,
          wallet.id,
          points,
          -points,
          points,
          held.balanceAfter.available,
          held.balanceAfter.held,
          held.balanceAfter.pending,
          held.balanceAfter.redeemable,
          held.balanceAfter.frozen,
          held.twdValueMinor,
          invitation.twdMinorPerPointSnapshot,
          "provider_invitation",
          invitationId,
          `hold:${invitationId}`,
          "玩家送出 60 秒陪玩邀請",
          timestamp
        ),
      d1
        .prepare(
          `INSERT INTO provider_invitations
            (id, shift_id, player_id, provider_id, provider_service_id,
             player_wallet_account_id, hold_entry_id, status, points_amount,
             twd_minor_per_point_snapshot, expires_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`
        )
        .bind(
          invitationId,
          provider.shift_id,
          DEMO_PLAYER_ID,
          input.providerId,
          input.providerServiceId,
          wallet.id,
          holdEntryId,
          points,
          invitation.twdMinorPerPointSnapshot,
          invitation.expiresAt,
          timestamp,
          timestamp
        ),
    ]);
  } catch (error) {
    if (error instanceof Error && /UNIQUE|NOT NULL|CHECK/.test(error.message)) {
      throw new LiveMarketplaceStoreError(
        "CONFLICT",
        "狀態已被其他操作更新，請重新整理後再試。"
      );
    }
    throw error;
  }
  return invitationId;
}

export async function acceptProviderInvitation(id: string, now = new Date()) {
  const row = await readInvitation(id);
  const accepted = acceptLiveInvitation(invitationFromRow(row), now);
  const d1 = getD1();
  const orderId = `order_${crypto.randomUUID()}`;
  const grossAmountMinor =
    row.points_amount * row.twd_minor_per_point_snapshot;
  const platformFeeAmountMinor = Math.round(grossAmountMinor * 0.1);
  const providerNetAmountMinor = grossAmountMinor - platformFeeAmountMinor;
  const timestamp = accepted.acceptedAt!;

  try {
    await d1.batch([
      d1
        .prepare(
          `INSERT INTO orders
            (id, player_id, provider_id, provider_service_id, region_code,
             requested_start_at, status, acquisition_source, currency,
             gross_amount_minor, platform_fee_rate_bps_snapshot,
             platform_fee_amount_minor_snapshot,
             payment_processing_fee_minor_snapshot,
             provider_net_amount_minor_snapshot, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'TW', ?, 'confirmed', 'organic_platform', 'TWD',
                   ?, 1000, ?, 0, ?, ?, ?)`
        )
        .bind(
          orderId,
          row.player_id,
          row.provider_id,
          row.provider_service_id,
          timestamp,
          grossAmountMinor,
          platformFeeAmountMinor,
          providerNetAmountMinor,
          timestamp,
          timestamp
        ),
      d1
        .prepare(
          `UPDATE provider_invitations
           SET status = CASE
                 WHEN status = 'pending' AND expires_at > ? THEN 'accepted'
                 ELSE NULL
               END,
               order_id = ?, accepted_at = ?, resolved_at = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(timestamp, orderId, timestamp, timestamp, timestamp, id),
    ]);
  } catch (error) {
    if (error instanceof Error && /NOT NULL|UNIQUE|CHECK/.test(error.message)) {
      throw new LiveMarketplaceStoreError(
        "CONFLICT",
        "邀請已經處理或逾時，不能重複接受。"
      );
    }
    throw error;
  }
  return orderId;
}

export async function closeProviderInvitation(
  id: string,
  outcome: "declined" | "expired",
  now = new Date()
) {
  const row = await readInvitation(id);
  const closed = closeLiveInvitation(invitationFromRow(row), outcome, now);
  const wallet = await readWallet();
  const released = releaseWalletHold({
    accountId: wallet.id,
    currentBalance: walletBalance(wallet),
    points: row.points_amount,
    twdMinorPerPointSnapshot: row.twd_minor_per_point_snapshot,
    referenceType: "provider_invitation",
    referenceId: row.id,
    idempotencyKey: `release:${row.id}`,
    reason:
      outcome === "expired"
        ? "60 秒內未接受，返還玩家點數"
        : "陪玩師拒絕邀請，返還玩家點數",
  });
  const d1 = getD1();
  const releaseEntryId = `wallet_entry_${crypto.randomUUID()}`;
  const timestamp = closed.resolvedAt!;
  const endedReason =
    outcome === "expired" ? "invitation_expired" : "invitation_declined";

  try {
    await d1.batch([
      d1
        .prepare(
          `UPDATE wallet_credit_accounts
           SET held_points = CASE WHEN held_points >= ? THEN held_points - ? ELSE -1 END,
               available_points = available_points + ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(row.points_amount, row.points_amount, row.points_amount, timestamp, wallet.id),
      d1
        .prepare(
          `INSERT INTO wallet_credit_entries
            (id, account_id, event_type, points_amount,
             available_delta_points, held_delta_points,
             available_after_points, held_after_points, pending_after_points,
             redeemable_after_points, frozen_after_points,
             twd_value_minor, twd_minor_per_point_snapshot,
             reference_type, reference_id, idempotency_key, reason, created_at)
           VALUES (?, ?, 'order_hold_release', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          releaseEntryId,
          wallet.id,
          row.points_amount,
          row.points_amount,
          -row.points_amount,
          released.balanceAfter.available,
          released.balanceAfter.held,
          released.balanceAfter.pending,
          released.balanceAfter.redeemable,
          released.balanceAfter.frozen,
          released.twdValueMinor,
          row.twd_minor_per_point_snapshot,
          "provider_invitation",
          row.id,
          `release:${row.id}`,
          outcome === "expired"
            ? "60 秒內未接受，返還玩家點數"
            : "陪玩師拒絕邀請，返還玩家點數",
          timestamp
        ),
      d1
        .prepare(
          `UPDATE provider_invitations
           SET status = CASE
                 WHEN status = 'pending' AND (? <> 'expired' OR expires_at <= ?)
                   THEN ?
                 ELSE NULL
               END,
               release_entry_id = ?, resolved_at = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(outcome, timestamp, outcome, releaseEntryId, timestamp, timestamp, id),
      d1
        .prepare(
          `UPDATE provider_profiles
           SET online_status = 'offline', updated_at = ?
           WHERE id = ?`
        )
        .bind(timestamp, row.provider_id),
      d1
        .prepare(
          `UPDATE provider_shifts
           SET status = 'ended', clocked_out_at = ?, ended_reason = ?, updated_at = ?
           WHERE id = ? AND status = 'online'`
        )
        .bind(timestamp, endedReason, timestamp, row.shift_id),
    ]);
  } catch (error) {
    if (error instanceof Error && /NOT NULL|UNIQUE|CHECK/.test(error.message)) {
      throw new LiveMarketplaceStoreError(
        "CONFLICT",
        "邀請已經處理，返點不會重複執行。"
      );
    }
    throw error;
  }
}

export async function expireOverdueInvitations(now = new Date()) {
  const result = await getD1()
    .prepare(
      `SELECT id FROM provider_invitations
       WHERE status = 'pending' AND expires_at <= ?
       ORDER BY expires_at
       LIMIT 20`
    )
    .bind(now.toISOString())
    .all<{ id: string }>();

  for (const item of result.results) {
    try {
      await closeProviderInvitation(item.id, "expired", now);
    } catch (error) {
      if (
        !(
          error instanceof LiveMarketplaceStoreError &&
          error.code === "CONFLICT"
        ) &&
        !(
          error instanceof LiveMarketplaceError &&
          error.code === "INVITATION_ALREADY_RESOLVED"
        )
      ) {
        throw error;
      }
    }
  }
}

export async function getLiveMarketplaceSnapshot(
  now = new Date()
): Promise<LiveMarketplaceSnapshot> {
  await expireOverdueInvitations(now);
  const d1 = getD1();
  const [providerResult, invitationResult, wallet] = await Promise.all([
    d1
      .prepare(
        `SELECT p.id, p.display_name, p.primary_photo_url,
                p.online_status, p.status AS profile_status,
                sh.id AS shift_id, s.id AS service_id,
                s.title AS service_title, s.billing_unit, s.price_amount_minor
         FROM provider_profiles p
         JOIN provider_services s
           ON s.provider_id = p.id AND s.enabled = 1
         LEFT JOIN provider_shifts sh
           ON sh.provider_id = p.id AND sh.status = 'online'
         WHERE p.status = 'active'
         ORDER BY CASE p.online_status
           WHEN 'online' THEN 0 WHEN 'busy' THEN 1 ELSE 2 END,
           p.featured DESC, p.display_name`
      )
      .all<ProviderRow>(),
    d1
      .prepare(
        `SELECT i.*, p.display_name AS provider_name,
                s.title AS service_title
         FROM provider_invitations i
         JOIN provider_profiles p ON p.id = i.provider_id
         JOIN provider_services s ON s.id = i.provider_service_id
         WHERE i.player_id = ?
         ORDER BY i.created_at DESC
         LIMIT 12`
      )
      .bind(DEMO_PLAYER_ID)
      .all<InvitationRow>(),
    readWallet(),
  ]);

  return Object.freeze({
    serverNow: now.toISOString(),
    player: Object.freeze({
      id: DEMO_PLAYER_ID,
      availablePoints: wallet.available_points,
      heldPoints: wallet.held_points,
    }),
    providers: providerResult.results.map(mapProvider),
    invitations: invitationResult.results.map(mapInvitation),
  });
}
