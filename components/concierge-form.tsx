"use client";

import { useState, type FormEvent } from "react";
import { seedGames } from "@/lib/seed-data";

type FormState =
  | { status: "idle" | "submitting" }
  | { status: "error"; message: string; fields: Record<string, string> }
  | { status: "success"; id: string };

export function ConciergeForm({ preferredProvider }: { preferredProvider?: string }) {
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ status: "submitting" });
    const note = String(data.get("notes") ?? "");

    const response = await fetch("/api/concierge-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contactName: data.get("contactName"),
        contactMethod: data.get("contactMethod"),
        regionCode: data.get("regionCode"),
        gameId: data.get("gameId"),
        preferredGender: data.get("preferredGender"),
        preferredPersonaTags: String(data.get("preferredPersonaTags") ?? "").split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        preferredVoiceTags: String(data.get("preferredVoiceTags") ?? "").split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        serviceAxis: data.get("serviceAxis"),
        budgetMin: data.get("budgetMin"),
        budgetMax: data.get("budgetMax"),
        requestedStartAt: data.get("requestedStartAt"),
        requestedDurationMinutes: data.get("requestedDurationMinutes"),
        notes: preferredProvider ? `希望優先安排：${preferredProvider}\n${note}` : note,
        ageConfirmed: data.get("ageConfirmed") === "on",
      }),
    });
    const result = (await response.json()) as { id?: string; error?: string; fields?: Record<string, string> };

    if (!response.ok || !result.id) {
      setState({ status: "error", message: result.error ?? "目前無法送出。", fields: result.fields ?? {} });
      return;
    }
    form.reset();
    setState({ status: "success", id: result.id });
  }

  if (state.status === "success") {
    return (
      <div className="form-success" role="status">
        <span>站長已收到你的需求</span>
        <h2>接下來由真人幫你縮小選擇。</h2>
        <p>這份需求不會自動成立訂單，也不會扣款。站長確認人選、時間與價格後，才會進入下一步。</p>
        <code>{state.id}</code>
        <button className="button button-secondary" onClick={() => setState({ status: "idle" })} type="button">再送一份需求</button>
      </div>
    );
  }

  const fieldError = state.status === "error" ? state.fields : {};

  return (
    <form className="product-form concierge-product-form" onSubmit={submit} noValidate>
      {preferredProvider && <div className="preferred-provider">優先安排：<strong>{preferredProvider}</strong><span>站長仍會確認對方時段與服務適合度。</span></div>}
      <div className="form-section">
        <div className="form-section-heading"><span>01</span><div><h2>先說今晚想要什麼</h2><p>不用懂平台規則，選最接近的感覺就好。</p></div></div>
        <fieldset>
          <legend>服務方向 *</legend>
          <div className="choice-grid">
            <label className="choice-card"><input type="radio" name="serviceAxis" value="emotional" defaultChecked /><strong>想有人懂我</strong><span>聊天、陪伴、氣氛與輕鬆遊戲</span></label>
            <label className="choice-card"><input type="radio" name="serviceAxis" value="technical" /><strong>今晚想贏</strong><span>上分、教學、戰術與復盤</span></label>
            <label className="choice-card"><input type="radio" name="serviceAxis" value="hybrid" /><strong>兩個都要</strong><span>氣氛與技術各一半</span></label>
          </div>
        </fieldset>
        <div className="form-grid">
          <label><span>遊戲 *</span><select name="gameId"><option value="">請選擇</option>{seedGames.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select>{fieldError.gameId && <small className="field-error">{fieldError.gameId}</small>}</label>
          <label><span>偏好的公開性別</span><select name="preferredGender"><option value="">不限</option><option value="female">女性</option><option value="male">男性</option><option value="non_binary">其他</option><option value="not_disclosed">不公開也可以</option></select></label>
          <label><span>偏好的人設</span><input name="preferredPersonaTags" placeholder="溫柔、搞笑、安靜、不嘴人" /></label>
          <label><span>偏好的聲線</span><input name="preferredVoiceTags" placeholder="清甜、低音、自然、沉穩" /></label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading"><span>02</span><div><h2>時間與預算</h2><p>價格是篩選條件，不代表送出後立刻成立交易。</p></div></div>
        <div className="form-grid">
          <label><span>希望開始時間 *</span><input type="datetime-local" name="requestedStartAt" />{fieldError.requestedStartAt && <small className="field-error">{fieldError.requestedStartAt}</small>}</label>
          <label><span>預計時間 *</span><select name="requestedDurationMinutes" defaultValue="60"><option value="30">30 分鐘</option><option value="60">60 分鐘</option><option value="90">90 分鐘</option><option value="120">120 分鐘</option></select>{fieldError.requestedDurationMinutes && <small className="field-error">{fieldError.requestedDurationMinutes}</small>}</label>
          <label><span>最低預算（NT$）</span><input type="number" min="0" step="1" name="budgetMin" placeholder="199" /></label>
          <label><span>最高預算（NT$）</span><input type="number" min="0" step="1" name="budgetMax" placeholder="499" />{fieldError.budget && <small className="field-error">{fieldError.budget}</small>}</label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading"><span>03</span><div><h2>站長怎麼聯絡你</h2><p>本版沒有正式訊息整合，請留下你真的會看的聯絡方式。</p></div></div>
        <div className="form-grid">
          <label><span>怎麼稱呼你 *</span><input name="contactName" placeholder="例如：小葵" />{fieldError.contactName && <small className="field-error">{fieldError.contactName}</small>}</label>
          <label><span>LINE／Discord／Email *</span><input name="contactMethod" placeholder="請註明使用哪一種" />{fieldError.contactMethod && <small className="field-error">{fieldError.contactMethod}</small>}</label>
          <label><span>地區</span><select name="regionCode"><option value="TW">台灣</option><option value="GLOBAL">全球／其他地區</option></select></label>
          <label className="form-grid-span"><span>還有什麼想讓站長知道？ *</span><textarea rows={5} name="notes" placeholder="例如：第一次找陪玩，很怕尷尬，希望對方會主動帶話題，但不要一直問私人問題。" />{fieldError.notes && <small className="field-error">{fieldError.notes}</small>}</label>
        </div>
      </div>

      <div className="form-consent">
        <label><input type="checkbox" name="ageConfirmed" /><span>我確認已滿 18 歲，且需求不包含色情、線下交換、作弊、代打或其他禁止服務。</span></label>
        {fieldError.ageConfirmed && <small className="field-error">{fieldError.ageConfirmed}</small>}
      </div>
      {state.status === "error" && <div className="form-error" role="alert">{state.message}</div>}
      <button className="button button-primary submit-button" disabled={state.status === "submitting"} type="submit">{state.status === "submitting" ? "安全保存中…" : "送出人工派單需求"}</button>
      <p className="form-footnote">不會自動扣款；站長本人確認人選、時間與價格後才進下一步。</p>
    </form>
  );
}
