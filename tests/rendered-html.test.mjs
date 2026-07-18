import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const port = 4174;
const origin = `http://127.0.0.1:${port}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "dev",
      "--config",
      "dist/server/wrangler.json",
      "--port",
      String(port),
      "--ip",
      "127.0.0.1",
      "--persist-to",
      ".wrangler/test-state",
    ],
    { cwd: fileURLToPath(new URL("../", import.meta.url)), env: process.env, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Production preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`正式預覽未在期限內啟動。\n${serverOutput}`);
});

after(() => {
  server?.kill();
});

async function render(path = "/") {
  return fetch(`${origin}${path}`, { headers: { accept: "text/html" } });
}

test("首頁會渲染正式 MVP 內容，不含 starter 佔位畫面", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /今晚，找個/);
  assert.match(html, /合拍的隊友/);
  assert.match(html, /照你現在的心情選/);
  assert.doesNotMatch(html, /今天想被陪伴|不是先選遊戲/);
  assert.match(html, /目前是示範網站/);
  assert.doesNotMatch(html, /站長在線|現在可接|href="\/owner"/);
  assert.doesNotMatch(html, /Codex is working|Your site is taking shape|react-loading-skeleton/i);
});

test("陪玩師卡片的評價數可進入評價列表", async () => {
  const profileResponse = await render("/providers/xiao-an");
  assert.equal(profileResponse.status, 200);
  const profileHtml = await profileResponse.text();
  assert.match(profileHtml, /href="\/providers\/xiao-an\/reviews"/);
  assert.match(profileHtml, /看其他玩家怎麼說/);

  const reviewsResponse = await render("/providers/xiao-an/reviews");
  assert.equal(reviewsResponse.status, 200);
  const reviewsHtml = await reviewsResponse.text();
  assert.match(reviewsHtml, /示範留言/);
  assert.match(reviewsHtml, /不是實際交易紀錄/);
  assert.doesNotMatch(reviewsHtml, /完成訂單評價|示範完成訂單|★★★★★/);
});

test("沒有正式授權時不公開 Owner 路由", async () => {
  const response = await render("/owner");
  assert.equal(response.status, 404);
});

test("陪玩師資料頁不把 Demo 寫成即時、已驗證或完成訂單資料", async () => {
  const response = await render("/providers/xiao-an");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /尚未完成真人驗證/);
  assert.match(html, /不是實際交易紀錄/);
  assert.doesNotMatch(html, /現在可接|分鐘內回覆|照片與語音已人工審核|完成訂單評價/);
});

test("服務政策路由揭露 18+ 與禁止內容", async () => {
  const response = await render("/policies");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /合法與禁止服務/);
  assert.match(html, /只服務年滿 18 歲/);
  assert.match(html, /未成年人參與/);
});

test("錢包頁正確顯示台幣買點、逾時扣錢包與現金兌換", async () => {
  const response = await render("/wallet");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /台幣買點/);
  assert.match(html, /點數就是錢/);
  assert.match(html, /直接扣除錢包裡可兌現的點數/);
  assert.match(html, /點數可換現金/);
  assert.match(html, /玩家保留點數全數返還/);
  assert.match(html, /點數交易市場・尚未開放/);
  assert.match(html, /真實兌現尚未接通/);
  assert.doesNotMatch(html, /點數不是錢|不可購買、轉讓、提領、折抵/);
  assert.doesNotMatch(html, /\u0E40\u0E07\u0E34\u0E19/);
});

test("即時接單 Demo 清楚揭露角色與金流邊界", async () => {
  const response = await render("/live");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /打卡・在線・60 秒接單/);
  assert.match(html, /私人操作台測試兩種角色/);
  assert.match(html, /陪玩師打卡台/);
  assert.match(html, /在線陪玩師/);
  assert.match(html, /這是角色操作模擬，不是正式登入/);
  assert.doesNotMatch(html, /真實付款已啟用|正式身份驗證已完成/);
});
