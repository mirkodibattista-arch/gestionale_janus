import {
  canReadOrientation,
  type ListFilters,
  maxPage,
  maxSearchLength,
  modalities,
  type OrientationAction,
  type Profile,
  type RequestDetail,
  type RequestListing,
  statuses,
} from "../_shared/janusOrientation.ts";

type Reader = {
  profile(userId: string): Promise<{ role: string } | null>;
  list(filters: ListFilters): Promise<RequestListing>;
  detail(id: string): Promise<RequestDetail | null>;
};

export type Dependencies = {
  origins: ReadonlySet<string>;
  identify(jwt: string): Promise<string | null>;
  read<T>(operation: (reader: Reader) => Promise<T>): Promise<T>;
};

export const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function parseAction(value: unknown): OrientationAction | null {
  if (!value || typeof value !== "object" || !("action" in value)) return null;
  if (value.action === "profile") return { action: "profile" };
  if (
    value.action === "detail" && "id" in value &&
    typeof value.id === "string" &&
    uuidPattern.test(value.id)
  ) {
    return { action: "detail", id: value.id };
  }
  if (value.action !== "list") return null;
  const { page, search, status, modality } = value as Record<string, unknown>;
  if (
    typeof page !== "number" || !Number.isInteger(page) || page < 1 ||
    page > maxPage ||
    typeof search !== "string" || search.length > maxSearchLength ||
    search.includes("\0") ||
    !(status === "" || statuses.some((item) => item === status)) ||
    !(modality === "" || modalities.some((item) => item === modality))
  ) {
    return null;
  }
  return {
    action: "list",
    page,
    search: search.trim(),
    status,
    modality,
  } as OrientationAction;
}

async function readAction(request: Request): Promise<OrientationAction | null> {
  if (
    !request.body ||
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  ) {
    return null;
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let body = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    return parseAction(JSON.parse(body + decoder.decode()));
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function createHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    const allowed = origin !== null && deps.origins.has(origin);
    const headers = new Headers({
      "Cache-Control": "no-store, private",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      Vary: "Origin",
    });
    if (allowed) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set(
        "Access-Control-Allow-Headers",
        "apikey, authorization, content-type",
      );
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    }
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });

    if (origin !== null && !allowed) {
      return json({ error: "origin_denied" }, 403);
    }
    if (request.method === "OPTIONS") {
      if (!allowed) return json({ error: "origin_denied" }, 403);
      headers.delete("Content-Type");
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      headers.set("Allow", "POST, OPTIONS");
      return json({ error: "method_not_allowed" }, 405);
    }
    const token = /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/i.exec(
      request.headers.get("authorization") ?? "",
    )?.[1];
    if (!token || token.length > 8192) {
      return json({ error: "unauthenticated" }, 401);
    }

    try {
      const userId = await deps.identify(token);
      if (!userId || !uuidPattern.test(userId)) {
        return json({ error: "unauthenticated" }, 401);
      }
      const action = await readAction(request);
      if (!action) return json({ error: "invalid_request" }, 400);

      return await deps.read(async (reader) => {
        const profile = await reader.profile(userId);
        if (!profile || !canReadOrientation(profile.role)) {
          return json({ error: "forbidden" }, 403);
        }

        if (action.action === "profile") {
          return json({ id: userId, role: profile.role } satisfies Profile);
        }
        if (action.action === "list") return json(await reader.list(action));
        const result = await reader.detail(action.id);
        return result ? json(result) : json({ error: "not_found" }, 404);
      });
    } catch {
      return json({ error: "unavailable" }, 503);
    }
  };
}
