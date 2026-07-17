import type { ServiceAxis } from "./seed-data";

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export interface ProviderApplicationInput {
  applicantName: string;
  email: string;
  externalContact: string;
  regionCode: "TW" | "GLOBAL";
  publicGender: "female" | "male" | "non_binary" | "not_disclosed";
  serviceAxes: ServiceAxis[];
  gameIds: string[];
  personaTags: string[];
  biography: string;
  profilePhotoUrl: string | null;
  voiceSampleUrl: string | null;
  skillProofNote: string | null;
  ageConfirmed: true;
  policyAccepted: true;
}

export interface ConciergeRequestInput {
  contactName: string;
  contactMethod: string;
  regionCode: "TW" | "GLOBAL";
  gameId: string | null;
  preferredGender: string | null;
  preferredPersonaTags: string[];
  preferredVoiceTags: string[];
  serviceAxis: ServiceAxis;
  budgetMinMinor: number | null;
  budgetMaxMinor: number | null;
  currency: "TWD";
  requestedStartAt: string;
  requestedDurationMinutes: number;
  notes: string;
  ageConfirmed: true;
}

function record(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === "object"
    ? (input as Record<string, unknown>)
    : {};
}

function cleanText(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanStringArray(value: unknown, maxItems = 12) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function optionalHttpUrl(value: unknown) {
  const text = cleanText(value, 1000);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function validateProviderApplication(input: unknown): ValidationResult<ProviderApplicationInput> {
  const value = record(input);
  const errors: Record<string, string> = {};
  const applicantName = cleanText(value.applicantName, 80);
  const email = cleanText(value.email, 200).toLowerCase();
  const externalContact = cleanText(value.externalContact, 200);
  const biography = cleanText(value.biography, 1200);
  const personaTags = cleanStringArray(value.personaTags, 8);
  const gameIds = cleanStringArray(value.gameIds, 8).filter((id) =>
    ["game_lol", "game_valorant", "game_wildrift"].includes(id)
  );
  const serviceAxes = cleanStringArray(value.serviceAxes, 3).filter((axis): axis is ServiceAxis =>
    ["emotional", "technical", "hybrid"].includes(axis)
  );
  const regionCode = value.regionCode === "GLOBAL" ? "GLOBAL" : "TW";
  const publicGender = ["female", "male", "non_binary", "not_disclosed"].includes(
    String(value.publicGender)
  )
    ? (value.publicGender as ProviderApplicationInput["publicGender"])
    : "not_disclosed";
  const profilePhotoUrl = optionalHttpUrl(value.profilePhotoUrl);
  const voiceSampleUrl = optionalHttpUrl(value.voiceSampleUrl);
  const skillProofNote = cleanText(value.skillProofNote, 600) || null;

  if (applicantName.length < 2) errors.applicantName = "請填寫至少 2 個字的稱呼。";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "請填寫可聯絡的 Email。";
  if (externalContact.length < 3) errors.externalContact = "請填寫 LINE、Discord 或其他聯絡方式。";
  if (serviceAxes.length === 0) errors.serviceAxes = "至少選擇一種服務方向。";
  if (gameIds.length === 0) errors.gameIds = "至少選擇一款首發遊戲。";
  if (biography.length < 30) errors.biography = "請用至少 30 個字描述你的互動方式與服務界線。";
  if (value.profilePhotoUrl && !profilePhotoUrl) errors.profilePhotoUrl = "照片連結必須是有效的 http(s) 網址。";
  if (value.voiceSampleUrl && !voiceSampleUrl) errors.voiceSampleUrl = "語音連結必須是有效的 http(s) 網址。";
  if (value.ageConfirmed !== true) errors.ageConfirmed = "申請人必須確認已滿 18 歲。";
  if (value.policyAccepted !== true) errors.policyAccepted = "請先同意合法與禁止服務政策。";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      applicantName,
      email,
      externalContact,
      regionCode,
      publicGender,
      serviceAxes,
      gameIds,
      personaTags,
      biography,
      profilePhotoUrl,
      voiceSampleUrl,
      skillProofNote,
      ageConfirmed: true,
      policyAccepted: true,
    },
  };
}

export function validateConciergeRequest(input: unknown): ValidationResult<ConciergeRequestInput> {
  const value = record(input);
  const errors: Record<string, string> = {};
  const contactName = cleanText(value.contactName, 80);
  const contactMethod = cleanText(value.contactMethod, 200);
  const notes = cleanText(value.notes, 1200);
  const serviceAxis = ["emotional", "technical", "hybrid"].includes(String(value.serviceAxis))
    ? (value.serviceAxis as ServiceAxis)
    : "emotional";
  const gameId = ["game_lol", "game_valorant", "game_wildrift"].includes(String(value.gameId))
    ? String(value.gameId)
    : null;
  const budgetMin = Number(value.budgetMin);
  const budgetMax = Number(value.budgetMax);
  const budgetMinMinor = Number.isFinite(budgetMin) && budgetMin > 0 ? Math.round(budgetMin * 100) : null;
  const budgetMaxMinor = Number.isFinite(budgetMax) && budgetMax > 0 ? Math.round(budgetMax * 100) : null;
  const requestedStartAt = cleanText(value.requestedStartAt, 80);
  const requestedDurationMinutes = Number(value.requestedDurationMinutes);

  if (contactName.length < 2) errors.contactName = "請填寫至少 2 個字的稱呼。";
  if (contactMethod.length < 3) errors.contactMethod = "請留下可聯絡的 LINE、Discord 或 Email。";
  if (!gameId) errors.gameId = "請選擇一款遊戲。";
  if (!requestedStartAt || Number.isNaN(Date.parse(requestedStartAt))) errors.requestedStartAt = "請選擇希望開始的日期與時間。";
  if (![30, 60, 90, 120].includes(requestedDurationMinutes)) errors.requestedDurationMinutes = "請選擇有效的服務時間。";
  if (budgetMinMinor && budgetMaxMinor && budgetMinMinor > budgetMaxMinor) errors.budget = "最高預算不能低於最低預算。";
  if (notes.length < 15) errors.notes = "請用至少 15 個字描述你希望的體驗。";
  if (value.ageConfirmed !== true) errors.ageConfirmed = "必須確認已滿 18 歲才能送出需求。";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      contactName,
      contactMethod,
      regionCode: value.regionCode === "GLOBAL" ? "GLOBAL" : "TW",
      gameId,
      preferredGender: cleanText(value.preferredGender, 40) || null,
      preferredPersonaTags: cleanStringArray(value.preferredPersonaTags, 8),
      preferredVoiceTags: cleanStringArray(value.preferredVoiceTags, 8),
      serviceAxis,
      budgetMinMinor,
      budgetMaxMinor,
      currency: "TWD",
      requestedStartAt,
      requestedDurationMinutes,
      notes,
      ageConfirmed: true,
    },
  };
}
