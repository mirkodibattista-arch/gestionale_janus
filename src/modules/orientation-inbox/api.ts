import {
  stagingUrl,
  type OrientationAction,
  type Profile,
  type RequestDetail,
  type RequestListing,
} from "../../../supabase/functions/_shared/janusOrientation";

type Responses = {
  profile: Profile;
  list: RequestListing;
  detail: RequestDetail;
};

export class OrientationError extends Error {
  constructor(readonly status: number) {
    super(status === 403
      ? "Il tuo account non è autorizzato a consultare le richieste."
      : status === 401
        ? "La sessione è scaduta. Accedi di nuovo."
        : status === 404
          ? "La richiesta non è più disponibile."
          : "Il servizio richieste non è disponibile. Riprova.");
  }
}

export async function orientationApi<T extends OrientationAction>(
  key: string,
  token: string,
  payload: T,
  signal: AbortSignal,
): Promise<Responses[T["action"]]> {
  const response = await fetch(`${stagingUrl}/functions/v1/richieste-orientamento`, {
    method: "POST",
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) throw new OrientationError(response.status);
  return response.json();
}
