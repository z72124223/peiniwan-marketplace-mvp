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

test("示範評價不再使用同一個兩句轉折模板", () => {
  const sentenceCounts = new Set(seedReviews.map((review) => (review.text.match(/[。！？]/g) ?? []).length));
  const contrastPattern = /不會|沒有|不是|不想|但|只|反而|其實|唯一|如果|也不|沒/;
  const reviewsWithContrast = seedReviews.filter((review) => contrastPattern.test(review.text)).length;
  const ratings = new Set(seedReviews.map((review) => review.rating));

  assert.ok(sentenceCounts.size >= 3, "評價句數仍過度一致");
  assert.ok(reviewsWithContrast < seedReviews.length, "每則評價仍使用相同否定／轉折結構");
  assert.ok(ratings.size >= 5, "示範評分分布仍過度集中");
  assert.ok(Math.min(...seedReviews.map((review) => review.rating)) <= 4.4, "缺少較普通的示範體驗");
});

test("六位陪玩師的語音介紹不是同一種自我介紹模板", () => {
  const selfIntroCount = seedProviders.filter((provider) => /我是/.test(provider.voiceIntro)).length;
  const sentenceCounts = new Set(seedProviders.map((provider) => (provider.voiceIntro.match(/[。！？]/g) ?? []).length));

  assert.ok(selfIntroCount < seedProviders.length / 2, "過多語音介紹使用『我是某某』模板");
  assert.ok(sentenceCounts.size >= 2, "語音介紹句數仍完全一致");
});
