import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptLiveInvitation,
  closeLiveInvitation,
  createLiveInvitation,
  invitationSecondsRemaining,
  pointsFromPriceMinor,
} from "../lib/live-marketplace";
import {
  emptyWalletCreditBalance,
  holdWalletPoints,
  releaseWalletHold,
} from "../lib/wallet";

const startedAt = "2026-07-19T00:00:00.000Z";

function invitation() {
  return createLiveInvitation({
    id: "invite-001",
    playerId: "user_player_demo",
    providerId: "provider_an",
    providerServiceId: "service_an",
    providerStatus: "online",
    pointsAmount: 149,
    now: startedAt,
  });
}

test("only an online provider can receive a 60-second invitation", () => {
  const created = invitation();
  assert.equal(created.status, "pending");
  assert.equal(created.expiresAt, "2026-07-19T00:01:00.000Z");
  assert.equal(invitationSecondsRemaining(created, startedAt), 60);

  assert.throws(
    () =>
      createLiveInvitation({
        id: "invite-offline",
        playerId: "user_player_demo",
        providerId: "provider_an",
        providerServiceId: "service_an",
        providerStatus: "offline",
        pointsAmount: 149,
        now: startedAt,
      }),
    /不在線/
  );
});

test("accepting before the deadline creates one accepted result", () => {
  const accepted = acceptLiveInvitation(
    invitation(),
    "2026-07-19T00:00:59.999Z"
  );
  assert.equal(accepted.status, "accepted");
  assert.equal(accepted.acceptedAt, "2026-07-19T00:00:59.999Z");
  assert.throws(
    () => acceptLiveInvitation(accepted, "2026-07-19T00:00:59.999Z"),
    /不能重複/
  );
});

test("the 60-second boundary is expired and cannot be accepted", () => {
  const pending = invitation();
  assert.equal(
    invitationSecondsRemaining(pending, "2026-07-19T00:01:00.000Z"),
    0
  );
  assert.throws(
    () => acceptLiveInvitation(pending, "2026-07-19T00:01:00.000Z"),
    /超過 60 秒/
  );

  const expired = closeLiveInvitation(
    pending,
    "expired",
    "2026-07-19T00:01:00.000Z"
  );
  assert.equal(expired.status, "expired");
  assert.throws(
    () => closeLiveInvitation(expired, "expired", "2026-07-19T00:01:01.000Z"),
    /不能重複/
  );
});

test("decline or timeout releases the exact held player points", () => {
  const pending = invitation();
  const held = holdWalletPoints({
    accountId: "wallet-player-demo",
    currentBalance: { ...emptyWalletCreditBalance(), available: 1_000 },
    points: pending.pointsAmount,
    twdMinorPerPointSnapshot: pending.twdMinorPerPointSnapshot,
    referenceType: "provider_invitation",
    referenceId: pending.id,
    idempotencyKey: `hold:${pending.id}`,
    reason: "玩家送出 60 秒邀請",
  });
  const expired = closeLiveInvitation(
    pending,
    "expired",
    pending.expiresAt
  );
  const released = releaseWalletHold({
    accountId: "wallet-player-demo",
    currentBalance: held.balanceAfter,
    points: expired.pointsAmount,
    twdMinorPerPointSnapshot: expired.twdMinorPerPointSnapshot,
    referenceType: "provider_invitation",
    referenceId: expired.id,
    idempotencyKey: `release:${expired.id}`,
    reason: "邀請逾時，返還玩家點數",
  });

  assert.equal(held.balanceAfter.available, 851);
  assert.equal(held.balanceAfter.held, 149);
  assert.equal(released.balanceAfter.available, 1_000);
  assert.equal(released.balanceAfter.held, 0);
});

test("service price converts to integer demo points without rounding", () => {
  assert.equal(pointsFromPriceMinor(14_900), 149);
  assert.throws(() => pointsFromPriceMinor(14_950), /整數點數/);
});
