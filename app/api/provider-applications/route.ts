import { getDb } from "@/db";
import { auditLogs, providerApplications } from "@/db/schema";
import { apiFailure } from "@/lib/api-response";
import { validateProviderApplication } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "請提供有效的申請資料。" }, { status: 400 });
  }

  const validation = validateProviderApplication(payload);
  if (!validation.ok) {
    return Response.json(
      { error: "申請資料尚未完整。", fields: validation.errors },
      { status: 400 }
    );
  }

  const id = `app_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const data = validation.data;

  try {
    const db = getDb();
    await db.insert(providerApplications).values({
      id,
      applicantName: data.applicantName,
      email: data.email,
      externalContact: data.externalContact,
      regionCode: data.regionCode,
      publicGender: data.publicGender,
      serviceAxes: data.serviceAxes,
      gameIds: data.gameIds,
      personaTags: data.personaTags,
      biography: data.biography,
      profilePhotoUrl: data.profilePhotoUrl,
      voiceSampleUrl: data.voiceSampleUrl,
      skillProofNote: data.skillProofNote,
      ageConfirmed: true,
      policyAcceptedAt: now,
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
    });
    await db.insert(auditLogs).values({
      id: `audit_${crypto.randomUUID()}`,
      actorUserId: null,
      action: "provider_application.submitted",
      entityType: "provider_application",
      entityId: id,
      previousValueJson: null,
      nextValueJson: { status: "submitted", regionCode: data.regionCode },
      reason: "Public application form",
    });
    return Response.json({ id, status: "submitted" }, { status: 201 });
  } catch (error) {
    return apiFailure(error);
  }
}
