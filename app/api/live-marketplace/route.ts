import { apiFailure } from "@/lib/api-response";
import { LiveMarketplaceError } from "@/lib/live-marketplace";
import {
  acceptProviderInvitation,
  clockInProvider,
  clockOutProvider,
  closeProviderInvitation,
  getLiveMarketplaceSnapshot,
  inviteProvider,
  LiveMarketplaceStoreError,
} from "@/lib/live-marketplace-store";

type ActionPayload = {
  action?: unknown;
  providerId?: unknown;
  providerServiceId?: unknown;
  invitationId?: unknown;
};

function requiredId(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new LiveMarketplaceStoreError("NOT_FOUND", `${label}不可空白。`);
  }
  return value.trim();
}

function actionFailure(error: LiveMarketplaceError | LiveMarketplaceStoreError) {
  const status = error.code === "NOT_FOUND" ? 404 : 409;
  return Response.json({ error: error.message, code: error.code }, { status });
}

export async function GET() {
  try {
    return Response.json(await getLiveMarketplaceSnapshot());
  } catch (error) {
    if (
      error instanceof LiveMarketplaceError ||
      error instanceof LiveMarketplaceStoreError
    ) {
      return actionFailure(error);
    }
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  let payload: ActionPayload;
  try {
    payload = (await request.json()) as ActionPayload;
  } catch {
    return Response.json({ error: "請提供有效操作資料。" }, { status: 400 });
  }

  try {
    switch (payload.action) {
      case "clock_in":
        await clockInProvider(requiredId(payload.providerId, "陪玩師 ID"));
        break;
      case "clock_out":
        await clockOutProvider(requiredId(payload.providerId, "陪玩師 ID"));
        break;
      case "invite":
        await inviteProvider({
          providerId: requiredId(payload.providerId, "陪玩師 ID"),
          providerServiceId: requiredId(
            payload.providerServiceId,
            "服務 ID"
          ),
        });
        break;
      case "accept":
        await acceptProviderInvitation(
          requiredId(payload.invitationId, "邀請 ID")
        );
        break;
      case "decline":
        await closeProviderInvitation(
          requiredId(payload.invitationId, "邀請 ID"),
          "declined"
        );
        break;
      case "expire":
        await closeProviderInvitation(
          requiredId(payload.invitationId, "邀請 ID"),
          "expired"
        );
        break;
      default:
        return Response.json({ error: "不支援這個操作。" }, { status: 400 });
    }

    return Response.json(await getLiveMarketplaceSnapshot());
  } catch (error) {
    if (
      error instanceof LiveMarketplaceError ||
      error instanceof LiveMarketplaceStoreError
    ) {
      return actionFailure(error);
    }
    return apiFailure(error);
  }
}
