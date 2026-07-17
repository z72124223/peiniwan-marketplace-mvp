import { getDb } from "@/db";
import { auditLogs, conciergeRequests } from "@/db/schema";
import { apiFailure } from "@/lib/api-response";
import { validateConciergeRequest } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "請提供有效的派單需求。" }, { status: 400 });
  }

  const validation = validateConciergeRequest(payload);
  if (!validation.ok) {
    return Response.json(
      { error: "需求資料尚未完整。", fields: validation.errors },
      { status: 400 }
    );
  }

  const id = `match_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const data = validation.data;

  try {
    const db = getDb();
    await db.insert(conciergeRequests).values({
      id,
      playerId: null,
      contactName: data.contactName,
      contactMethod: data.contactMethod,
      regionCode: data.regionCode,
      gameId: data.gameId,
      preferredGender: data.preferredGender,
      preferredPersonaTags: data.preferredPersonaTags,
      preferredVoiceTags: data.preferredVoiceTags,
      serviceAxis: data.serviceAxis,
      budgetMinMinor: data.budgetMinMinor,
      budgetMaxMinor: data.budgetMaxMinor,
      currency: data.currency,
      requestedStartAt: data.requestedStartAt,
      requestedDurationMinutes: data.requestedDurationMinutes,
      notes: data.notes,
      ageConfirmed: true,
      ownerStatus: "new",
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(auditLogs).values({
      id: `audit_${crypto.randomUUID()}`,
      actorUserId: null,
      action: "concierge_request.created",
      entityType: "concierge_request",
      entityId: id,
      previousValueJson: null,
      nextValueJson: { ownerStatus: "new", serviceAxis: data.serviceAxis },
      reason: "Public concierge form",
    });
    return Response.json({ id, status: "new" }, { status: 201 });
  } catch (error) {
    return apiFailure(error);
  }
}
