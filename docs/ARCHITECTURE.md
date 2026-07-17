# 陪你玩 v0.2 架構決策

## v0.4 金錢點數錢包

點數是台幣購買且可兌換現金的 monetary credits（貨幣型點數），不是可靠度評分。系統使用兩層帳務：

1. `ledger_accounts`、`ledger_transactions`、`ledger_postings`：保存台幣資金、儲值負債、平台收入與外部撥款的雙式帳務。
2. `wallet_credit_accounts`、`wallet_credit_entries`：保存每位玩家／陪玩師的可用、保留、待入帳、可兌現與凍結點數，以及每筆事件的台幣價值和換算率快照。

帳務資料流：

```text
玩家台幣付款
  -> 玩家可用點數
  -> 點選陪玩師時保留點數
     ├─ 拒絕／逾時：全數返還玩家
     │              + 陪玩師自動下線
     │              + 扣除陪玩師錢包點數
     └─ 接受並完成：玩家正式扣點
                    -> 平台費
                    -> 陪玩師待入帳點數
                    -> 可兌現／爭議凍結
                    -> 外部服務商撥付台幣

虛擬禮物（未開放）
  -> 共用玩家扣點與收禮者收益帳務
```

逾時扣款使用 `missed_offer_penalty` 事件，必須參照邀請、規則版本與台幣價值；申訴成立時新增沖正，不修改原紀錄。玩家間轉點與點數交易市場不在目前路徑中。

目前 `PaymentGateway` 仍未設定，網站也沒有玩家／陪玩師登入，因此 `/wallet` 只顯示明確標示的示範資料，真實儲值、逾時扣款與兌現寫入維持關閉。

## 架構摘要

本輪採用 Vinext／React 的手機優先網站，透過 Cloudflare Sites 建置與私密部署。結構化資料放在 D1，照片、語音與技術證明等檔案預留 R2；所有外部供應商都隔離在 adapter（轉接介面）後方。

```text
公開網站                未公開的 Owner 程式骨架
  │                          │
  ├─ 探索／資料頁            ├─ 申請審核
  ├─ 陪玩師申請              ├─ 人工派單
  └─ 站長幫你配              └─ 客服／爭議
              │
       Server routes/actions
              │
      domain services + audit
              │
       D1 records / R2 files
              │
 Payment・KYC・通知・通訊 adapters
```

## 模組邊界

- `app/`：公開頁面與伺服器端寫入入口；目前不發布 Owner 路由。
- `components/`：跨頁共用的導覽、卡片、表單與狀態元件。
- `lib/`：查詢、驗證、金額／評分格式與假資料 fallback。
- `db/schema.ts`：D1／Drizzle 資料模型。
- `drizzle/`：由 schema 產生並檢查的 migration。
- `adapters/`：金流、KYC、儲存、驗證碼、通知與通訊的契約及未串接實作。
- `docs/`：PRD、政策、RLS 與部署邊界。

## 資料與檔案

- D1 是營運資料的 source of truth（唯一可信來源）。
- R2 保存照片、語音、證據與證明檔；D1 只存中繼資料、所有權、審核狀態與物件鍵值。
- 未完成正式 R2 上傳流程前，示範資料使用可公開測試 URL；介面不得暗示檔案已完成真實性審核。
- 交易金額用最小貨幣單位整數；費率用 basis points（基點），例如 10% 儲存為 1000。

## 身份與授權決策

- 資料模型包含 `player`、`provider`、`owner`。
- 本輪沒有自建公開登入，也沒有把任意 ChatGPT 登入者當作 Owner。
- Owner 元件與狀態機只保留為營運骨架；在加入伺服器端身份驗證與明確 Owner allowlist 前，`/owner` 維持 404 且不出現在公開導覽。
- `docs/rls-draft.sql` 提供未來 Supabase／Postgres 路線的列級權限草案；D1 路線仍須在每個伺服器寫入入口執行相同授權規則。

## 區域資料平面

```text
Global data plane              CN data plane（未部署）
TW / GLOBAL users              CN users
TW / GLOBAL providers          CN providers
TW / GLOBAL orders             CN orders
Global evidence storage        CN-local evidence storage
```

- 兩區使用相同領域契約，但不共用生產資料庫或檔案桶。
- `region_policies` 決定年齡、服務類別、付款、KYC、資料保留與 adapter 選擇。
- 跨區只允許匿名化彙總；身分、付款與完整客服證據預設不跨區同步。

## 外部 Adapter 契約

- `PaymentGateway`：建立付款授權、查詢、退款與分帳結果。
- `IdentityVerificationProvider`：成人／身分驗證與結果查詢。
- `StorageProvider`：簽發上傳、讀取與刪除授權。
- `CaptchaProvider`：人機驗證。
- `NotificationProvider`：Email、簡訊或推播通知。
- `MessagingProvider`：LINE、Discord、微信、QQ 或站內訊息導流。

本輪只交付明確回報 `not_configured` 的假實作，避免測試資料被誤認為正式交易。

## 主要風險與上線 Gate

- 沒有正式身份驗證／Owner allowlist 前，不可公開 Owner 路由。
- 沒有 KYC、檔案掃描、金流與撥款前，不可開放真實交易。
- 沒有法律覆核與事故處理流程前，不可宣稱政策已符合所有市場法規。
- 沒有 15 位已審核可接單陪玩師與晚間供給密度前，不應投入付費流量。
