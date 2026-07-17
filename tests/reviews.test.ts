import assert from "node:assert/strict";
import { test } from "node:test";
import { getSeedReviews, seedProviders, seedReviews } from "../lib/seed-data";

test("每位示範陪玩師都有至少三則可讀評價", () => {
  for (const provider of seedProviders) {
    assert.ok(getSeedReviews(provider.id).length >= 3, `${provider.displayName} 缺少評價`);
  }
});

test("示範評價使用唯一 id、合法評分與存在的陪玩師", () => {
  const ids = new Set<string>();
  const providerIds = new Set(seedProviders.map((provider) => provider.id));
  for (const review of seedReviews) {
    assert.equal(ids.has(review.id), false, `重複評價 id：${review.id}`);
    ids.add(review.id);
    assert.ok(providerIds.has(review.providerId));
    assert.ok(review.rating >= 1 && review.rating <= 5);
    assert.ok(review.emotionalScore >= 1 && review.emotionalScore <= 5);
    assert.ok(review.technicalScore >= 1 && review.technicalScore <= 5);
    assert.ok(review.text.length >= 20);
  }
});
