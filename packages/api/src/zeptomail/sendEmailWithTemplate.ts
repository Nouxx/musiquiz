function buildUrl() {
  return new URL("https://api.zeptomail.eu/v1.1/email/template");
}

function buildHeaders({ token }: { token: string }) {
  return {
    Authorization: `Zoho-enczapikey ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function buildBody({
  templateKey,
  mergeInfo,
  senderAddress,
  senderName,
  destinations,
}: {
  templateKey: string;
  mergeInfo: unknown;
  senderAddress: string;
  senderName: string;
  destinations: { address: string; name: string }[];
}) {
  return JSON.stringify({
    template_key: templateKey,
    merge_info: mergeInfo,
    // ZeptoMail only accepts from.address on a verified domain
    from: { address: senderAddress, name: senderName },
    to: destinations.map((destination) => ({
      email_address: {
        address: destination.address,
        name: destination.name,
      },
    })),
  });
}

/**
 * https://www.zoho.com/zeptomail/help/api/email-templates.html
 */
export async function sendEmailWithTemplate({
  templateKey,
  mergeInfo,
  token,
  senderAddress,
  senderName,
  destinations,
}: {
  templateKey: string;
  mergeInfo: unknown;
  token: string;
  senderAddress: string;
  senderName: string;
  destinations: { address: string; name: string }[];
}) {
  const response = await fetch(buildUrl(), {
    method: "POST",
    headers: buildHeaders({ token }),
    body: buildBody({
      templateKey,
      mergeInfo,
      senderAddress,
      senderName,
      destinations,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `ZeptoMail rejected: ${response.status} ${await response.text()}`,
    );
  }

  return true;
}
