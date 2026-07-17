export function apiFailure(error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown error";
  console.error("API persistence failure", error);
  return Response.json(
    {
      error: "目前無法安全保存資料，請稍後再試。",
      code: "persistence_unavailable",
      ...(process.env.NODE_ENV === "development" ? { detail } : {}),
    },
    { status: 503 }
  );
}
