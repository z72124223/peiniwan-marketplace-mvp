# 陪你玩 v0.2 架構決策

## v0.3 錢包基礎

錢包分成兩個互不兌換的領域：

1. Monetary ledger（實際款項帳本）：以 `ledger_transactions`、`ledger_accounts` 與 `ledger_postings` 保存雙式帳務。交易不可直接修改，重複事件由唯一冪等鍵阻擋，錯誤以沖正交易處理。
2. Reliability ledger（可靠度點數帳本）：以 `provider_point_accounts` 與 `provider_point_entries` 保存點數餘額與追加式事件。它不具貨幣價值，也不能與實際款項互轉。

目前 `PaymentGateway` 仍是未設定狀態，網站也沒有陪玩師登入。因此 `/wallet` 只讀取明確標示的示範資料；D1 結構與領域規則先作為下一階段訂單結算、打卡派單與外部撥款的可信基礎，不開放真實錢包寫入。

帳務資料流：

```text
訂單費用快照
  -> 結算交易（借貸平衡）
  -> 陪玩師待入帳
  -> 可提領 / 爭議凍結
  -> 外部服務商確認撥款

派單結果
  -> 可靠度點數事件
  -> 接單資格判定（下一階段）
```

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
