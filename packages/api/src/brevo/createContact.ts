function buildUrl() {
  return new URL("https://api.brevo.com/v3/contacts");
}

function buildHeaders({ apiKey }: { apiKey: string }) {
  return {
    "api-key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function buildBody({
  email,
  listIds,
  updateEnabled,
}: {
  email: string;

  listIds?: number[];

  updateEnabled: boolean;
}) {
  return JSON.stringify({ email, listIds, updateEnabled });
}

/**
 * https://developers.brevo.com/reference/create-contact
 */
export async function createContact({
  apiKey,
  email,
  listIds,
  updateEnabled,
}: {
  apiKey: string;
  email: string;
  /** a list is a named group of contacts */
  listIds?: number[];
  /** when set to `true`, prevent the route from returning HTTP 400 when the contact already exists */
  updateEnabled: boolean;
}) {
  const response = await fetch(buildUrl(), {
    method: "POST",
    headers: buildHeaders({ apiKey }),
    body: buildBody({ email, listIds, updateEnabled }),
  });

  if (!response.ok) {
    throw new Error(
      `Brevo rejected: ${response.status} ${await response.text()}`,
    );
  }

  return true;
}
