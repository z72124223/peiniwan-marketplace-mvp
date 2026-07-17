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
  assert.match(html, /今天想被陪伴，還是想贏？/);
  assert.match(html, /以遊戲為入口/);
  assert.doesNotMatch(html, /Codex is working|Your site is taking shape|react-loading-skeleton/i);
});

test("Owner 路由明確揭露正式授權尚未啟用", async () => {
  const response = await render("/owner");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Owner 營運骨架/);
  assert.match(html, /正式身份驗證與 Owner allowlist 尚未啟用/);
  assert.match(html, /不會寫入正式後台/);
});

test("服務政策路由揭露 18+ 與禁止內容", async () => {
  const response = await render("/policies");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /合法與禁止服務/);
  assert.match(html, /只服務年滿 18 歲/);
  assert.match(html, /未成年人參與/);
});
