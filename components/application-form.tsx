"use client";

import { useState, type FormEvent } from "react";
import { seedGames } from "@/lib/seed-data";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fields: Record<string, string> }
  | { status: "success"; id: string };

export function ApplicationForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ status: "submitting" });

    const response = await fetch("/api/provider-applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        applicantName: data.get("applicantName"),
        email: data.get("email"),
        externalContact: data.get("externalContact"),
        regionCode: data.get("regionCode"),
        publicGender: data.get("publicGender"),
        serviceAxes: data.getAll("serviceAxes"),
        gameIds: data.getAll("gameIds"),
        personaTags: String(data.get("personaTags") ?? "")
          .split(/[、,，]/)
          .map((item) => item.trim())
          .filter(Boolean),
        biography: data.get("biography"),
        profilePhotoUrl: data.get("profilePhotoUrl"),
        voiceSampleUrl: data.get("voiceSampleUrl"),
        skillProofNote: data.get("skillProofNote"),
        ageConfirmed: data.get("ageConfirmed") === "on",
        policyAccepted: data.get("policyAccepted") === "on",
      }),
    });
    const result = (await response.json()) as {
      id?: string;
      error?: string;
      fields?: Record<string, string>;
    };

    if (!response.ok || !result.id) {
      setState({
        status: "error",
        message: result.error ?? "目前無法送出，請稍後再試。",
        fields: result.fields ?? {},
      });
      return;
    }

    form.reset();
    setState({ status: "success", id: result.id });
  }

  if (state.status === "success") {
    return (
      <div className="form-success" role="status">
        <span>申請已進入人工審核</span>
        <h2>謝謝你願意成為第一批陪玩師。</h2>
        <p>站長會依申請順序確認照片、語音、服務界線與技術證明。這個 MVP 不會自動核准任何人。</p>
        <code>{state.id}</code>
        <button className="button button-secondary" onClick={() => setState({ status: "idle" })} type="button">再送一份申請</button>
      </div>
    );
  }

  const fieldError = state.status === "error" ? state.fields : {};

  return (
    <form className="product-form" onSubmit={submit} noValidate>
      <div className="form-section">
        <div className="form-section-heading"><span>01</span><div><h2>基本資料</h2><p>這些資料先用來聯絡與人工審核，不會全部公開。</p></div></div>
        <div className="form-grid">
          <label><span>怎麼稱呼你 *</span><input name="applicantName" placeholder="例如：Mina" required />{fieldError.applicantName && <small className="field-error">{fieldError.applicantName}</small>}</label>
          <label><span>Email *</span><input name="email" type="email" placeholder="you@example.com" required />{fieldError.email && <small className="field-error">{fieldError.email}</small>}</label>
          <label><span>外部聯絡方式 *</span><input name="externalContact" placeholder="LINE ID／Discord 帳號" required />{fieldError.externalContact && <small className="field-error">{fieldError.externalContact}</small>}</label>
          <label><span>服務地區 *</span><select name="regionCode"><option value="TW">台灣</option><option value="GLOBAL">全球／其他地區</option></select></label>
          <label><span>自願公開的性別</span><select name="publicGender"><option value="female">女性</option><option value="male">男性</option><option value="non_binary">其他</option><option value="not_disclosed">不公開</option></select></label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading"><span>02</span><div><h2>你想提供什麼</h2><p>可以複選；服務能力不會依性別被寫死。</p></div></div>
        <fieldset>
          <legend>服務方向 *</legend>
          <div className="choice-grid">
            <label className="choice-card"><input type="checkbox" name="serviceAxes" value="emotional" /><strong>娛樂／情緒</strong><span>陪伴、聊天、氣氛與關係感</span></label>
            <label className="choice-card"><input type="checkbox" name="serviceAxes" value="technical" /><strong>技術</strong><span>教學、戰術、上分與復盤</span></label>
            <label className="choice-card"><input type="checkbox" name="serviceAxes" value="hybrid" /><strong>全能</strong><span>有氣氛，也有一定技術</span></label>
          </div>
          {fieldError.serviceAxes && <small className="field-error">{fieldError.serviceAxes}</small>}
        </fieldset>
        <fieldset>
          <legend>首發遊戲 *</legend>
          <div className="choice-grid games-choice-grid">
            {seedGames.map((game) => <label className="choice-card" key={game.id}><input type="checkbox" name="gameIds" value={game.id} /><strong>{game.name}</strong><span>{game.shortName}</span></label>)}
          </div>
          {fieldError.gameIds && <small className="field-error">{fieldError.gameIds}</small>}
        </fieldset>
        <div className="form-grid form-grid-one">
          <label><span>人設與互動標籤</span><input name="personaTags" placeholder="例如：溫柔、低音、不嘴人、社恐友善" /><small>用逗號或頓號分隔，最多 8 個。</small></label>
          <label><span>自我介紹與服務界線 *</span><textarea name="biography" rows={6} placeholder="請描述你怎麼互動、適合哪些玩家，以及你不接受哪些要求。" required />{fieldError.biography && <small className="field-error">{fieldError.biography}</small>}</label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading"><span>03</span><div><h2>審核素材</h2><p>本版先接受可存取的連結；正式 R2 上傳與掃描尚未啟用。</p></div></div>
        <div className="form-grid">
          <label><span>真人照片連結</span><input name="profilePhotoUrl" type="url" placeholder="https://…" />{fieldError.profilePhotoUrl && <small className="field-error">{fieldError.profilePhotoUrl}</small>}</label>
          <label><span>20–30 秒語音連結</span><input name="voiceSampleUrl" type="url" placeholder="https://…" />{fieldError.voiceSampleUrl && <small className="field-error">{fieldError.voiceSampleUrl}</small>}</label>
          <label className="form-grid-span"><span>技術證明補充</span><textarea name="skillProofNote" rows={3} placeholder="段位、伺服器、可驗證方式或暫時無法提供的原因。" /></label>
        </div>
      </div>

      <div className="form-consent">
        <label><input type="checkbox" name="ageConfirmed" /> <span>我確認已滿 18 歲，並了解正式上架前仍需完成身分與素材人工審核。</span></label>
        {fieldError.ageConfirmed && <small className="field-error">{fieldError.ageConfirmed}</small>}
        <label><input type="checkbox" name="policyAccepted" /> <span>我同意合法與禁止服務政策，不提供色情、線下交換、外掛、代打或消費脅迫。</span></label>
        {fieldError.policyAccepted && <small className="field-error">{fieldError.policyAccepted}</small>}
      </div>

      {state.status === "error" && <div className="form-error" role="alert">{state.message}</div>}
      <button className="button button-primary submit-button" disabled={state.status === "submitting"} type="submit">{state.status === "submitting" ? "安全保存中…" : "送出陪玩師申請"}</button>
      <p className="form-footnote">送出不代表自動上架；所有申請由 Owner 本人審核。</p>
    </form>
  );
}
