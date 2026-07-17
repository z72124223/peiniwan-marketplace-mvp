# 陪你玩 v0.4 MVP

「陪你玩」是 18+ 遊戲陪玩網站的私密示範版。此版本完成公開探索、陪玩師資料、陪玩師申請、站長人工派單流程，以及 `/wallet` 金錢點數錢包唯讀預覽；尚未開始真實交易。

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
```

## 已完成範圍

- 公開首頁、探索篩選、6 位假資料陪玩師與個人資料頁
- 陪玩師申請與「站長幫你配」的 D1 持久化提交
- 未公開的 Owner 審核／派單／客服／爭議工作台程式骨架
- 35 張資料表、Drizzle migration、seed data 與 Supabase/Postgres RLS 草案
- 台幣買點、點選保留、陪玩收益、逾時扣款、虛擬禮物預留與現金兌換的帳務基礎
- 清楚標示「沒有真實款項」的 `/wallet` 唯讀示範頁；玩家間轉點與點數交易市場未開放
- 金流、KYC、R2、通知與外部通訊的 adapter 介面（尚未串正式供應商）
- 全球／中國資料面分離的架構邊界；本輪不部署中國正式版

## 安全邊界

- 私密預覽沒有正式身份驗證與 Owner allowlist，因此不發布 `/owner` 路由；工作台程式只保留供未來加上授權後使用。
- 正式上線前必須補齊登入、伺服器端角色授權、個資遮罩、檔案掃描、速率限制與不可竄改稽核。
- 本專案不是正式法律文件；政策草案需由營運地區的合格律師／法遵覆核。
- 所有頁面與流程僅限 18 歲以上使用者。
- 點數具有台幣價值，可支付服務並可進入現金兌換流程；陪玩師逾時未接單時會扣除錢包點數，但真實規則仍須完成金流、契約與法遵審查。

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
