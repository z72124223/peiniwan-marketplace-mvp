import assert from "node:assert/strict";
import test from "node:test";
import {
  validateConciergeRequest,
  validateProviderApplication,
} from "../lib/validation";

const validApplication = {
  applicantName: "Mina",
  email: "mina@example.com",
  externalContact: "Discord mina-demo",
  regionCode: "TW",
  publicGender: "female",
  serviceAxes: ["emotional", "hybrid"],
  gameIds: ["game_lol"],
  personaTags: ["溫柔", "新手友善"],
  biography: "我擅長主動開話題，但也會尊重玩家想安靜的時候；不接受色情、線下或私人金流要求。",
  profilePhotoUrl: "https://example.com/photo.jpg",
  voiceSampleUrl: "https://example.com/voice.mp3",
  skillProofNote: "娛樂服務不需技術證明。",
  ageConfirmed: true,
  policyAccepted: true,
};

test("provider application accepts a complete 18+ submission", () => {
  const result = validateProviderApplication(validApplication);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.regionCode, "TW");
    assert.deepEqual(result.data.serviceAxes, ["emotional", "hybrid"]);
  }
});

test("provider application rejects missing adult and policy consent", () => {
  const result = validateProviderApplication({
    ...validApplication,
    ageConfirmed: false,
    policyAccepted: false,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.ageConfirmed);
    assert.ok(result.errors.policyAccepted);
  }
});

test("provider application rejects unsupported game ids and invalid media URLs", () => {
  const result = validateProviderApplication({
    ...validApplication,
    gameIds: ["unknown_game"],
    profilePhotoUrl: "javascript:alert(1)",
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.gameIds);
    assert.ok(result.errors.profilePhotoUrl);
  }
});

const validConcierge = {
  contactName: "小葵",
  contactMethod: "LINE demo-contact",
  regionCode: "TW",
  gameId: "game_valorant",
  preferredGender: "",
  preferredPersonaTags: ["冷靜", "不嘴人"],
  preferredVoiceTags: ["沉穩"],
  serviceAxis: "technical",
  budgetMin: "299",
  budgetMax: "499",
  requestedStartAt: "2026-07-20T21:00",
  requestedDurationMinutes: "60",
  notes: "想認真打，也希望對方先觀察問題再給一個可以練的重點。",
  ageConfirmed: true,
};

test("concierge request converts display currency into integer minor units", () => {
  const result = validateConciergeRequest(validConcierge);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.budgetMinMinor, 29900);
    assert.equal(result.data.budgetMaxMinor, 49900);
  }
});

test("concierge request rejects inverted budget and missing adult consent", () => {
  const result = validateConciergeRequest({
    ...validConcierge,
    budgetMin: "600",
    budgetMax: "300",
    ageConfirmed: false,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.budget);
    assert.ok(result.errors.ageConfirmed);
  }
});
