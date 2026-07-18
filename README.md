# 陪你玩 v0.6 MVP

「陪你玩」是 18+ 遊戲陪玩網站的私人示範版。此版本完成公開探索、陪玩師資料、申請、站長人工派單、`/wallet` 金錢點數錢包預覽，以及 `/live` 的打卡、在線選人與 60 秒邀請閉環；尚未開始真實交易或正式登入。

## Prerequisites

- Node.js `>=22.13.0`

## 本機啟動

```bash
npm install
npm run dev
npm run build
```

首次提交表單前，請將 migration 套用到本機 D1：

```bash
npx wrangler d1 execute site-creator-d1 --local --persist-to ".wrangler/state" --config dist/server/wrangler.json --file drizzle/0000_clumsy_wonder_man.sql
npx wrangler d1 execute site-creator-d1 --local --persist-to ".wrangler/state" --config dist/server/wrangler.json --file drizzle/0001_outstanding_daimon_hellstrom.sql
npx wrangler d1 execute site-creator-d1 --local --persist-to ".wrangler/state" --config dist/server/wrangler.json --file drizzle/0002_free_toad_men.sql
npx wrangler d1 execute site-creator-d1 --local --persist-to ".wrangler/state" --config dist/server/wrangler.json --file drizzle/0003_military_chimera.sql
npx wrangler d1 execute site-creator-d1 --local --persist-to ".wrangler/state" --config dist/server/wrangler.json --file drizzle/0004_fresh_nuke.sql
npx wrangler d1 execute site-creator-d1 --local --persist-to ".wrangler/state" --config dist/server/wrangler.json --file drizzle/0005_tiresome_xorn.sql
```

## 已完成範圍

- 公開首頁、探索篩選、6 位假資料陪玩師與個人資料頁
- 陪玩師申請與「站長幫你配」的 D1 持久化提交
- 未公開的 Owner 審核／派單／客服／爭議工作台程式骨架
- 35 張資料表、Drizzle migration、seed data 與 Supabase/Postgres RLS 草案
- 台幣買點、點選保留、陪玩收益、逾時扣款、虛擬禮物預留與現金兌換的帳務基礎
- 清楚標示「沒有真實款項」的 `/wallet` 唯讀示範頁；玩家間轉點與點數交易市場未開放
- `/live` 私人雙角色操作台：陪玩師打卡、只顯示在線可接單者、玩家選人、保留點數、60 秒接受／拒絕／逾時、玩家返點與陪玩師下線
- 班次與邀請狀態保存於 D1；重新整理可恢復，重複接受或重複返點由伺服器端狀態檢查阻擋
- 金流、KYC、R2、通知與外部通訊的 adapter 介面（尚未串正式供應商）
- 全球／中國資料面分離的架構邊界；本輪不部署中國正式版

## 安全邊界

- 私密預覽沒有正式身份驗證與 Owner allowlist，因此不發布 `/owner` 路由；工作台程式只保留供未來加上授權後使用。
- 正式上線前必須補齊登入、伺服器端角色授權、個資遮罩、檔案掃描、速率限制與不可竄改稽核。
- 本專案不是正式法律文件；政策草案需由營運地區的合格律師／法遵覆核。
- 所有頁面與流程僅限 18 歲以上使用者。
- 點數具有台幣價值，可支付服務並可進入現金兌換流程；本版只執行 Demo 玩家保留與返點，未核定的陪玩師逾時扣點仍保持關閉。
- `/live` 沒有正式角色驗證，只能維持私人存取；無瀏覽器狀態讀取時也沒有背景排程器主動掃描逾時邀請。

## 驗證指令

- `npm run dev`：啟動本機預覽
- `npm run lint`：靜態品質檢查
- `npm run typecheck`：TypeScript 型別檢查
- `npm test`：migration、表單驗證、Owner 狀態機、建置與伺服器渲染測試
- `npm run db:generate`：資料結構變更後產生 Drizzle migration

## 重要文件

- `PLANS.md`：實作計畫與 drift log
- `docs/PRD_v0.2.md`：產品需求與驗收標準
- `docs/PRD_v0.4_MONETARY_POINTS.md`：金錢點數、逾時扣款與兌現產品契約
- `docs/ARCHITECTURE.md`：架構、資料區與 adapter 邊界
- `docs/SERVICE_POLICY.md`：合法與禁止服務政策草案
- `docs/rls-draft.sql`：Supabase/Postgres RLS 草案（D1 不直接執行）
